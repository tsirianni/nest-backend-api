import { ApiDocumentationOptions } from '../../common/docs/route-doc';
import { errorTemplates } from '../../common/docs';
import { HttpStatus } from '@nestjs/common';

export const login: ApiDocumentationOptions = {
  tag: ['Auth'],
  summary: 'Endpoint to authenticate a user',
  description: 'Endpoint allows a user to authenticate and access protected resources on the application',
  headers: [
    {
      name: 'Content-Type',
      description: 'The content type of the request body',
      required: true,
      schema: {
        type: 'string',
        example: 'application/json',
      },
    },
  ],
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
      description: 'Login operation was successful and the cookies have been returned',
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
    {
      ...errorTemplates[HttpStatus.UNSUPPORTED_MEDIA_TYPE],
    },
  ],
};

export const refresh: ApiDocumentationOptions = {
  tag: ['Auth'],
  summary: 'Endpoint to refresh tokens',
  description: 'Endpoint allows a user to get new tokens once the access_token has expired',
  headers: [
    {
      name: 'Content-Type',
      description: 'The content type of the request body',
      required: true,
      schema: {
        type: 'string',
        example: 'application/json',
      },
    },
  ],
  auth: {
    cookie: true,
  },
  responses: [
    {
      status: HttpStatus.OK,
      description: 'Refresh operation was successful and the new cookies have been returned',
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
    {
      ...errorTemplates[HttpStatus.UNSUPPORTED_MEDIA_TYPE],
    },
  ],
};

export const logout: ApiDocumentationOptions = {
  tag: ['Auth'],
  summary: 'Endpoint to clear tokens',
  description: 'Endpoint to clear tokens, effectively logging the user out',
  headers: [
    {
      name: 'Content-Type',
      description: 'The content type of the request body',
      required: true,
      schema: {
        type: 'string',
        example: 'application/json',
      },
    },
  ],
  responses: [
    {
      status: HttpStatus.OK,
      description: 'Logout operation was successful and the cookies have been cleared',
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
    {
      ...errorTemplates[HttpStatus.UNSUPPORTED_MEDIA_TYPE],
    },
  ],
};
