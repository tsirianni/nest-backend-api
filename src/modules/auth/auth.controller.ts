import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { ValidationInterceptor } from '../../common/validation';
import { AuthDTOs, default as schemas } from './dto';
import { AuthService } from './auth.service';
import { ENVIRONMENTS } from '../../enums';
import { RouteDoc } from '../../common/docs';
import { EnvSchema } from '../../config';
import * as docs from './docs';

@Controller('auth')
export class AuthController {
  private readonly setSecure: boolean;

  constructor(
    private authService: AuthService,
    private config: ConfigService<EnvSchema, true>,
  ) {
    this.setSecure = this.config.get('NODE_ENV') === ENVIRONMENTS.PRODUCTION;
  }

  @Post('/login')
  @RouteDoc(docs.login)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new ValidationInterceptor(schemas.signIn))
  async signIn(@Body() body: AuthDTOs['signIn'], @Res({ passthrough: true }) response: Response) {
    const { access_token, refresh_token } = await this.authService.signIn(body);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: this.setSecure,
      sameSite: 'strict',
    });

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: this.setSecure,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { message: 'Success' };
  }

  @Post('/refresh')
  @RouteDoc(docs.refresh)
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const { access_token, refresh_token } = await this.authService.refreshToken(request);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: this.setSecure,
      sameSite: 'strict',
    });

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: this.setSecure,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { message: 'Success' };
  }

  @Post('/logout')
  @RouteDoc(docs.logout)
  @HttpCode(HttpStatus.OK)
  logout(@Res() response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: this.setSecure,
      sameSite: 'strict',
    });

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.setSecure,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { message: 'Logged out successfully' };
  }
}
