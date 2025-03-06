import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseInterceptors } from '@nestjs/common';

import { ValidationInterceptor } from 'src/common/validation/payload-validation.interceptor';
import { default as schemas, UserDTOs } from './dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RouteDoc } from 'src/common/docs';
import * as userDocs from './docs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @RouteDoc(userDocs.signUp)
  @UseInterceptors(new ValidationInterceptor(schemas.createUser))
  async create(@Body() user: UserDTOs['createUser']): Promise<void> {
    await this.usersService.create(user);
  }

  @Post('/validate-sign-up')
  @HttpCode(HttpStatus.OK)
  @RouteDoc(userDocs.validateSignUp)
  @UseInterceptors(new ValidationInterceptor(schemas.validateSignUp))
  async validateSignUp(@Body() signUpInfo: UserDTOs['validateSignUp']): Promise<void> {
    await this.usersService.validateSignUp(signUpInfo);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @RouteDoc(userDocs.findOne)
  @UseInterceptors(new ValidationInterceptor(schemas.findOneById))
  async findOne(@Param() params: UserDTOs['findOneById']): Promise<Partial<User>> {
    return await this.usersService.findOneById({ id: params.id });
  }
}
