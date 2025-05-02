import { Module } from '@nestjs/common';

import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { S3Service } from '../../common/aws/S3/s3.service';
import { CipherModule } from '../../common/cipher/cipher.module';
import { STSService } from '../../common/aws/STS/sts.service';

@Module({
  controllers: [AttachmentController],
  providers: [AttachmentService, S3Service, STSService],
  exports: [AttachmentService],
  imports: [CipherModule],
})
export class AttachmentModule {}
