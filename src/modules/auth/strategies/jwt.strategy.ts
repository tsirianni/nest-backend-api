import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from 'src/modules/users/users.service';
import { EnvSchema } from 'src/config';
import { Request } from 'express';
import { z as zod } from 'zod';

const tokenSchema = zod.object({
  sub: zod.string().uuid(),
  exp: zod.number().refine((exp: number) => exp > Date.now() / 1000, {
    message: 'Token has expired',
  }),
  aud: zod.string(),
  iss: zod.string(),
});

export type TokenSchema = zod.infer<typeof tokenSchema>;

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService<EnvSchema, true>,
    private usersService: UsersService,
  ) {
    const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req.cookies && 'access_token' in req.cookies && req.cookies.access_token.length > 0) {
            return req.cookies.access_token || null;
          }

          throw new UnauthorizedException();
        },
      ]),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      issuer: config.get('API_DOMAIN'),
      audience: config.get('ALLOWED_ORIGINS'),
    });
  }

  async validate(payload: TokenSchema) {
    const { success: isTokenValid } = tokenSchema.safeParse(payload);

    if (!isTokenValid) throw new UnauthorizedException();

    const user = await this.usersService.findOneById({ id: payload.sub });

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
