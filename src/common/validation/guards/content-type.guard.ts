import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';

import { ACCEPT_CONTENT_TYPE_KEY } from '../decorators/content-type.decorator';
import { UnsupportedMediaTypeException } from '../../exceptions';
import { HTTP_METHODS } from '../../../enums';

@Injectable()
export default class ContentTypeGuard implements CanActivate {
  private readonly DEFAULT_CONTENT_TYPE = 'application/json';

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const methodsToSkipCheck = [HTTP_METHODS.GET, HTTP_METHODS.DELETE];
    const shouldSkipContentTypeCheck = methodsToSkipCheck.includes(request.method.toUpperCase() as HTTP_METHODS);

    if (!shouldSkipContentTypeCheck) {
      const acceptedContentTypes = this.reflector.get<string[] | undefined>(ACCEPT_CONTENT_TYPE_KEY, context.getHandler()) ?? [
        this.DEFAULT_CONTENT_TYPE,
      ];

      const contentType = request.headers['content-type']?.split(';')[0];

      if (!contentType || !acceptedContentTypes.includes(contentType)) {
        const response: Response = context.switchToHttp().getResponse();
        this.addAcceptHeaders(response, request.method as HTTP_METHODS, acceptedContentTypes);

        throw new UnsupportedMediaTypeException(`Unsupported Media Type. Expected: ${acceptedContentTypes.join(', ')}`);
      }

      return true;
    }

    return true;
  }

  private addAcceptHeaders(response: Response, method: HTTP_METHODS, acceptedTypes: string[]): void {
    switch (method) {
      case HTTP_METHODS.POST:
        response.header('Accept-Post', acceptedTypes);
        break;
      case HTTP_METHODS.PATCH:
        response.header('Accept-Patch', acceptedTypes);
        break;
      case HTTP_METHODS.OPTIONS:
        response.header('Accept-Post', acceptedTypes);
        response.header('Accept-Patch', acceptedTypes);
        response.header('Accept', acceptedTypes);
        break;
      default:
        response.header('Accept', acceptedTypes);
    }
  }
}
