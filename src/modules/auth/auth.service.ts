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
  constructor(
    private jwt: JwtService,
    private usersService: UsersService,
    private config: ConfigService<EnvSchema, true>,
  ) {}

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
        expiresIn: this.config.get('ACCESS_TOKEN_EXPIRATION_TIME'),
        issuer: this.config.get('API_DOMAIN'),
        audience: this.config.get('ALLOWED_ORIGINS'),
      },
    );

    const refresh_token = this.jwt.sign(
      { sub: user.id },
      {
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRATION_TIME'),
        issuer: this.config.get('API_DOMAIN'),
        audience: this.config.get('ALLOWED_ORIGINS'),
      },
    );

    return { access_token, refresh_token };
  }

  async refreshToken(request: Request): Promise<Tokens> {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { sub } = await this.jwt.verifyAsync(refreshToken, {
      algorithms: ['RS256'],
    });

    const access_token = this.jwt.sign(
      { sub },
      {
        expiresIn: this.config.get('ACCESS_TOKEN_EXPIRATION_TIME'),
        issuer: this.config.get('API_DOMAIN'),
        audience: this.config.get('ALLOWED_ORIGINS'),
      },
    );

    const refresh_token = this.jwt.sign(
      { sub },
      {
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRATION_TIME'),
        issuer: this.config.get('API_DOMAIN'),
        audience: this.config.get('ALLOWED_ORIGINS'),
      },
    );

    return { access_token, refresh_token };
  }
}
