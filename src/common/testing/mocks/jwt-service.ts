import { JwtService } from '@nestjs/jwt';

type JwtServiceSign = JwtService['sign'];
type JwtServiceVerifyAsync = JwtService['verifyAsync'];

export type MockJwtService = {
  sign: jest.Mock<ReturnType<JwtServiceSign>, Parameters<JwtServiceSign>>;
  verifyAsync: jest.Mock<ReturnType<JwtServiceVerifyAsync>, Parameters<JwtServiceVerifyAsync>>;
};

export default () => {
  return {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };
};
