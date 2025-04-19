import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';

export default class NotFoundException extends BaseException {
  name: string;

  constructor(readonly message: string = 'NotFound') {
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'NotFoundException';
  }
}
