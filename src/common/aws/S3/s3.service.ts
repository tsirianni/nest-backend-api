import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';

import type { Attachment } from '../../attachment/attachment.interceptor';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AmazonS3Exception } from '../../exceptions';
import { EnvSchema } from '../../../config';

@Injectable()
export class S3Service {
  private client: S3Client | undefined;

  constructor(private config: ConfigService<EnvSchema, true>) {}

  async uploadS3Object(bucket: string, key: string, file: Attachment): Promise<void> {
    try {
      const s3Upload = new Upload({
        client: this.getClient(),
        params: {
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimeType,
        },
      });

      await s3Upload.done();
    } catch (error) {
      throw new AmazonS3Exception(error);
    }
  }

  async getS3ObjectUrl(bucket: string, key: string): Promise<{ url: string }> {
    let url;
    try {
      /* Helps to identify if the object exists in the bucket */
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const s3Client = this.getClient();
      await s3Client.send(headCommand);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      url = await getSignedUrl(s3Client, command, { expiresIn: 60000 }); // 60s
    } catch (error) {
      throw new AmazonS3Exception(error);
    }

    return { url };
  }

  async deleteS3Object(bucket: string, key: string): Promise<void> {
    const s3Client = this.getClient();
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      throw new AmazonS3Exception(error);
    }
  }

  private getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: this.config.get('AWS_REGION'),
        credentials: {
          accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
        },
      });
    }
    return this.client;
  }
}
