import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import BadRequestException from './bad-request.exception';

interface FormattedException {
  timestamp?: string;
  statusCode?: HttpStatus;
  validationIssues?: object[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  formatException(exception: any, ctx: HttpArgumentsHost) {
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

    const formattedException: FormattedException = {
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    if (exception.validationIssues) {
      formattedException.validationIssues = [...exception.validationIssues];
    }

    // Log and return error
    if (!(exception instanceof BadRequestException)) {
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
