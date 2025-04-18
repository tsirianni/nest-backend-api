import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { SignInDTO } from './dto/sign-in.dto';
import { EnvSchema } from '../../config';

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

@Injectable()
export class AuthService {
  private readonly accessTokenExpirationTime: string;
  private readonly refreshTokenExpirationTime: string;
  private readonly apiDomain: string;
  private readonly allowedOrigins: string[];

  constructor(
    private jwt: JwtService,
    private usersService: UsersService,
    private config: ConfigService<EnvSchema, true>,
  ) {
    this.accessTokenExpirationTime = this.config.get('ACCESS_TOKEN_EXPIRATION_TIME');
    this.refreshTokenExpirationTime = this.config.get('REFRESH_TOKEN_EXPIRATION_TIME');
    this.apiDomain = this.config.get('API_DOMAIN');
    this.allowedOrigins = this.config.get('ALLOWED_ORIGINS');
  }

  async signIn({ username, password }: SignInDTO): Promise<Tokens> {
    const user = await this.usersService.findOneByEmail({ email: username });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const access_token = this.jwt.sign(
      { sub: user.id },
      {
        expiresIn: this.accessTokenExpirationTime,
        issuer: this.apiDomain,
        audience: this.allowedOrigins,
      },
    );

    const refresh_token = this.jwt.sign(
      { sub: user.id },
      {
        expiresIn: this.refreshTokenExpirationTime,
        issuer: this.apiDomain,
        audience: this.allowedOrigins,
      },
    );

    return { access_token, refresh_token };
  }

  async refreshToken(request: Request): Promise<Tokens> {
    const refreshToken = request.cookies['refresh_token'] as string;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { sub }: { sub: string } = await this.jwt.verifyAsync(refreshToken, {
      algorithms: ['RS256'],
    });

    const access_token = this.jwt.sign(
      { sub },
      {
        expiresIn: this.accessTokenExpirationTime,
        issuer: this.apiDomain,
        audience: this.allowedOrigins,
      },
    );

    const refresh_token = this.jwt.sign(
      { sub },
      {
        expiresIn: this.refreshTokenExpirationTime,
        issuer: this.apiDomain,
        audience: this.allowedOrigins,
      },
    );

    return { access_token, refresh_token };
  }
}
