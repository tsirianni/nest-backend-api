import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

import { default as emailTypes } from '../../common/email/templates/enums';
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

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private config: ConfigService<EnvSchema, true>,
    private database: PrismaService,
  ) {}

  async create(user: CreateUserDto) {
    // TODO verify if there is already an existing valid code before attempting again

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

    const newUser = await handleDatabaseCall(
      this.database.user.create({
        data: {
          name: user.name,
          email: user.email,
          userTypeId: user.profileType,
          password: hashedPassword,
        },
      }),
    );

    if (newUser) {
      await handleDatabaseCall(
        this.database.signUpVerificationCode.create({
          data: {
            userId: newUser.id,
            code: hashedSignUpVerificationCode,
            email: user.email,
            expiresAt,
          },
        }),
      );
    }

    try {
      await this.emailService.sendMail({
        to: user.email,
        templateId: emailTypes.SIGN_UP_CODE,
        templateArgs: {
          name: user.name,
          verificationCode: signUpVerificationCode,
        },
      });
    } catch (error: any) {
      throw new BaseException(error.message);
    }

    return;
  }

  async validateSignUp(signUpInfo: ValidateSignUp) {
    const signUpVerificationCode = await handleDatabaseCall(
      this.database.signUpVerificationCode.findFirst({
        where: { email: signUpInfo.email },
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
        this.database.signUpVerificationCode.delete({
          where: { id: signUpVerificationCode.id },
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
