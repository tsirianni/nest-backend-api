import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';

import AttachmentUploadException from '../AttachmentUploadException';

interface FormattedException {
  statusCode?: HttpStatus;
  timestamp?: string;
  message?: string;
  type?: string;
}

@Catch(AttachmentUploadException)
export default class AttachmentUploadExceptionFilter implements ExceptionFilter {
  formatException(exception: AttachmentUploadException, ctx: HttpArgumentsHost) {
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const formattedException: FormattedException = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
      type: exception.type,
    };

    return response.status(status).json(formattedException);
  }

  catch(exception: AttachmentUploadException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    return this.formatException(exception, ctx);
  }
}
