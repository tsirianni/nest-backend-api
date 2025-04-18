import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ZodObject, ZodRawShape } from 'zod';
import { BadRequestException } from '../exceptions';

export type SchemaContainer = {
  params?: ZodObject<ZodRawShape>;
  body?: ZodObject<ZodRawShape>;
  query?: ZodObject<ZodRawShape>;
};

@Injectable()
export default class ValidationInterceptor implements NestInterceptor {
  constructor(public validationObject: SchemaContainer) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const body = (request.body ?? {}) as Record<string, unknown>;
    const params = request.params as Record<string, unknown>;
    const query = request.query as Record<string, unknown>;

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

  validateParams(params: unknown, paramsSchema: ZodObject<ZodRawShape>) {
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
      throw new BadRequestException(result.error, 'params');
    }

    return;
  }

  validateBody(body: unknown, bodySchema: ZodObject<ZodRawShape>) {
    const result = bodySchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error, 'body');
    }

    return;
  }

  validateQuery(query: unknown, querySchema: ZodObject<ZodRawShape>) {
    const result = querySchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(result.error, 'query');
    }

    return;
  }
}
