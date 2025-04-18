import { getMockReq, getMockRes } from '@jest-mock/express';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import * as mocks from '../../common/testing/mocks';
import { AuthController } from './auth.controller';
import { AuthService, Tokens } from './auth.service';
import { AuthDTOs } from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: mocks.MockAuthService;
  const configService = mocks.createConfigService();
  let tokenSets: Tokens[];
  let mockedResponse: ReturnType<typeof getMockRes>;

  beforeEach(async () => {
    /* Has to be set before the creation of the testing module, otherwise resolves to undefined in the constructor */
    configService.get.mockReturnValue('production');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mocks.createAuthService(),
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<mocks.MockAuthService>(AuthService);

    tokenSets = [
      { access_token: '{{TOKEN-1}}', refresh_token: '{{TOKEN-2}}' },
      { access_token: '{{TOKEN-3}}', refresh_token: '{{TOKEN-4}}' },
    ];

    mockedResponse = getMockRes();
  });

  afterEach(() => {
    mockedResponse.clearMockRes();
  });

  describe('signIn', () => {
    let mockSignInReturn: Tokens;
    let credentials: AuthDTOs['signIn'];
    let requestResponse: Response;
    let cookieFunctionSpy: jest.SpyInstance;

    beforeEach(() => {
      mockSignInReturn = tokenSets[0];
      credentials = { username: 'user', password: 'password' };
      requestResponse = mockedResponse.res;

      cookieFunctionSpy = jest.spyOn(requestResponse, 'cookie').mockClear();
    });

    describe('Response Validation', () => {
      it('should return a success message', async () => {
        authService.signIn.mockResolvedValueOnce(mockSignInReturn);

        const response = await controller.signIn(credentials, requestResponse);

        expect(response).toStrictEqual({ message: 'Success' });
      });
    });

    describe('Cookies Validation', () => {
      it('should set the access_token cookie correctly', async () => {
        authService.signIn.mockResolvedValueOnce(mockSignInReturn);

        await controller.signIn(credentials, requestResponse);

        expect(cookieFunctionSpy).toHaveBeenNthCalledWith(1, 'access_token', mockSignInReturn.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
      });

      it('should set the refresh_token cookie correctly', async () => {
        authService.signIn.mockResolvedValueOnce(mockSignInReturn);

        await controller.signIn(credentials, requestResponse);

        expect(cookieFunctionSpy).toHaveBeenNthCalledWith(2, 'refresh_token', mockSignInReturn.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/auth/refresh',
        });
      });
    });
  });

  describe('refreshAccessToken', () => {
    let request: Request;
    let requestResponse: Response;
    let mockRefreshTokenReturn: Tokens;
    let cookieFunctionSpy: jest.SpyInstance;

    beforeEach(() => {
      mockRefreshTokenReturn = tokenSets[1];
      requestResponse = mockedResponse.res;
      cookieFunctionSpy = jest.spyOn(requestResponse, 'cookie').mockClear();

      request = getMockReq({
        cookies: {
          ['access_token']: tokenSets[0].access_token,
          ['refresh_token']: tokenSets[0].refresh_token,
        },
      });
    });

    describe('Response Validation', () => {
      it('should return a success message', async () => {
        authService.refreshToken.mockResolvedValueOnce(mockRefreshTokenReturn);

        const response = await controller.refreshAccessToken(request, requestResponse);

        expect(response).toStrictEqual({ message: 'Success' });
      });

      describe('Cookies Validation', () => {
        it('should set the access_token cookie correctly', async () => {
          authService.refreshToken.mockResolvedValueOnce(mockRefreshTokenReturn);

          await controller.refreshAccessToken(request, requestResponse);

          expect(cookieFunctionSpy).toHaveBeenNthCalledWith(1, 'access_token', mockRefreshTokenReturn.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
        });

        it('should set the refresh_token cookie correctly', async () => {
          authService.refreshToken.mockResolvedValueOnce(mockRefreshTokenReturn);

          await controller.refreshAccessToken(request, requestResponse);

          expect(cookieFunctionSpy).toHaveBeenNthCalledWith(2, 'refresh_token', mockRefreshTokenReturn.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/auth/refresh',
          });
        });
      });
    });
  });

  describe('logout', () => {
    let requestResponse: Response;
    let clearCookieFunctionSpy: jest.SpyInstance;

    beforeEach(() => {
      requestResponse = mockedResponse.res;
      clearCookieFunctionSpy = jest.spyOn(requestResponse, 'clearCookie').mockClear();
    });

    it('should return a success message', () => {
      const response = controller.logout(requestResponse);

      expect(response).toStrictEqual({ message: 'Logged out successfully' });
    });

    describe('Cookies Validation', () => {
      it('should clear the access_token cookie correctly', () => {
        controller.logout(requestResponse);

        expect(clearCookieFunctionSpy).toHaveBeenNthCalledWith(1, 'access_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
      });

      it('should clear the refresh_token cookie correctly', () => {
        controller.logout(requestResponse);

        expect(clearCookieFunctionSpy).toHaveBeenNthCalledWith(2, 'refresh_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/auth/refresh',
        });
      });
    });
  });
});
