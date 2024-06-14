import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

import { PrismaService } from 'src/common/database/prisma/prisma.service';
import { default as emailTypes } from '../../common/email/templates/enums';
import { EmailService } from 'src/common/email/email.service';
import { CreateUserDto } from './dto/create.dto';
import { ValidateSignUp } from './dto/validate-sign-up';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private config: ConfigService<EnvSchema, true>,
    private database: PrismaService,
  ) {}

  async create(user: CreateUserDto) {
    // TODO create utils for validation of arguments
    if (!user.name) {
      throw new Error('name is not defined');
    }

    if (!user.email) {
      throw new Error('email is not defined');
    }

    if (!user.password) {
      throw new Error('password is not defined');
    }

    if (!user.profileType) {
      throw new Error('profileType is not defined');
    }

    // TODO verify if there is already an existing valid code before attempting again

    const bcryptRounds = Number(
      this.config.get('BCRYPT_ROUNDS', { infer: true }),
    );

    const hashedPassword = await bcrypt.hash(user.password, bcryptRounds);
    const signUpVerificationCode = crypto.randomInt(0, 1000000);
    const hashedSignUpVerificationCode = await bcrypt.hash(
      String(signUpVerificationCode),
      bcryptRounds,
    );
    const expiresAt = DateTime.now().plus({ minutes: 5 }).toJSDate();

    // TODO create DatabaseError class adn DB call Wrapper (try/catch)

    let newUser;
    try {
      newUser = await this.database.user.create({
        data: {
          name: user.name,
          email: user.email,
          userTypeId: user.profileType,
          password: hashedPassword,
        },
      });

      await this.database.signUpVerificationCode.create({
        data: {
          userId: newUser.id,
          code: hashedSignUpVerificationCode,
          email: user.email,
          expiresAt,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }

    // TODO send email
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
      throw new Error(error.message);
    }

    return;
  }

  async validateSignUp(signUpInfo: ValidateSignUp) {
    if (!signUpInfo.email) {
      throw new Error('email is not defined');
    }

    if (!signUpInfo.code) {
      throw new Error('code is not defined');
    }

    let signUpVerificationCode;
    try {
      signUpVerificationCode =
        await this.database.signUpVerificationCode.findFirst({
          where: { email: signUpInfo.email },
          include: { user: { select: { id: true } } },
        });
    } catch (error: any) {
      throw new Error(error.message);
    }

    if (!signUpVerificationCode) {
      // TODO create custom UnprocessableEntityError class
      throw new UnprocessableEntityException(
        'The provided verification code is either invalid or expired',
      );
    }

    const isProvidedCodeCorrect = await bcrypt.compare(
      signUpInfo.code,
      signUpVerificationCode.code,
    );

    if (isProvidedCodeCorrect) {
      try {
        await this.database.user.update({
          data: { verified: true },
          where: { id: signUpVerificationCode.user.id },
        });

        await this.database.signUpVerificationCode.delete({
          where: { id: signUpVerificationCode.id },
        });
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  }

  async findOneById(userId: string) {
    const user = await this.database.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException();
    }
  }

  // Used by Auth
  async findOneByEmail(email: string) {
    const user = await this.database.user.findUnique({
      where: { email },
    });

    return user ? user : null;
  }
}
