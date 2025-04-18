import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { Request } from 'express';
import * as path from 'node:path';
import * as busboy from 'busboy';

import { AttachmentUploadException, errorTypes } from '../exceptions';
import { Observable } from 'rxjs';

type ConstructorSchema = {
  maxFileSizeInBytes: number;
};

export type Attachment = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  size: number;
  originalName: string;
  parsedFilename: string;
};

@Injectable()
export default class AttachmentInterceptor implements NestInterceptor {
  private readonly maxFileSizeInBytes: number;

  constructor({ maxFileSizeInBytes }: ConstructorSchema) {
    this.maxFileSizeInBytes = maxFileSizeInBytes;
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.headers['content-type']?.includes('multipart/form-data')) {
      throw new AttachmentUploadException({
        message: 'Invalid content-type',
        type: errorTypes.ATTACHMENTS.CREATE.INVALID_CONTENT_TYPE,
      });
    }

    const processedUploadedFilesPromise = new Promise<void>((resolve, reject) => {
      const files: Attachment[] = [];
      const bb = busboy({
        headers: request.headers,
      });

      bb.on('file', (_name, stream, info) => {
        const bufferChunks: Buffer[] = [];
        let fileSize = new BigNumber(0);
        const { filename, mimeType } = info;

        const parsedFilename = this.parseFilename(filename);
        const extension = this.getFileExtension(filename);

        stream.on('data', (chunk: Buffer) => {
          fileSize = fileSize.plus(chunk.length);
          bufferChunks.push(chunk);
        });

        stream.on('close', () => {
          files.push({
            buffer: Buffer.concat(bufferChunks),
            mimeType,
            extension,
            size: fileSize.toNumber(),
            originalName: filename,
            parsedFilename,
          });
        });
      });

      bb.on('close', () => {
        const filesWhichExceededSizeLimit: string[] = [];
        let attachmentException;

        files.forEach((file) => {
          if (new BigNumber(file.size).isGreaterThan(new BigNumber(this.maxFileSizeInBytes))) {
            filesWhichExceededSizeLimit.push(file.originalName);
          }
        });

        if (filesWhichExceededSizeLimit.length > 0) {
          attachmentException = new AttachmentUploadException({
            message: 'One or more files have exceeded the allowed file size limit',
            type: errorTypes.ATTACHMENTS.CREATE.FILE_SIZE_LIMIT_EXCEEDED,
            filenames: filesWhichExceededSizeLimit,
          });
        }

        if (attachmentException) {
          reject(attachmentException);
        }

        request.body = { files };
        resolve();
      });

      request.pipe(bb);
    });

    await processedUploadedFilesPromise;
    return next.handle();
  }

  /* Feel free to add your custom naming parsing logic, this is just an example */
  parseFilename(filename: string): string {
    return filename.replace(/,/g, '.').trim();
  }

  getFileExtension(filename: string): string {
    return path.extname(filename).replace('.', '');
  }
}
