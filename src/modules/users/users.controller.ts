import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { DecryptUUIDPipe, ValidationInterceptor } from '../../common/validation';
import { default as schemas, UserDTOs } from './dto';
import { UsersService } from './users.service';
import { User } from '../../common/entities';
import { RouteDoc } from '../..//common/docs';
import * as userDocs from './docs';
import { JWTAuthGuard } from '../auth/guards';

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
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.OK)
  @RouteDoc(userDocs.findOne)
  @UseInterceptors(new ValidationInterceptor(schemas.findOneById))
  async findOne(@Param(DecryptUUIDPipe) params: UserDTOs['findOneById']): Promise<Partial<User>> {
    return await this.usersService.findOneById({ id: params.id });
  }
}
