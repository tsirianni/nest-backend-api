import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailModule } from '../../common/email/email.module';
import { PrismaService } from '../../common/database/prisma';
import { CipherModule } from '../../common/cipher/cipher.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  imports: [EmailModule, CipherModule],
  exports: [UsersService],
})
export class UsersModule {}
