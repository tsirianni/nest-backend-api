import { HttpStatus } from '@nestjs/common';

type UnprocessableEntityObject = {
  message: string;
  type: string;
};

export default class UnprocessableEntityException extends Error {
  public name;
  public type;

  constructor(error: UnprocessableEntityObject | string) {
    if (typeof error === 'string') {
      super(error);
    } else {
      super(error.message);
      this.type = error.type;
    }

    this.name = 'Unprocessable Entity Exception';
  }

  getStatus() {
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
