import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  formatException(exception: HttpException, ctx: HttpArgumentsHost) {
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const formattedException = this.formatException(exception, ctx);

    return formattedException;
  }
}
