import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
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

@Catch(HttpException, DatabaseException, Error)
export default class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  formatException(exception: HttpException | DatabaseException, ctx: HttpArgumentsHost) {
    const response = ctx.getResponse<Response>();
    const status: HttpStatus = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

    // Log and return error
    if (
      !(
        exception instanceof UnauthorizedException ||
        exception instanceof ConflictException ||
        exception instanceof NotFoundException
      )
    ) {
      this.logger.error(exception.message, exception.stack);
    }

    if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      const formattedException: FormattedException = {
        statusCode: status,
        timestamp: new Date().toISOString(),
      };

      if (exception.message) {
        formattedException.message = exception.message;
      }

      return response.status(status).json(formattedException);
    } else {
      return response.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  catch(exception: HttpException | DatabaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    return this.formatException(exception, ctx);
  }
}
