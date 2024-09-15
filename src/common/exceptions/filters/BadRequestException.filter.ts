import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

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
    };

    return response.status(status).json(formattedException);
  }

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const formattedException = this.formatException(exception, ctx);

    return formattedException;
  }
}
