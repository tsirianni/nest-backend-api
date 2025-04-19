import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

import {
  BaseException,
  ConflictException,
  DatabaseException,
  errorTypes,
  NotFoundException,
  PrismaException,
  UnprocessableEntityException,
} from '../../common/exceptions';
import { errorCodes, PrismaService } from '../../common/database/prisma/';
import { CipherService } from '../../common/cipher/cipher.service';
import { getErrorMessage, handleDatabaseCall } from '../../common/utils';
import { EmailService } from '../../common/email';
import { EnvSchema } from '../../config';
import { Account, User } from '../../common/entities';
import { UserDTOs } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private config: ConfigService<EnvSchema, true>,
    private database: PrismaService,
    private cipherService: CipherService,
  ) {}

  async create(user: UserDTOs['createUser']): Promise<void> {
    const existingVerificationCodes = await handleDatabaseCall(
      this.database.signUpVerificationCode.findMany({
        select: this.database.createSelectObject(['id', 'userId', 'expiresAt']),
        where: {
          email: user.email,
        },
      }),
    );

    const currentlyValidVerificationCode = existingVerificationCodes?.find(
      (verificationCode) => DateTime.fromJSDate(verificationCode.expiresAt) > DateTime.now(),
    );

    if (currentlyValidVerificationCode) {
      throw new UnprocessableEntityException({
        message: 'There is still a non-expired sign-up code attached to this email. Please verify your account with it',
        type: errorTypes.USERS.CREATE.SIGN_UP_VALIDATION_CODE_STILL_ACTIVE,
      });
    }

    const bcryptRounds = Number(this.config.get('BCRYPT_ROUNDS', { infer: true }));
    const hashedPassword = await bcrypt.hash(user.password, bcryptRounds);
    const expiresAt = DateTime.now().plus({ minutes: 5 }).toJSDate();
    const signUpVerificationCode = crypto.randomInt(0, 1000000);
    const hashedSignUpVerificationCode = await bcrypt.hash(String(signUpVerificationCode), bcryptRounds);
    let userId = existingVerificationCodes?.length ? existingVerificationCodes[0].userId : undefined;

    await this.database.$transaction(
      async (PrismaClient) => {
        if (!userId) {
          const account = (await handleDatabaseCall(PrismaClient.account.create({}))) as Account;

          const newUser = await handleDatabaseCall(
            PrismaClient.user.create({
              data: {
                name: user.name,
                email: user.email,
                accountId: account.id,
                password: hashedPassword,
              },
            }),
            function (error: PrismaException) {
              if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === errorCodes.UNIQUE_CONSTRAINT_FAILED) {
                  throw new ConflictException('There is already an user registered with the provided email address');
                }
              }

              throw new DatabaseException(error);
            },
          );

          if (newUser) {
            userId = newUser.id;
          }
        }

        if (userId) {
          await handleDatabaseCall(
            PrismaClient.signUpVerificationCode.create({
              data: {
                userId,
                code: hashedSignUpVerificationCode,
                email: user.email,
                expiresAt,
              },
            }),
          );

          try {
            await this.emailService.sendMail(user.email, 'SIGN_UP_CODE', {
              name: user.name,
              verificationCode: signUpVerificationCode,
            });
          } catch (error) {
            throw new BaseException(getErrorMessage(error));
          }
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      },
    );
  }

  async validateSignUp(signUpInfo: UserDTOs['validateSignUp']): Promise<void> {
    const signUpVerificationCode = await handleDatabaseCall(
      this.database.signUpVerificationCode.findFirst({
        where: {
          email: signUpInfo.email,
          expiresAt: { gte: DateTime.now().toJSDate() },
        },
      }),
    );

    if (!signUpVerificationCode) {
      throw new UnprocessableEntityException({
        message: 'The provided verification code is either invalid or expired',
        type: errorTypes.USERS.SIGN_UP_VALIDATION_CODE.CODE_INVALID_OR_EXPIRED,
      });
    }

    const isProvidedCodeCorrect = await bcrypt.compare(signUpInfo.code, signUpVerificationCode.code);

    if (isProvidedCodeCorrect) {
      await this.database.$transaction(
        async (prismaClient) => {
          await handleDatabaseCall(
            prismaClient.user.update({
              data: { verified: true },
              where: { id: signUpVerificationCode.userId },
            }),
          );

          await handleDatabaseCall(
            // Delete current and possibly expired verification codes
            prismaClient.signUpVerificationCode.deleteMany({
              where: { email: signUpInfo.email },
            }),
          );
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        },
      );
    }
  }

  async findOneById(payload: UserDTOs['findOneById']): Promise<Partial<User>> {
    const user = await handleDatabaseCall(
      this.database.user.findUnique({
        where: { id: payload.id, verified: true },
        select: this.database.createSelectObject(['id', 'name', 'email', 'accountId', 'createdAt']),
      }),
    );

    if (!user) {
      throw new NotFoundException();
    }

    return {
      ...user,
      id: this.cipherService.encryptUUID(user.id),
      accountId: this.cipherService.encryptUUID(user.accountId),
    };
  }

  // Used by Auth
  async findOneByEmail(payload: UserDTOs['findOneByEmail']): Promise<Pick<User, 'id' | 'password'> | null> {
    const user = await handleDatabaseCall(
      this.database.user.findUnique({
        where: { email: payload.email },
        select: this.database.createSelectObject(['id', 'password']),
      }),
    );

    return user ? user : null;
  }
}
