import { Injectable } from '@nestjs/common';
import { CreateUserBodyDto, CreateUserIdDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserBodyDto, userId?: CreateUserIdDto) {
    return `User created: ${createUserDto} with ID ${userId}`;
  }
}
