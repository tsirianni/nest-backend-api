import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';

export default class UnauthorizedException extends BaseException {
  constructor(readonly message: string = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
