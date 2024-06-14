import { HttpStatus } from '@nestjs/common';

export default class BaseException extends Error {
  constructor(errorMessage: string) {
    super(errorMessage);
  }

  getStatus() {
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
