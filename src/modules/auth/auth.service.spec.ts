jest.mock('bcrypt');

import { getMockReq } from '@jest-mock/express';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import * as mocks from '../../common/testing/mocks';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { User } from '../users/entities';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: mocks.MockJwtService;
  let usersService: mocks.MockUsersService;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
  const configService = mocks.createConfigService();

  // Config service variable's returns
  const accessTokenExpirationTime = '1m';
  const refreshTokenExpirationTime = '2m';
  const apiDomain = 'localhost:4000';
  const allowedOrigins = ['http://localhost:3000'];

  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    configService.get.mockReturnValueOnce(accessTokenExpirationTime);
    configService.get.mockReturnValueOnce(refreshTokenExpirationTime);
    configService.get.mockReturnValueOnce(apiDomain);
    configService.get.mockReturnValueOnce(allowedOrigins);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mocks.createJwtService(),
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: UsersService,
          useValue: mocks.createUsersService(),
        },
      ],
    }).compile();

    // Services
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<mocks.MockJwtService>(JwtService);
    usersService = module.get<mocks.MockUsersService>(UsersService);
  });

  describe('signIn', () => {
    let credentials: SignInDTO;
    let mockFindOneByEmailReturn: Pick<User, 'id' | 'password'> | null;

    beforeAll(() => {
      credentials = {
        username: 'myemail@gmail.com',
        password: 'superSecretPassword',
      };

      mockFindOneByEmailReturn = {
        id: '2cd26018-5a24-4bbc-9824-9374007645cf',
        password: 'superSecretPassword',
      };
    });

    it('should throw an UnauthorizedException if no user is found with the given email address', async () => {
      usersService.findOneByEmail.mockResolvedValueOnce(null);

      let receivedError;
      try {
        await authService.signIn(credentials);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.message).toBe('Invalid Credentials');
      expect(receivedError.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should throw an UnauthorizedException if the passwords do not match', async () => {
      usersService.findOneByEmail.mockResolvedValueOnce(mockFindOneByEmailReturn);
      mockedBcrypt.compare.mockImplementationOnce(() => false);

      let receivedError;
      try {
        await authService.signIn(credentials);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.message).toBe('Invalid Credentials');
      expect(receivedError.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    describe('Token validation', () => {
      beforeEach(() => {
        accessToken = '{{accessToken}}';
        refreshToken = '{{refreshToken}}';
      });

      it('should return the tokens', async () => {
        usersService.findOneByEmail.mockResolvedValueOnce(mockFindOneByEmailReturn);
        mockedBcrypt.compare.mockImplementationOnce(() => true);
        jwtService.sign.mockReturnValueOnce(accessToken);
        jwtService.sign.mockReturnValueOnce(refreshToken);

        const response = await authService.signIn(credentials);

        expect(response.access_token).toStrictEqual(accessToken);
        expect(response.refresh_token).toStrictEqual(refreshToken);
      });

      it('should sign the access_token with the correct parameters', async () => {
        usersService.findOneByEmail.mockResolvedValueOnce(mockFindOneByEmailReturn);
        mockedBcrypt.compare.mockImplementationOnce(() => true);
        jwtService.sign.mockReturnValueOnce(accessToken);
        jwtService.sign.mockReturnValueOnce(refreshToken);

        await authService.signIn(credentials);

        expect(jwtService.sign).toHaveBeenNthCalledWith(
          1,
          { sub: mockFindOneByEmailReturn?.id },
          {
            expiresIn: accessTokenExpirationTime,
            issuer: apiDomain,
            audience: allowedOrigins,
          },
        );
      });

      it('should sign the refresh_token with the correct parameters', async () => {
        usersService.findOneByEmail.mockResolvedValueOnce(mockFindOneByEmailReturn);
        mockedBcrypt.compare.mockImplementationOnce(() => true);
        jwtService.sign.mockReturnValueOnce(accessToken);
        jwtService.sign.mockReturnValueOnce(refreshToken);

        await authService.signIn(credentials);

        expect(jwtService.sign).toHaveBeenNthCalledWith(
          2,
          { sub: mockFindOneByEmailReturn?.id },
          {
            expiresIn: refreshTokenExpirationTime,
            issuer: apiDomain,
            audience: allowedOrigins,
          },
        );
      });
    });
  });

  describe('RefreshToken', () => {
    let request: ReturnType<typeof getMockReq>;

    beforeEach(() => {
      request = getMockReq({
        cookies: {
          ['refresh_token']: '{{refreshToken}}',
        },
      });
    });

    it('should throw an UnauthorizedException if the request has no refresh token cookie', async () => {
      let receivedError;
      try {
        // @ts-expect-error Mocked request does not include deprecated object "param"
        await authService.refreshToken(getMockReq());
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.message).toBe('No refresh token provided');
      expect(receivedError.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    describe('Token validation', () => {
      let jwtVerifyAsyncReturn: { sub: string };

      beforeEach(() => {
        accessToken = '{{newAccessToken}}';
        refreshToken = '{{newRefreshToken}}';

        jwtVerifyAsyncReturn = {
          sub: '{{userId}}',
        };
      });

      it('should return the tokens', async () => {
        jwtService.verifyAsync.mockResolvedValueOnce(jwtVerifyAsyncReturn);
        jwtService.sign.mockReturnValueOnce(accessToken);
        jwtService.sign.mockReturnValueOnce(refreshToken);

        // @ts-expect-error Mocked request does not include deprecated object "param"
        const response = await authService.refreshToken(request);

        expect(response.access_token).toStrictEqual(accessToken);
        expect(response.refresh_token).toStrictEqual(refreshToken);
      });

      it('should sign the access_token with the correct parameters', async () => {
        jwtService.verifyAsync.mockResolvedValueOnce(jwtVerifyAsyncReturn);
        jwtService.sign.mockReturnValueOnce(accessToken);
        jwtService.sign.mockReturnValueOnce(refreshToken);

        // @ts-expect-error Mocked request does not include deprecated object "param"
        await authService.refreshToken(request);

        expect(jwtService.sign).toHaveBeenNthCalledWith(
          1,
          { sub: jwtVerifyAsyncReturn.sub },
          {
            expiresIn: accessTokenExpirationTime,
            issuer: apiDomain,
            audience: allowedOrigins,
          },
        );
      });

      it('should sign the refresh_token with the correct parameters', async () => {
        jwtService.verifyAsync.mockResolvedValueOnce(jwtVerifyAsyncReturn);
        jwtService.sign.mockReturnValueOnce(accessToken);
        jwtService.sign.mockReturnValueOnce(refreshToken);

        // @ts-expect-error Mocked request does not include deprecated object "param"
        await authService.refreshToken(request);

        expect(jwtService.sign).toHaveBeenNthCalledWith(
          2,
          { sub: jwtVerifyAsyncReturn.sub },
          {
            expiresIn: refreshTokenExpirationTime,
            issuer: apiDomain,
            audience: allowedOrigins,
          },
        );
      });
    });
  });
});
