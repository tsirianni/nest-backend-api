import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailModule } from 'src/common/email/email.module';
import { PrismaService } from 'src/common/database/prisma/prisma.service';
import { CipherModule } from '../../common/cipher/cipher.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  imports: [EmailModule, CipherModule],
  exports: [UsersService],
})
export class UsersModule {}
