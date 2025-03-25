import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiBodyOptions,
  ApiConsumes,
  ApiCookieAuth,
  ApiHeader,
  ApiHeaderOptions,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiQuery,
  ApiQueryOptions,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';

type RequestBodyOptions = ApiBodyOptions & { contentType?: string };

export type ApiDocumentationOptions = {
  summary: string;
  description: string;
  tag: string[];
  auth?: {
    cookie?: boolean;
  };
  requestBody?: RequestBodyOptions;
  responses?: Array<ApiResponseOptions>;
  params?: Array<ApiParamOptions>;
  queries?: Array<ApiQueryOptions>;
  headers?: Array<ApiHeaderOptions>;
};

export default (options: ApiDocumentationOptions) => {
  const decorators = [];

  decorators.push(
    ApiOperation({
      summary: options.summary,
      description: options.description,
      tags: options.tag,
    }),
  );

  if (options.auth) {
    if (options.auth.cookie) {
      decorators.push(ApiCookieAuth());
    }
  }

  if (options.requestBody) {
    decorators.push(ApiBody({ ...options.requestBody }), ApiConsumes(options.requestBody.contentType || 'application/json'));
  }

  if (options.responses) {
    options.responses.forEach((response) => {
      decorators.push(
        ApiResponse({
          ...response,
        }),
      );
    });
  }

  if (options.params) {
    options.params.forEach((param) => {
      decorators.push(
        ApiParam({
          ...param,
        }),
      );
    });
  }

  if (options.queries) {
    options.queries.forEach((query) => {
      decorators.push(
        ApiQuery({
          ...query,
        }),
      );
    });
  }

  if (options.headers) {
    options.headers.forEach((header) => {
      decorators.push(ApiHeader({ ...header }));
    });
  }

  return applyDecorators(...decorators);
};
