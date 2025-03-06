import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
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
  private readonly logger = new Logger(HttpExceptionFilter.name);

  formatException(exception: HttpException | DatabaseException, ctx: HttpArgumentsHost) {
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
    if (!(exception instanceof UnauthorizedException || exception instanceof ConflictException)) {
      this.logger.error(exception.message, exception.stack);
    }

    return response.status(status).json(formattedException);
  }

  catch(exception: HttpException | DatabaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    return this.formatException(exception, ctx);
  }
}
