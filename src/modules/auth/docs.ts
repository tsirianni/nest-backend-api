import { ApiDocumentationOptions } from 'src/common/docs/route-doc';
import { errorTemplates } from '../../common/docs';
import { HttpStatus } from '@nestjs/common';

export const login: ApiDocumentationOptions = {
  tag: ['Auth'],
  summary: 'Endpoint to authenticate a user',
  description:
    'Endpoint allows a user to authenticate and access protected resources on the application',
  requestBody: {
    schema: {
      type: 'object',
      required: ['true'],
      properties: {
        username: {
          type: 'string',
          example: 'john.doe@user.com',
        },
        password: {
          type: 'string',
          example: '{{super-secret-password}}',
        },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.OK,
      description: 'Login Operation Successful',
      schema: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
            example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5Y...',
          },
        },
      },
    },
    { ...errorTemplates[HttpStatus.UNAUTHORIZED] },
    { ...errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR] },
  ],
};
