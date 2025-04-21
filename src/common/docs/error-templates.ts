import { HttpStatus } from '@nestjs/common';

export default Object.seal({
  [HttpStatus.INTERNAL_SERVER_ERROR]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
    schema: {
      type: 'text',
      example: 'Internal Server Error',
    },
  },

  [HttpStatus.UNAUTHORIZED]: {
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.UNAUTHORIZED,
        },
        timestamp: {
          type: 'Date',
          example: '2024-08-25T15:52:11.260Z',
        },
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
      },
    },
  },

  [HttpStatus.NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.NOT_FOUND,
        },
        timestamp: {
          type: 'Date',
          example: '2024-08-25T15:52:11.260Z',
        },
        message: {
          type: 'string',
          example: 'The error message here',
        },
      },
    },
  },

  [HttpStatus.UNPROCESSABLE_ENTITY]: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.UNPROCESSABLE_ENTITY,
        },
        timestamp: {
          type: 'Date',
          example: '2024-08-25T15:52:11.260Z',
        },
        message: {
          type: 'string',
          example: 'There is still a non-expired sign-up code attached to this email. Please verify your account with it',
        },
        type: {
          type: 'string',
          example: 'users.create.sign_up_code_still_active',
        },
      },
    },
  },

  [HttpStatus.CONFLICT]: {
    status: HttpStatus.CONFLICT,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.CONFLICT,
        },
        timestamp: {
          type: 'Date',
          example: '2024-08-25T15:52:11.260Z',
        },
        message: {
          type: 'string',
          example: 'There is already an user registered with the provided email address',
        },
      },
    },
  },

  [HttpStatus.BAD_REQUEST]: {
    status: HttpStatus.BAD_REQUEST,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.UNPROCESSABLE_ENTITY,
        },
        timestamp: {
          type: 'Date',
          example: '2024-08-25T15:52:11.260Z',
        },
        validationIssues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'A string value appears to be incorrect',
              },
              path: {
                type: 'array',
                description: 'The path to the property with the error. Empty when "nonAllowedKeys" is filled',
                items: {
                  anyOf: [{ type: 'string' }, { type: 'number' }],
                },
                example: ['files', 0, 'mimeType'],
              },
              nonAllowedKeys: {
                type: 'array',
                items: {
                  type: 'string',
                  description: 'Array of non-allowed keys sent in the request',
                  example: 'accountDeletedAt',
                },
              },
              code: {
                type: 'string',
                example: 'unrecognized_keys',
              },
              location: {
                type: 'string',
                description:
                  'The location of the property that generated the validation issue. Possible values are: <br><br>' +
                  'body, query or params',
                example: 'body',
              },
            },
          },
        },
        message: {
          type: 'string',
          description: 'The error message. Only present if "validationIssues" is empty',
          example: 'Invalid ID',
        },
      },
    },
  },

  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: {
    status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    description: 'Unsupported Media Type. The supported types will be present in the response header Accept-*.',
    headers: {
      'Accept-Post': {
        description: 'Supported content types for POST requests',
        schema: {
          type: 'string',
          example: 'multipart/form-data, application/json',
        },
      },
      'Accept-Patch': {
        description: 'Supported content types for PATCH requests',
        schema: {
          type: 'string',
          example: 'application/json',
        },
      },
      Accept: {
        description: 'Supported content types for requests',
        schema: {
          type: 'string',
          example: 'application/json',
        },
      },
    },
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        },
        timestamp: {
          type: 'Date',
          example: '2024-08-25T15:52:11.260Z',
        },
        message: {
          type: 'string',
          example: `Unsupported Media Type. Expected: {type(s)}`,
        },
      },
    },
  },
});
