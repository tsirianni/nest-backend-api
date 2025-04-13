const mockedLibStorageUploadDone = jest.fn();
jest.mock('@aws-sdk/lib-storage', () => {
  return {
    Upload: jest.fn().mockImplementation(() => ({
      done: mockedLibStorageUploadDone,
    })),
  };
});

const mockedGetSignedUrl = jest.fn();
jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: mockedGetSignedUrl,
  };
});

import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Test, TestingModule } from '@nestjs/testing';
import { mockClient } from 'aws-sdk-client-mock';
import { ConfigService } from '@nestjs/config';
import { Upload } from '@aws-sdk/lib-storage';
import { HttpStatus } from '@nestjs/common';

import type { Attachment } from '../../attachment/attachment.interceptor';
import { default as enums } from '../../../enums';
import * as mocks from '../../testing/mocks';
import { S3Service } from './s3.service';

describe('S3 Service', () => {
  let key: string;
  let bucket: string;
  let s3Service: mocks.MockS3Service;
  const mockedS3Client = mockClient(S3Client);
  const configService = mocks.createConfigService();

  // Mocks config values for constructor
  configService.get.mockReturnValueOnce('{{region}}');
  configService.get.mockReturnValueOnce('{{accessKeyId}}');
  configService.get.mockReturnValueOnce('{{secretAccessKeyId}}');

  beforeEach(async () => {
    mockedS3Client.reset();
    bucket = '{{attachmentsBucket}}';
    key = '{{key}}';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    s3Service = module.get<mocks.MockS3Service>(S3Service);
  });

  describe('uploadS3Object', () => {
    let file: Attachment;

    beforeEach(() => {
      file = {
        mimeType: enums.FILE_MIMETYPE.PDF,
        extension: enums.FILE_EXTENSION.PDF,
        originalName: 'dummy.pdf',
        parsedFilename: 'dummy.pdf',
        size: 10000,
        buffer: Buffer.from('something'),
      };
    });

    it('should attempt to upload the file to S3', async () => {
      await s3Service.uploadS3Object(bucket, key, file);

      expect(Upload).toHaveBeenCalledWith({
        client: expect.any(S3Client),
        params: {
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimeType,
        },
      });
    });

    it('should throw an AmazonS3Exception if an error occurs', async () => {
      mockedLibStorageUploadDone.mockRejectedValueOnce(
        Object.assign(new Error('Access Denied'), {
          name: 'AccessDenied',
          $metadata: {
            httpStatusCode: HttpStatus.FORBIDDEN,
            requestId: 'abc-123',
          },
        }),
      );

      let receivedError;
      try {
        await s3Service.uploadS3Object(bucket, key, file);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.name).toStrictEqual('AmazonS3Exception');
      expect(receivedError.statusCode).toStrictEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getS3ObjectUrl', () => {
    let mockGetSignedUrlReturn: string;

    beforeEach(() => {
      mockGetSignedUrlReturn = 'https://theCorrectUrl.com';
    });

    it('should return the url to download the attachment', async () => {
      mockedS3Client.on(HeadObjectCommand).resolves({});
      mockedGetSignedUrl.mockResolvedValueOnce(mockGetSignedUrlReturn);

      const response = await s3Service.getS3ObjectUrl(bucket, key);

      expect(response).toStrictEqual({ url: mockGetSignedUrlReturn });
    });

    it('should call "getSignedUrl" with the correct arguments', async () => {
      mockedS3Client.on(HeadObjectCommand).resolves({});
      mockedGetSignedUrl.mockResolvedValueOnce(mockGetSignedUrlReturn);

      await s3Service.getS3ObjectUrl(bucket, key);

      expect(mockedGetSignedUrl).toHaveBeenCalledWith(expect.any(S3Client), expect.any(GetObjectCommand), { expiresIn: 60000 });
    });

    it('should throw an AmazonS3Exception if the object is not found', async () => {
      mockedS3Client.on(HeadObjectCommand).rejects(Object.assign(new Error('AWS ERROR'), { name: 'NotFound' }));

      let receivedError;
      try {
        await s3Service.getS3ObjectUrl(bucket, key);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.name).toStrictEqual('AmazonS3Exception');
      expect(receivedError.message).toStrictEqual('Object not found');
      expect(receivedError.statusCode).toStrictEqual(HttpStatus.NOT_FOUND);
    });

    it('should throw an AmazonS3Exception if an error occurs when signing the url', async () => {
      mockedS3Client.on(HeadObjectCommand).resolves({});
      mockedGetSignedUrl.mockRejectedValueOnce(new Error('AWS ERROR'));

      let receivedError;
      try {
        await s3Service.getS3ObjectUrl(bucket, key);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.name).toStrictEqual('AmazonS3Exception');
      expect(receivedError.statusCode).toStrictEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('deleteS3Object', () => {
    it('should attempt to delete the s3 object', async () => {
      mockedS3Client.on(DeleteObjectCommand).resolves({});

      await s3Service.deleteS3Object(bucket, key);

      expect(mockedS3Client.commandCalls(DeleteObjectCommand)).toHaveLength(1);
      expect(mockedS3Client.commandCalls(DeleteObjectCommand)[0].args[0].input).toEqual({
        Bucket: bucket,
        Key: key,
      });
    });

    it('should throw an AmazonS3Exception if an error occurs', async () => {
      mockedS3Client.on(DeleteObjectCommand).rejects(new Error('AWS ERROR'));

      let receivedError;
      try {
        await s3Service.deleteS3Object(bucket, key);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.name).toStrictEqual('AmazonS3Exception');
      expect(receivedError.statusCode).toStrictEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
