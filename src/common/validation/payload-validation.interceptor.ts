import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UnknownKeysParam, ZodObject, ZodRawShape } from 'zod';
import { BadRequestException } from '../exceptions';

type SchemaContainer = {
  params?: ZodObject<ZodRawShape, UnknownKeysParam>;
  body?: ZodObject<ZodRawShape, UnknownKeysParam>;
  query?: ZodObject<ZodRawShape, UnknownKeysParam>;
};

@Injectable()
export default class ValidationInterceptor implements NestInterceptor {
  constructor(public validationObject: SchemaContainer) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
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

  validateParams(params: unknown, paramsSchema: ZodObject<ZodRawShape, UnknownKeysParam>) {
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
      throw new BadRequestException(result.error, 'params');
    }

    return;
  }

  validateBody(body: unknown, bodySchema: ZodObject<ZodRawShape, UnknownKeysParam>) {
    const result = bodySchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error, 'body');
    }

    return;
  }

  validateQuery(query: unknown, querySchema: ZodObject<ZodRawShape, UnknownKeysParam>) {
    const result = querySchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(result.error, 'query');
    }

    return;
  }
}
