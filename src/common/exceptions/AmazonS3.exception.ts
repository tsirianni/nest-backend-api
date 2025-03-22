import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';

export default class AmazonS3Exception extends BaseException {
  name: string;

  constructor(private readonly error: { message: string; name?: string | Record<string, unknown> }) {
    const status = error.name === 'NotFound' ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = status === HttpStatus.NOT_FOUND ? 'Object not found' : error.message;

    super(message, status);

    this.name = 'AmazonS3Exception';
  }

  getStatus(): number {
    return super.getStatus();
  }
}
