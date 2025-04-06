import { ExecutionContext } from '@nestjs/common';

export default (request: unknown, response?: unknown): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
      getNext: () => jest.fn(),
    }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
};
