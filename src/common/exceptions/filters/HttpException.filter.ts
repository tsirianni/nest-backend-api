import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import DatabaseException from '../Database.exception';

interface FormattedException {
  message?: string;
  timestamp?: string;
  statusCode?: HttpStatus;
}

@Catch(HttpException, DatabaseException)
export default class HttpExceptionFilter implements ExceptionFilter {
  formatException(exception: any, ctx: HttpArgumentsHost) {
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

    const formattedException: FormattedException = {
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    if (exception.message && status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      formattedException.message = exception.message;
    }

    // Log and return error
    if (
      !(
        exception instanceof UnauthorizedException ||
        exception instanceof ConflictException
      )
    ) {
      // eslint-disable-next-line no-console
      console.log(exception);
    }

    return response.status(status).json(formattedException);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const formattedException = this.formatException(exception, ctx);

    return formattedException;
  }
}
