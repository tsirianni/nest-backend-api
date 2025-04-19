import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';

type UnprocessableEntityObject = {
  message: string;
  type: string;
};

export default class UnprocessableEntityException extends BaseException {
  public name;
  public type;

  constructor(error: UnprocessableEntityObject | string) {
    if (typeof error === 'string') {
      super(error, HttpStatus.UNPROCESSABLE_ENTITY);
    } else {
      super(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
      this.type = error.type;
    }

    this.name = 'UnprocessableEntityException';
  }
}
