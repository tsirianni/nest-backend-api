import { S3Service } from '../../common/aws/S3/s3.service';
import { Injectable } from '@nestjs/common';
import { AttachmentDTOs } from './dto';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../../config';
import { BaseException } from '../../common/exceptions';
import { CreateAttachmentResponseDTO } from './dto/create.response.dto';
import { SignedInUserDto } from '../auth/dto/signed-in-user.dto';

@Injectable()
export class AttachmentService {
  constructor(
    private S3Service: S3Service,
    private config: ConfigService<EnvSchema, true>,
  ) {}

  async create(files: AttachmentDTOs['create']['files'], user: SignedInUserDto): Promise<CreateAttachmentResponseDTO[]> {
    if (!files || files.length === 0) {
      throw new BaseException('Files must be defined and must have at least 1 item');
    }

    const promises = files.map(
      async (file) => await this.S3Service.uploadToS3(this.config.get('AWS_ATTACHMENTS_BUCKET'), randomUUID(), file, user),
    );

    const results = await Promise.allSettled(promises);
    const uploadedFiles: CreateAttachmentResponseDTO[] = [];

    results.forEach((result) => {
      if (result.status === 'rejected') {
        throw result.reason;
      }

      uploadedFiles.push(result.value);
    });

    return uploadedFiles;
  }
}
