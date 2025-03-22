import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies';
import { EnvSchema } from 'src/config';

@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory(config: ConfigService<EnvSchema, true>) {
        const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true });
        const privateKey = config.get('JWT_PRIVATE_KEY', { infer: true });

        return {
          signOptions: { algorithm: 'RS256' },
          publicKey: Buffer.from(publicKey, 'base64'),
          privateKey: Buffer.from(privateKey, 'base64'),
        };
      },
    }),
  ],
})
export class AuthModule {}
