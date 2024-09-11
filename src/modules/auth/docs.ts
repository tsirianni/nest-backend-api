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
      description:
        'Login operation was successful and the cookies have been returned',
      headers: {
        'Set-Cookie': {
          description: 'JWT access_token cookie',
          schema: {
            type: 'string',
          },
        },
        'Set-Cookie-Refresh': {
          description: 'JWT refresh_token cookie',
          schema: {
            type: 'string',
          },
        },
      },
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'success',
          },
        },
      },
    },
    { ...errorTemplates[HttpStatus.UNAUTHORIZED] },
    { ...errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR] },
  ],
};

export const refresh: ApiDocumentationOptions = {
  tag: ['Auth'],
  summary: 'Endpoint to refresh tokens',
  description:
    'Endpoint allows a user to get new tokens once the access_token has expired',
  headers: [
    {
      name: 'Cookie',
      description: 'The cookie required to access the route',
      required: true,
      schema: {
        type: 'string',
        example: 'refresh_token=TOKEN',
      },
    },
  ],
  responses: [
    {
      status: HttpStatus.OK,
      description:
        'Refresh operation was successful and the new cookies have been returned',
      headers: {
        'Set-Cookie': {
          description: 'JWT access_token cookie',
          schema: {
            type: 'string',
          },
        },
        'Set-Cookie-Refresh': {
          description: 'JWT refresh_token cookie',
          schema: {
            type: 'string',
          },
        },
      },
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'success',
          },
        },
      },
    },
    { ...errorTemplates[HttpStatus.UNAUTHORIZED] },
    { ...errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR] },
  ],
};

export const logout: ApiDocumentationOptions = {
  tag: ['Auth'],
  summary: 'Endpoint to clear tokens',
  description: 'Endpoint to clear tokens, effectively logging the user out',
  responses: [
    {
      status: HttpStatus.OK,
      description:
        'Logout operation was successful and the cookies have been cleared',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Logged out successfully',
          },
        },
      },
    },
    { ...errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR] },
  ],
};
