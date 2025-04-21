import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { createConfigService } from '../testing/mocks';
import { CipherService } from './cipher.service';
import { BaseException } from '../exceptions';

describe('CipherService', () => {
  const uuid = '19e7fc5a-baf9-4c17-99a1-c13bd9dc5e50';
  let cipherService: CipherService;
  const configService = createConfigService();

  beforeEach(async () => {
    configService.get.mockReturnValueOnce('aes-256-cbc');
    configService.get.mockReturnValueOnce(crypto.randomBytes(32).toString('hex'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CipherService,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    cipherService = module.get<CipherService>(CipherService);
  });

  describe('encryptUUID', () => {
    it('should throw a BaseException if the input is not a valid uuid', () => {
      try {
        cipherService.encryptUUID('558975');
      } catch (error) {
        expect(error).toBeInstanceOf(BaseException);
      }
    });

    it('should return a URL safe encrypted value', () => {
      const encryptedValue = cipherService.encryptUUID(uuid);

      expect(encryptedValue).not.toMatch(/\+/g);
      expect(encryptedValue).not.toMatch(/\//g);
      expect(encryptedValue).not.toMatch(/=+$/);
    });
  });

  describe('decryptUUID', () => {
    let encryptedValue: string;

    beforeEach(() => {
      encryptedValue = cipherService.encryptUUID(uuid);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return the original uuid', () => {
      const decryptedValue = cipherService.decryptUUID(encryptedValue);

      expect(decryptedValue).toStrictEqual(uuid);
    });

    it('should return null if it is not possible to decrypt the value', () => {
      const createDecipherivSpy = jest.spyOn(crypto, 'createDecipheriv');
      createDecipherivSpy.mockImplementation(() => {
        throw new Error('Some crypto error');
      });

      const decryptedValue = cipherService.decryptUUID(encryptedValue);

      expect(decryptedValue).toStrictEqual(null);
    });
  });
});
