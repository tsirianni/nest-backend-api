import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { z as zod } from 'zod';

import { UnauthorizedException } from '../../../common/exceptions';
import { PrismaService } from '../../../common/database/prisma/';
import { EnvSchema } from '../../../config';

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
    private database: PrismaService,
  ) {
    const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          return req.cookies.access_token as string | null;
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

    const user = await this.database.user.findUnique({
      where: { id: payload.sub },
      select: this.database.createSelectObject(['id', 'name', 'email', 'accountId', 'createdAt']),
    });

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
