import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { S3Service } from '../../common/aws/S3/s3.service';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { CipherModule } from '../../common/cipher/cipher.module';

@Module({
  controllers: [AttachmentController],
  providers: [AttachmentService, S3Service, PrismaService],
  exports: [AttachmentService],
  imports: [CipherModule],
})
export class AttachmentModule {}
