import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Param,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDtoSchema, CreateUserDto } from './dto/create.dto';
import { ValidationInterceptor } from 'src/common/validation/payload-validation.interceptor';
import { FindOneUserParams, findOneUserSchema } from './dto/find-one.dto';
import { ValidateSignUp, validateSignUpSchema } from './dto/validate-sign-up';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(new ValidationInterceptor(createUserDtoSchema))
  async create(@Body() user: CreateUserDto): Promise<void> {
    await this.usersService.create(user);
  }

  @Post('/validate-sign-up')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new ValidationInterceptor(validateSignUpSchema))
  async validateSignUp(@Body() signUpInfo: ValidateSignUp) {
    await this.usersService.validateSignUp(signUpInfo);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new ValidationInterceptor(findOneUserSchema))
  async findOne(@Param('id') params: FindOneUserParams): Promise<any> {
    // TODO update return with User entity
    return this.usersService.findOneById(params.id);
  }
}
