const mockedBcrypt = { hash: jest.fn(), compare: jest.fn() };
jest.mock('bcrypt', () => mockedBcrypt);

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Account, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';

import { errorCodes, PrismaService } from '../../common/database/prisma';
import { CipherService } from '../../common/cipher/cipher.service';
import {
  ConflictException,
  DatabaseException,
  errorTypes,
  NotFoundException,
  UnprocessableEntityException,
} from '../../common/exceptions';
import * as mocks from '../../common/testing/mocks';
import * as entities from '../../common/entities';
import { EmailService } from '../../common/email';
import { UsersService } from './users.service';
import { UserDTOs } from './dto';

describe('usersService', () => {
  let usersService: UsersService;
  let cipherService: mocks.MockCipherService;
  let configService: ReturnType<typeof mocks.createConfigService>;
  let emailService: mocks.MockEmailService;
  let database: typeof mocks.prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: CipherService, useValue: mocks.createCipherService() },
        {
          provide: ConfigService,
          useValue: mocks.createConfigService(),
        },
        {
          provide: EmailService,
          useValue: mocks.createEmailService(),
        },
        {
          provide: PrismaService,
          useValue: mocks.prismaMock,
        },
      ],
    }).compile();

    // Services
    usersService = module.get(UsersService);
    cipherService = module.get<mocks.MockCipherService>(CipherService);
    configService = module.get<ReturnType<typeof mocks.createConfigService>>(ConfigService);
    emailService = module.get<mocks.MockEmailService>(EmailService);
    database = module.get<typeof mocks.prismaMock>(PrismaService);

    // Necessary to test logic inside the transaction
    jest.spyOn(database, '$transaction').mockImplementation((callback) => {
      return callback(database);
    });
  });

  describe('create', () => {
    const bcryptRounds = '10';
    let payload: UserDTOs['createUser'];
    let mockCreateAccountReturn: Account;
    let mockCreateUserReturn: entities.User;
    const hashedPassword = '{{hashedPassword}}';
    let mockFindManyVerificationCodesReturn: Pick<entities.SignUpVerificationCode, 'id' | 'userId' | 'expiresAt'>[];

    beforeEach(() => {
      payload = {
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'superSecretPassword',
      };

      mockFindManyVerificationCodesReturn = [
        {
          id: '1924456e-b690-414c-9824-f772e9ffe3f7',
          userId: '1a65b1ce-8720-4cc0-ae15-076fdbddc16f',
          expiresAt: DateTime.now().plus({ minute: 10 }).toJSDate(),
        },
      ];

      mockCreateAccountReturn = {
        id: 'f4f3a929-eba3-4ad4-9efb-d836122d70e4',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockCreateUserReturn = {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        id: '5d97245f-043b-4053-a442-75e44decfcde',
        accountId: mockCreateAccountReturn.id,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
    });

    it('should throw an UnprocessableEntityException if the use still has one or more active sign-up validation codes', async () => {
      database.signUpVerificationCode.findMany.mockResolvedValueOnce(
        mockFindManyVerificationCodesReturn as entities.SignUpVerificationCode[],
      );

      try {
        await usersService.create(payload);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);

        const receivedError = error as UnprocessableEntityException;
        expect(receivedError.name).toBe('UnprocessableEntityException');
        expect(receivedError.message).toStrictEqual(
          'There is still a non-expired sign-up code attached to this email. Please verify your account with it',
        );
        expect(receivedError.type).toStrictEqual(errorTypes.USERS.CREATE.SIGN_UP_VALIDATION_CODE_STILL_ACTIVE);
      }
    });

    it('should throw a ConflictException if there is already a user registered with the provided email address', async () => {
      database.signUpVerificationCode.findMany.mockResolvedValueOnce([]);
      configService.get.mockReturnValueOnce(bcryptRounds);
      mockedBcrypt.hash.mockImplementationOnce(() => Promise.resolve(hashedPassword));
      database.account.create.mockResolvedValueOnce(mockCreateAccountReturn);
      const mockedPrismaError = new Prisma.PrismaClientKnownRequestError('Unique Constraint Error', {
        code: errorCodes.UNIQUE_CONSTRAINT_FAILED,
        clientVersion: '1.0.0',
      });
      database.user.create.mockRejectedValueOnce(mockedPrismaError);

      try {
        await usersService.create(payload);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);

        const receivedError = error as ConflictException;
        expect(receivedError.message).toStrictEqual('There is already an user registered with the provided email address');
      }
    });

    it('should throw a DatabaseException if a different error occurs when creating the user', async () => {
      database.signUpVerificationCode.findMany.mockResolvedValueOnce([]);
      configService.get.mockReturnValueOnce(bcryptRounds);
      mockedBcrypt.hash.mockImplementationOnce(() => Promise.resolve(hashedPassword));
      database.account.create.mockResolvedValueOnce(mockCreateAccountReturn);
      const mockedPrismaError = new Prisma.PrismaClientKnownRequestError('Null constraint violation on the {constraint}', {
        code: errorCodes.NULL_CONSTRAINT_FAILED,
        clientVersion: '1.0.0',
      });
      database.user.create.mockRejectedValueOnce(mockedPrismaError);

      try {
        await usersService.create(payload);
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);

        const receivedError = error as DatabaseException;
        expect(receivedError.message).toStrictEqual(mockedPrismaError.message);
      }
    });

    it('should attempt to send the sign-up code to the provided email address', async () => {
      database.signUpVerificationCode.findMany.mockResolvedValueOnce([]);
      configService.get.mockReturnValueOnce(bcryptRounds);
      mockedBcrypt.hash.mockImplementationOnce(() => Promise.resolve(hashedPassword));
      database.account.create.mockResolvedValueOnce(mockCreateAccountReturn);
      database.user.create.mockResolvedValueOnce(mockCreateUserReturn);

      await usersService.create(payload);

      expect(emailService.sendMail).toHaveBeenCalled();
      expect(emailService.sendMail).toHaveBeenCalledWith(payload.email, 'SIGN_UP_CODE', {
        name: payload.name,
        verificationCode: expect.any(Number) as number,
      });
    });

    describe('Transaction validation', () => {
      it('should open the transaction with an isolation level of REPEATABLE READ', async () => {
        database.signUpVerificationCode.findMany.mockResolvedValueOnce([]);
        configService.get.mockReturnValueOnce(bcryptRounds);
        mockedBcrypt.hash.mockImplementationOnce(() => Promise.resolve(hashedPassword));
        database.account.create.mockResolvedValueOnce(mockCreateAccountReturn);
        database.user.create.mockResolvedValueOnce(mockCreateUserReturn);

        await usersService.create(payload);

        expect(database.$transaction.mock.calls[0][1]).toEqual({
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        });
      });
    });
  });

  describe('validateSignUp', () => {
    const userId = '8dd2d615-b2a2-43f9-a02d-5450f67b40c0';
    let payload: UserDTOs['validateSignUp'];
    let mockSignUpVerificationCodeFindFirstReturn: entities.SignUpVerificationCode;

    beforeEach(() => {
      payload = {
        email: 'john.doe@email.com',
        code: '554879',
      };

      mockSignUpVerificationCodeFindFirstReturn = {
        id: 'f304fb24-5817-4248-be50-2c2d506427fc',
        email: payload.email,
        code: payload.code,
        userId,
        expiresAt: DateTime.now().plus({ minute: 5 }).toJSDate(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
    });

    it('should throw an UnprocessableEntityError if no verification code is found', async () => {
      database.signUpVerificationCode.findFirst.mockResolvedValueOnce(null);

      try {
        await usersService.validateSignUp(payload);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);

        const receivedError = error as UnprocessableEntityException;
        expect(receivedError.name).toStrictEqual('UnprocessableEntityException');
        expect(receivedError.message).toStrictEqual('The provided verification code is either invalid or expired');
        expect(receivedError.type).toStrictEqual(errorTypes.USERS.SIGN_UP_VALIDATION_CODE.CODE_INVALID_OR_EXPIRED);
      }
    });

    it('should attempt to update the user to mark it as verified', async () => {
      database.signUpVerificationCode.findFirst.mockResolvedValueOnce(mockSignUpVerificationCodeFindFirstReturn);
      mockedBcrypt.compare.mockImplementationOnce(() => Promise.resolve(true));

      await usersService.validateSignUp(payload);

      expect(database.user.update.mock.calls[0]).toContainEqual({
        data: { verified: true },
        where: { id: mockSignUpVerificationCodeFindFirstReturn.userId },
      });
    });

    it('should clean up the verification codes', async () => {
      database.signUpVerificationCode.findFirst.mockResolvedValueOnce(mockSignUpVerificationCodeFindFirstReturn);
      mockedBcrypt.compare.mockImplementationOnce(() => Promise.resolve(true));

      await usersService.validateSignUp(payload);

      expect(database.signUpVerificationCode.deleteMany.mock.calls[0]).toContainEqual({
        where: { email: payload.email },
      });
    });

    describe('Transaction validation', () => {
      it('should open the transaction with an isolation level of REPEATABLE READ', async () => {
        database.signUpVerificationCode.findFirst.mockResolvedValueOnce(mockSignUpVerificationCodeFindFirstReturn);
        mockedBcrypt.compare.mockImplementationOnce(() => Promise.resolve(true));

        await usersService.validateSignUp(payload);

        expect(database.$transaction.mock.calls[0][1]).toStrictEqual({
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        });
      });
    });
  });

  describe('findOneById', () => {
    let payload: UserDTOs['findOneById'];
    let mockFindUniqueReturn: entities.User;
    const encryptedId = '{{encryptedID}}';
    const encryptedAccountId = '{{encryptedAccountId}}';
    let expectedResponse: entities.User;

    beforeEach(() => {
      payload = {
        id: '7240f422-d2bb-4ba5-9f71-43dc492ab5b0',
      };

      mockFindUniqueReturn = {
        id: payload.id,
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'superSecretPassword',
        accountId: 'f946a8a9-87f5-453c-866a-fc85f350a3f4',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      expectedResponse = {
        ...mockFindUniqueReturn,
        id: encryptedId,
        accountId: encryptedAccountId,
      };
    });

    it('should throw a NotFondException if no user is found', async () => {
      database.user.findUnique.mockResolvedValueOnce(null);

      try {
        await usersService.findOneById(payload);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return the user properly formatted', async () => {
      database.user.findUnique.mockResolvedValueOnce(mockFindUniqueReturn);
      cipherService.encryptUUID.mockReturnValueOnce(encryptedId);
      cipherService.encryptUUID.mockReturnValueOnce(encryptedAccountId);

      const response = await usersService.findOneById(payload);

      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe('findOneByEmail', () => {
    let payload: UserDTOs['findOneByEmail'];
    let mockFindUniqueReturn: entities.User;
    let expectedResponse: entities.User;

    beforeEach(() => {
      payload = {
        email: 'john.doe@email.com',
      };

      mockFindUniqueReturn = {
        id: '235c53d0-184f-4d4b-b11b-01f81b82298a',
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'superSecretPassword',
        accountId: 'f946a8a9-87f5-453c-866a-fc85f350a3f4',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      expectedResponse = {
        ...mockFindUniqueReturn,
      };
    });

    it('should return null if no user is found', async () => {
      database.user.findUnique.mockResolvedValueOnce(null);

      const response = await usersService.findOneByEmail(payload);

      expect(response).toStrictEqual(null);
    });

    it('should return the user properly formatted', async () => {
      database.user.findUnique.mockResolvedValueOnce(mockFindUniqueReturn);

      const response = await usersService.findOneByEmail(payload);

      expect(response).toStrictEqual(expectedResponse);
    });
  });
});
