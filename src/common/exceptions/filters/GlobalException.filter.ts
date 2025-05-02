import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

import * as errors from '../index';

interface FormattedException {
  message?: string;
  timestamp?: string;
  statusCode?: HttpStatus;
}

type Exception = { statusCode?: HttpStatus; status?: HttpStatus; name: string; message?: string; stack?: string };

@Catch()
export default class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  formatException(exception: Exception, response: Response) {
    const status = this.getStatusCode(exception);
    this.logException(exception);

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

  catch(exception: Exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return this.formatException(exception, response);
  }

  logException(exception: Exception) {
    const errorToAvoidLogging = [
      errors.UnauthorizedException.name,
      errors.ConflictException.name,
      errors.NotFoundException.name,
      errors.UnprocessableEntityException.name,
      errors.UnsupportedMediaTypeException.name,
    ];

    const shouldSkipLogging = errorToAvoidLogging.some((errorClass) => errorClass === exception.name);

    if (!shouldSkipLogging) {
      this.logger.error(exception);
    }
  }

  getStatusCode(exception: Exception): HttpStatus {
    return exception.statusCode || exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
