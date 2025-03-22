import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';

import AttachmentException from '../Attachment.exception';

interface FormattedException {
  statusCode?: HttpStatus;
  timestamp?: string;
  message?: string;
  type?: string;
}

@Catch(AttachmentException)
export default class AttachmentExceptionFilter implements ExceptionFilter {
  formatException(exception: AttachmentException, ctx: HttpArgumentsHost) {
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

  catch(exception: AttachmentException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    return this.formatException(exception, ctx);
  }
}
