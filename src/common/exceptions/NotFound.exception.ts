import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';

export default class NotFoundException extends BaseException {
  constructor(readonly message: string = 'NotFound') {
    super(message, HttpStatus.NOT_FOUND);
  }
}
