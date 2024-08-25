import { HttpStatus } from '@nestjs/common';

export default Object.seal({
  [HttpStatus.INTERNAL_SERVER_ERROR]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        timestamp: {
          type: 'Date',
          example: '2024-08-25T15:52:11.260Z',
        },
        message: {
          type: 'string',
          example: 'The error message here',
          optional: true,
        },
      },
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
          example: 'Invalid Credentials',
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
          example:
            'There is still a non-expired sign-up code attached to this email. Please verify your account with it',
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
          example:
            'There is already an user registered with the provided email address',
        },
      },
    },
  },
});
