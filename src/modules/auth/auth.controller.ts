import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { ValidationInterceptor } from 'src/common/validation/payload-validation.interceptor';
import { SignIn, signInSchema } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { RouteDoc } from 'src/common/docs';
import * as docs from './docs';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @RouteDoc(docs.login)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new ValidationInterceptor(signInSchema))
  async signIn(@Body() body: SignIn) {
    const token = await this.authService.signIn(body);
    return { access_token: token };
  }
}
