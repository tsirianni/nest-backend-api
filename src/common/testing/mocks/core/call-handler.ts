import { CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

export default (returnValue: unknown): CallHandler => {
  return {
    handle: jest.fn(() => of(returnValue)),
  };
};
