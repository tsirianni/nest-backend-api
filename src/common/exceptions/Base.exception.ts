import { HttpException, HttpStatus } from '@nestjs/common';

export default class BaseException extends HttpException {
  constructor(errorMessage: string, statusCode?: HttpStatus) {
    super(errorMessage, statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
