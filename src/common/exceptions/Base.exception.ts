import { HttpStatus } from '@nestjs/common';

export default class BaseException extends Error {
  readonly statusCode: HttpStatus;
  readonly name: string;

  constructor(errorMessage: string, statusCode?: HttpStatus) {
    super(errorMessage);

    this.statusCode = statusCode ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
    this.name = 'BaseException';
  }

  getStatus() {
    return this.statusCode;
  }
}
