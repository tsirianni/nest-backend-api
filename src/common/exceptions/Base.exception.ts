import { HttpException, HttpStatus } from '@nestjs/common';

export default class BaseException extends HttpException {
  readonly statusCode: HttpStatus;
  readonly name: string;

  constructor(errorMessage: string, statusCode?: HttpStatus) {
    super(errorMessage, statusCode || HttpStatus.INTERNAL_SERVER_ERROR);

    this.statusCode = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    this.name = 'BaseException';
  }

  getStatus() {
    return this.statusCode;
  }
}
