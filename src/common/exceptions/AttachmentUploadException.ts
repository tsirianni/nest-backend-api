import { HttpException, HttpStatus } from '@nestjs/common';

type ErrorDetails = {
  message: string;
  type: string;
  filenames?: string[];
};

export default class AttachmentUploadException extends HttpException {
  name: string;
  type: string;
  filenames?: string[];

  constructor(error: ErrorDetails) {
    super(error.message, HttpStatus.BAD_REQUEST);

    this.name = 'AttachmentUploadException';
    this.type = error?.type;

    if (error.filenames) {
      this.filenames = error.filenames;
    }
  }

  getStatus(): number {
    return super.getStatus();
  }
}
