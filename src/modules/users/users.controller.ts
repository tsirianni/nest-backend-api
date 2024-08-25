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
import {
  FindOneUserById,
  findOneUserByIdSchema,
} from './dto/find-one-by-id.dto';
import { ValidateSignUp, validateSignUpSchema } from './dto/validate-sign-up';
import { RouteDoc } from 'src/common/docs';
import * as userDocs from './docs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @RouteDoc(userDocs.signUp)
  @UseInterceptors(new ValidationInterceptor(createUserDtoSchema))
  async create(@Body() user: CreateUserDto): Promise<void> {
    await this.usersService.create(user);
  }

  @Post('/validate-sign-up')
  @HttpCode(HttpStatus.OK)
  @RouteDoc(userDocs.validateSignUp)
  @UseInterceptors(new ValidationInterceptor(validateSignUpSchema))
  async validateSignUp(@Body() signUpInfo: ValidateSignUp) {
    await this.usersService.validateSignUp(signUpInfo);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @RouteDoc(userDocs.findOne)
  @UseInterceptors(new ValidationInterceptor(findOneUserByIdSchema))
  async findOne(@Param() params: FindOneUserById): Promise<any> {
    return await this.usersService.findOneById({ id: params.id });
  }
}
