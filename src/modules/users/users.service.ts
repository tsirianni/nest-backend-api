import { Injectable } from '@nestjs/common';
import { CreateUserBodyDto, CreateUserIdDto } from './dto/create-user.dto';
import { EmailService } from 'src/common/email/email.service';

@Injectable()
export class UsersService {
  constructor(private emailService: EmailService) {}

  async create(createUserDto: CreateUserBodyDto, userId?: CreateUserIdDto) {
    // Database Call

    // try {
    //   await this.emailService.sendMail({
    //     to: 'email@gmail.com',
    //     subject: 'A new user has been created',
    //     html: `<h1>Hello World</h1>`,
    //   });
    // } catch (error) {
    //   throw error;
    // }

    return `User created: ${createUserDto} with ID ${userId}`;
  }
}
