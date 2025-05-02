import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { STSService } from '../STS/sts.service';

@Module({
  providers: [S3Service],
  exports: [S3Service],
  imports: [STSService],
})
export class S3Module {}
