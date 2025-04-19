import { HttpStatus } from '@nestjs/common';
import BaseException from './Base.exception';

type ErrorDetails = {
  message: string;
  type: string;
  filenames?: string[];
};

export default class AttachmentUploadException extends BaseException {
  name: string;
  type: string;
  filenames?: string[];

  constructor(error: ErrorDetails) {
    super(error.message, HttpStatus.BAD_REQUEST);

    this.name = 'AttachmentUploadException';
    this.type = error.type;

    if (error.filenames) {
      this.filenames = error.filenames;
    }
  }
}
