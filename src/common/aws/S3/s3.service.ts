import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../../../config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Attachment } from '../../attachment/attachment.interceptor';
import { SignedInUserDto } from '../../../modules/auth/dto/signed-in-user.dto';
import { handleDatabaseCall } from '../../utils';

@Injectable()
export class S3Service {
  private readonly client: S3Client;

  constructor(
    private config: ConfigService<EnvSchema, true>,
    private database: PrismaService,
  ) {
    this.client = new S3Client({
      region: this.config.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadToS3(
    bucket: string,
    key: string,
    file: Attachment,
    user: SignedInUserDto,
  ): Promise<{
    id: string;
    key: string;
  }> {
    const s3Upload = new Upload({
      client: this.client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
      },
    });

    await s3Upload.done();

    const uploadedFile = await handleDatabaseCall(
      this.database.uploadedFile.create({
        data: {
          id: randomUUID(),
          key,
          owner: user.accountId,
          name: file.parsedFilename,
          extension: file.extension,
          originalName: file.originalName,
        },
      }),
    );

    return { id: uploadedFile!.id, key };
  }
}
