import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

import UnprocessableEntityException from '../UnprocessableEntity.exception';

interface FormattedException {
  statusCode?: HttpStatus;
  timestamp?: string;
  message?: string;
  type?: string;
}

@Catch(UnprocessableEntityException)
export default class UnprocessableEntityExceptionFilter
  implements ExceptionFilter
{
  formatException(
    exception: UnprocessableEntityException,
    ctx: HttpArgumentsHost,
  ) {
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

  catch(exception: UnprocessableEntityException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const formattedException = this.formatException(exception, ctx);

    return formattedException;
  }
}
