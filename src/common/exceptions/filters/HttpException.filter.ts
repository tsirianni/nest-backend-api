import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import BadRequestException from '../BadRequest.exception';
import DatabaseException from '../Database.exception';
import { UnprocessableEntityException } from '../UnprocessableEntity.exception';

interface FormattedException {
  message?: string;
  timestamp?: string;
  statusCode?: HttpStatus;
  validationIssues?: object[];
  type?: string;
}

@Catch(HttpException, DatabaseException, UnprocessableEntityException)
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

    if (exception.type) {
      formattedException.message = exception.message;
      formattedException.type = exception.type;
    }

    // Log and return error
    if (
      !(
        exception instanceof BadRequestException ||
        exception instanceof UnauthorizedException ||
        UnprocessableEntityException
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
