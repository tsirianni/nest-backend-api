import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { EnvSchema } from 'src/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

import DatabaseException, { PrismaException } from 'src/common/exceptions/Database.exception';
import { BaseException, UnprocessableEntityException } from 'src/common/exceptions';
import { PrismaService } from 'src/common/database/prisma/prisma.service';
import errorCodes from 'src/common/database/prisma/error-codes';
import { EmailService } from 'src/common/email/email.service';
import errorTypes from 'src/common/exceptions/error-types';
import { handleDatabaseCall } from 'src/common/utils';
import { User } from './entities';
import { UserDTOs } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private config: ConfigService<EnvSchema, true>,
    private database: PrismaService,
  ) {}

  async create(user: UserDTOs['createUser']): Promise<void> {
    const existingVerificationCodes = await handleDatabaseCall(
      this.database.signUpVerificationCode.findMany({
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

    if (!userId) {
      const account = await handleDatabaseCall(this.database.account.create({}));

      const newUser = await handleDatabaseCall(
        this.database.user.create({
          data: {
            name: user.name,
            email: user.email,
            accountId: account!.id,
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
        this.database.signUpVerificationCode.create({
          data: {
            userId,
            code: hashedSignUpVerificationCode,
            email: user.email,
            expiresAt,
          },
        }),
      );
    }

    try {
      await this.emailService.sendMail(user.email, 'SIGN_UP_CODE', {
        name: user.name,
        verificationCode: signUpVerificationCode,
      });
    } catch (error) {
      throw new BaseException(error.message);
    }
  }

  async validateSignUp(signUpInfo: UserDTOs['validateSignUp']): Promise<void> {
    const signUpVerificationCode = await handleDatabaseCall(
      this.database.signUpVerificationCode.findFirst({
        where: {
          email: signUpInfo.email,
          expiresAt: { gte: DateTime.now().toJSDate() },
        },
        include: { user: { select: { id: true } } },
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
      await handleDatabaseCall(
        this.database.user.update({
          data: { verified: true },
          where: { id: signUpVerificationCode.user.id },
        }),
      );

      await handleDatabaseCall(
        // Delete current and possibly expired verification codes
        this.database.signUpVerificationCode.deleteMany({
          where: { email: signUpInfo.email },
        }),
      );
    }
  }

  async findOneById(payload: UserDTOs['findOneById']): Promise<Partial<User>> {
    const desiredParameters = ['name', 'email', 'accountId', 'createdAt'];
    const selectObject: Record<string, boolean> = {};
    desiredParameters.forEach((param) => {
      selectObject[param] = true;
    });

    const user = await handleDatabaseCall(
      this.database.user.findUnique({
        where: { id: payload.id, verified: true },
        select: selectObject,
      }),
    );

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  // Used by Auth
  async findOneByEmail(payload: UserDTOs['findOneByEmail']): Promise<User | null> {
    const user = await handleDatabaseCall(
      this.database.user.findUnique({
        where: { email: payload.email },
      }),
    );

    return user ? user : null;
  }
}
