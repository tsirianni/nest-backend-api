import { Controller, Post, Body, UseInterceptors, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserBodyDto,
  CreateUserIdDto,
  createUserDtoSchema,
} from './dto/create-user.dto';
import { ValidationInterceptor } from 'src/common/validation/payload-validation.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/:id')
  @UseInterceptors(new ValidationInterceptor(createUserDtoSchema))
  create(
    @Body() createUserDto: CreateUserBodyDto,
    @Param('id') userId: CreateUserIdDto,
  ) {
    try {
      return this.usersService.create(createUserDto, userId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
