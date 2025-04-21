import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';

export default class UnsupportedMediaTypeException extends BaseException {
  name: string;

  constructor(readonly message: string = 'Unsupported Media Type') {
    super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    this.name = 'UnsupportedMediaTypeException';
  }
}
