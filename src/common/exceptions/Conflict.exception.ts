import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';

export default class ConflictException extends BaseException {
  constructor(readonly message: string = 'Conflict') {
    super(message, HttpStatus.CONFLICT);
  }
}
