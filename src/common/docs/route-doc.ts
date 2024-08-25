import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponseOptions,
  ApiBodyOptions,
  ApiParamOptions,
  ApiQueryOptions,
} from '@nestjs/swagger';

export type ApiDocumentationOptions = {
  summary: string;
  description: string;
  tag: string[];
  requestBody?: ApiBodyOptions;
  responses?: Array<ApiResponseOptions>;
  params?: Array<ApiParamOptions>;
  queries?: Array<ApiQueryOptions>;
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

  if (options.requestBody) {
    decorators.push(ApiBody({ ...options.requestBody }));
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

  return applyDecorators(...decorators);
};
