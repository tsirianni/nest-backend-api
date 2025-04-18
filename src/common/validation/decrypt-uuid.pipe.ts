import { Injectable, PipeTransform } from '@nestjs/common';
import { CipherService } from '../cipher/cipher.service';
import BadRequestException from '../exceptions/BadRequest.exception';
import { validate as isValidUUid } from 'uuid';

@Injectable()
export default class DecryptUUIDPipe implements PipeTransform {
  constructor(private readonly cipher: CipherService) {}

  transform(data: Record<string, unknown>): Record<string, unknown> {
    const decrypted = this.cipher.decryptUUID(data.id as string);

    if (!decrypted || !isValidUUid(decrypted)) {
      throw new BadRequestException('Invalid ID', 'params');
    }

    /*
      This will substitute the encrypted UUID for the raw, thus avoiding having to call the decrypt function in every controller
    */
    data.id = decrypted;
    return data;
  }
}
