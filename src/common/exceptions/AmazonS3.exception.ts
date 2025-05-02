import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';
import { InvalidObjectState, NoSuchKey, NotFound, S3ServiceException } from '@aws-sdk/client-s3';

export type AmazonS3Error = S3ServiceException | NotFound | NoSuchKey | InvalidObjectState;

export default class AmazonS3Exception extends BaseException {
  constructor(private readonly error: AmazonS3Error | string) {
    const isNotFoundError: boolean = error instanceof NotFound || error instanceof NoSuchKey;
    const message: string = typeof error === 'string' ? error : isNotFoundError ? 'Object not found' : error.message;
    const status = isNotFoundError ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;

    super(message, status);
  }
}
