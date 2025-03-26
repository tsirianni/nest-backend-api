import { jest } from '@jest/globals';
import { CallHandler, ExecutionContext } from '@nestjs/common';

export default () => {
  return jest.fn((_ctx: ExecutionContext, next: CallHandler) => next.handle());
};
