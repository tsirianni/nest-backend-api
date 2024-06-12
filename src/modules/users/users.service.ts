import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
// import { DateTime } from 'luxon';
import { CreateUserBodyDto, CreateUserIdDto } from './dto/create-user.dto';
import { EmailService } from 'src/common/email/email.service';
import { default as EmailTypes } from '../../common/email/templates/enums';
import { PrismaService } from 'src/common/database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private database: PrismaService,
  ) {}

  async create(createUserDto: CreateUserBodyDto, userId?: CreateUserIdDto) {
    const signUpVerificationCode = crypto.randomInt(0, 1000000);
    // const expiresIn = DateTime.now().plus({ minutes: 5 });

    // Database Call
    // this.database.user

    try {
      await this.emailService.sendMail({
        to: 'sirianni.gf@gmail.com',
        templateId: EmailTypes.SIGN_UP_CODE,
        templateArgs: {
          name: 'John',
          verificationCode: signUpVerificationCode,
        },
      });
    } catch (error) {
      throw error;
    }

    return `User created: ${createUserDto} with ID ${userId}`;
  }
}
