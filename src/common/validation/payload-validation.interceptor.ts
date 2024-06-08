import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ZodObject } from 'zod';
import { BadRequestException } from '../exceptions';

type SchemaContainer = {
  params?: ZodObject<any, any>;
  body?: ZodObject<any, any>;
  query?: ZodObject<any, any>;
};

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  validationObject;
  requestObject: Request | undefined;

  constructor(validationObject: SchemaContainer) {
    this.validationObject = validationObject;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    this.requestObject = request;
    const { body, params, query } = request;

    if (Object.keys(body).length && this.validationObject.body) {
      this.validateBody(body, this.validationObject.body);
    }

    if (Object.keys(params).length && this.validationObject.params) {
      this.validateParams(params, this.validationObject.params);
    }

    if (Object.keys(query).length && this.validationObject.query) {
      this.validateQuery(query, this.validationObject.query);
    }

    // After the entire request has been validated, call the controller's method
    return next.handle();
  }

  validateParams(params: any, paramsSchema: ZodObject<any, any>) {
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return;
  }

  validateBody(body: any, bodySchema: ZodObject<any, any>) {
    const result = bodySchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return;
  }

  validateQuery(query: any, querySchema: ZodObject<any, any>) {
    const result = querySchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return;
  }
}
