import { Module } from '@nestjs/common';
import { CipherService } from './cipher.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CipherService, ConfigService],
  exports: [CipherService],
})
export class CipherModule {}
