import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { EnvSchema } from 'src/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

import { PrismaService } from 'src/common/database/prisma/prisma.service';
import {
  BaseException,
  UnprocessableEntityException,
} from 'src/common/exceptions';
import { EmailService } from 'src/common/email/email.service';
import errorTypes from 'src/common/exceptions/error-types';
import { ValidateSignUp } from './dto/validate-sign-up';
import { handleDatabaseCall } from 'src/common/utils';
import { CreateUserDto } from './dto/create.dto';
import { FindOneUserById } from './dto/find-one-by-id.dto';
import { FindOneUserByEmail } from './dto/find-one-by-email.dto';
import DatabaseException, {
  PrismaException,
} from 'src/common/exceptions/Database.exception';

import errorCodes from 'src/common/database/prisma/error-codes';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private config: ConfigService<EnvSchema, true>,
    private database: PrismaService,
  ) {}

  async create(user: CreateUserDto) {
    const existingVerificationCodes = await handleDatabaseCall(
      this.database.signUpVerificationCode.findMany({
        where: {
          email: user.email,
        },
      }),
    );

    const currentlyValidVerificationCode = existingVerificationCodes?.find(
      (verificationCode) =>
        DateTime.fromJSDate(verificationCode.expiresAt) > DateTime.now(),
    );

    if (currentlyValidVerificationCode) {
      throw new UnprocessableEntityException({
        message:
          'There is still a non-expired sign-up code attached to this email. Please verify your account with it',
        type: errorTypes.USERS.CREATE.SIGN_UP_VALIDATION_CODE_STILL_ACTIVE,
      });
    }

    const bcryptRounds = Number(
      this.config.get('BCRYPT_ROUNDS', { infer: true }),
    );

    const hashedPassword = await bcrypt.hash(user.password, bcryptRounds);
    const expiresAt = DateTime.now().plus({ minutes: 5 }).toJSDate();
    const signUpVerificationCode = crypto.randomInt(0, 1000000);
    const hashedSignUpVerificationCode = await bcrypt.hash(
      String(signUpVerificationCode),
      bcryptRounds,
    );

    let userId = existingVerificationCodes?.length
      ? existingVerificationCodes[0].userId
      : undefined;

    if (!userId) {
      const newUser = await handleDatabaseCall(
        this.database.user.create({
          data: {
            name: user.name,
            email: user.email,
            userTypeId: user.profileType,
            password: hashedPassword,
          },
        }),
        function (error: PrismaException) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === errorCodes.UNIQUE_CONSTRAINT_FAILED) {
              throw new ConflictException(
                'There is already an user registered with the provided email address',
              );
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
    } catch (error: any) {
      throw new BaseException(error.message);
    }

    return;
  }

  async validateSignUp(signUpInfo: ValidateSignUp) {
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

    const isProvidedCodeCorrect = await bcrypt.compare(
      signUpInfo.code,
      signUpVerificationCode.code,
    );

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

  async findOneById(payload: FindOneUserById) {
    const user = handleDatabaseCall(
      this.database.user.findUnique({ where: { id: payload.id } }),
    );

    if (!user) {
      throw new NotFoundException();
    }
  }

  // Used by Auth
  async findOneByEmail(payload: FindOneUserByEmail) {
    const user = await handleDatabaseCall(
      this.database.user.findUnique({
        where: { email: payload.email },
      }),
    );

    return user ? user : null;
  }
}
