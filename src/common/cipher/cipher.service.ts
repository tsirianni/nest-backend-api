import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { validate as isValidUUid } from 'uuid';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { BaseException } from '../exceptions';
import { EnvSchema } from '../../config';

@Injectable()
export class CipherService {
  private readonly key: Buffer;
  private readonly algorithm: string;

  constructor(private config: ConfigService<EnvSchema, true>) {
    this.algorithm = config.get('UUID_CIPHER_ALGORITHM');
    const keyHex: string = config.get('UUID_CIPHER_KEY');

    this.key = Buffer.from(keyHex, 'hex');
  }

  encryptUUID(uuid: string): string {
    if (!isValidUUid(uuid)) {
      throw new BaseException('Invalid UUID');
    }

    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(uuid, 'utf8'), cipher.final()]);

    const combined = Buffer.concat([iv, encrypted]);
    return toBase64Url(combined);
  }

  decryptUUID(base64url: string): string | null {
    try {
      const combined = fromBase64Url(base64url);
      const iv = combined.subarray(0, 16);
      const encrypted = combined.subarray(16);

      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

      return decrypted.toString('utf8');
    } catch {
      return null;
    }
  }
}

/* The functions below iam to make the end result URL safe, meaning no +, / or = characters that could interfere with the URL parsing */
function toBase64Url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(base64url: string): Buffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  return Buffer.from(base64, 'base64');
}
