import { CipherService } from '../../cipher/cipher.service';

type encryptUUID = CipherService['encryptUUID'];
type decryptUUID = CipherService['decryptUUID'];

export type MockCipherService = {
  encryptUUID: jest.Mock<ReturnType<encryptUUID>, Parameters<encryptUUID>>;
  decryptUUID: jest.Mock<ReturnType<decryptUUID>, Parameters<decryptUUID>>;
};

export default () => {
  return {
    encryptUUID: jest.fn<ReturnType<encryptUUID>, Parameters<encryptUUID>>(),
    decryptUUID: jest.fn<ReturnType<encryptUUID>, Parameters<encryptUUID>>(),
  };
};
