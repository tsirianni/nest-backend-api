import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';

import type { Attachment } from '../../attachment/attachment.interceptor';
import { AmazonS3Error } from '../../exceptions/AmazonS3.exception';
import { AmazonS3Exception } from '../../exceptions';
import { STSService } from '../STS/sts.service';

@Injectable()
export class S3Service {
  private client: S3Client | undefined;

  constructor(private stsService: STSService) {}

  async uploadS3Object(bucket: string, key: string, file: Attachment): Promise<void> {
    const client = await this.getClient();

    try {
      const s3Upload = new Upload({
        client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimeType,
        },
      });

      await s3Upload.done();
    } catch (error) {
      throw new AmazonS3Exception(`Unable to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getS3ObjectUrl(bucket: string, key: string): Promise<{ url: string }> {
    let url;
    const s3Client = await this.getClient();

    try {
      /* Helps to identify if the object exists in the bucket */
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await s3Client.send(headCommand);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      url = await getSignedUrl(s3Client, command, { expiresIn: 60000 }); // 60s
    } catch (error) {
      throw new AmazonS3Exception(error as AmazonS3Error);
    }

    return { url };
  }

  async deleteS3Object(bucket: string, key: string): Promise<void> {
    const s3Client = await this.getClient();
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      throw new AmazonS3Exception(error as AmazonS3Error);
    }
  }

  private async getClient(): Promise<S3Client> {
    if (!this.client) {
      const temporaryCredentials = await this.stsService.assumeRole(`S3-Session`);

      if (!temporaryCredentials) throw new Error('Unable to obtain credentials');

      this.client = new S3Client({
        credentials: {
          accessKeyId: temporaryCredentials.accessKeyId,
          secretAccessKey: temporaryCredentials.secretAccessKey,
          sessionToken: temporaryCredentials.sessionToken,
        },
      });
    }

    return this.client;
  }
}
