import { jest } from '@jest/globals';

export default () => {
  return {
    get: jest.fn<(parameter: string) => string | string[]>(),
  };
};
