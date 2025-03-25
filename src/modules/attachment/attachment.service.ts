import { S3Service } from '../../common/aws/S3/s3.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AttachmentDTOs, AttachmentResponseDTOs } from './dto';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../../config';
import { BaseException, DatabaseException } from '../../common/exceptions';
import { CreateAttachmentResponseDTO } from './dto/create.response.dto';
import { SignedInUserDTO } from '../auth/dto/signed-in-user.dto';
import { handleDatabaseCall, isDatabaseException } from '../../common/utils';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { CipherService } from '../../common/cipher/cipher.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttachmentService {
  constructor(
    private S3Service: S3Service,
    private database: PrismaService,
    private config: ConfigService<EnvSchema, true>,
    private cipherService: CipherService,
  ) {}

  async create(files: AttachmentDTOs['create']['files'], user: SignedInUserDTO): Promise<AttachmentResponseDTOs['create'][]> {
    if (!files || files.length === 0) {
      throw new BaseException('Files must be defined and must have at least 1 item');
    }

    const promises = files.map(async (file): Promise<AttachmentResponseDTOs['create']> => {
      const key = randomUUID();
      let uploadedFile;

      try {
        uploadedFile = await this.database.$transaction(
          async (prismaClient) => {
            const uploadRecord = await handleDatabaseCall(
              prismaClient.uploadedFile.create({
                data: {
                  id: randomUUID(),
                  key,
                  owner: user.accountId,
                  name: file.parsedFilename,
                  extension: file.extension,
                  originalName: file.originalName,
                },
              }),
            );

            await this.S3Service.uploadS3Object(this.config.get('AWS_ATTACHMENTS_BUCKET'), key, file);

            return uploadRecord;
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
          },
        );
      } catch (error) {
        if (isDatabaseException(error)) throw new DatabaseException(error);
        else throw error;
      }

      return { id: this.cipherService.encryptUUID(uploadedFile!.id), key: this.cipherService.encryptUUID(key) };
    });

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

  async download(attachmentId: string, user: SignedInUserDTO): Promise<AttachmentResponseDTOs['download']> {
    const attachment = await handleDatabaseCall(
      this.database.uploadedFile.findUnique({
        select: {
          key: true,
        },
        where: { id: attachmentId, owner: user.accountId },
      }),
    );

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return this.S3Service.getS3ObjectUrl(this.config.get('AWS_ATTACHMENTS_BUCKET'), attachment.key);
  }

  async delete(attachmentId: string, user: SignedInUserDTO): Promise<void> {
    const attachment = await handleDatabaseCall(
      this.database.uploadedFile.findUnique({
        select: {
          key: true,
        },
        where: { id: attachmentId, owner: user.accountId },
      }),
    );

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    try {
      await this.database.$transaction<void>(
        async (prismaClient) => {
          await prismaClient.uploadedFile.delete({
            where: { id: attachmentId, owner: user.accountId },
          });

          await this.S3Service.deleteS3Object(this.config.get('AWS_ATTACHMENTS_BUCKET'), attachment.key);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        },
      );
    } catch (error) {
      if (isDatabaseException(error)) throw new DatabaseException(error);
      else throw error;
    }
  }
}
