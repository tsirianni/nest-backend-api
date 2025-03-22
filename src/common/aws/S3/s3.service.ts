import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../../../config';
import { Attachment } from '../../attachment/attachment.interceptor';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AmazonS3Exception } from '../../exceptions';

@Injectable()
export class S3Service {
  private readonly client: S3Client;

  constructor(private config: ConfigService<EnvSchema, true>) {
    this.client = new S3Client({
      region: this.config.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadS3Object(bucket: string, key: string, file: Attachment): Promise<void> {
    try {
      const s3Upload = new Upload({
        client: this.client,
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
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      /* Helps to identify if the object exists in the bucket */
      await this.client.send(headCommand);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      url = await getSignedUrl(this.client, command, { expiresIn: 60000 }); // 60s
    } catch (error) {
      throw new AmazonS3Exception(error);
    }

    return { url };
  }

  async deleteS3Object(bucket: string, key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      throw new AmazonS3Exception(error);
    }
  }
}
