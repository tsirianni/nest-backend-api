import { AuthService } from '../../../modules/auth/auth.service';

type signIn = AuthService['signIn'];
type refreshToken = AuthService['refreshToken'];

export type MockAuthService = {
  signIn: jest.Mock<ReturnType<signIn>, Parameters<signIn>>;
  refreshToken: jest.Mock<ReturnType<refreshToken>, Parameters<refreshToken>>;
};

export default () => {
  return {
    signIn: jest.fn(),
    refreshToken: jest.fn(),
  };
};
