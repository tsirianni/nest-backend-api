import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';

import BadRequestException from '../BadRequest.exception';

interface FormattedException {
  validationIssues: object[];
  statusCode?: HttpStatus;
  timestamp?: string;
  message?: string;
}

@Catch(BadRequestException)
export default class BadRequestExceptionFilter implements ExceptionFilter {
  formatException(exception: BadRequestException, ctx: HttpArgumentsHost) {
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const formattedException: FormattedException = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      validationIssues: [...exception.validationIssues],
      message: exception.message ? exception.message : undefined,
    };

    return response.status(status).json(formattedException);
  }

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    return this.formatException(exception, ctx);
  }
}
