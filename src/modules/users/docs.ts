import { HttpStatus } from '@nestjs/common';
import { errorTemplates } from '../../common/docs';
import { ApiDocumentationOptions } from '../../common/docs/route-doc';

export const signUp: ApiDocumentationOptions = {
  tag: ['Users'],
  summary: 'Signs Up a user',
  description: "Endpoint used to create a new user and send a verification code to the user's email address",
  requestBody: {
    schema: {
      type: 'object',
      required: ['true'],
      properties: {
        name: {
          type: 'string',
          example: 'John',
        },
        email: {
          type: 'string',
          example: 'john.doe@user.com',
        },
        password: {
          type: 'string',
          example: '{{secret}}',
        },
        profileType: {
          type: 'number',
          example: 1,
          description: 'Possible profile types:\n\n`1` Technical\n`2` Non-Technical',
        },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.CREATED,
      description: 'Sign up successful',
    },
    {
      ...errorTemplates[HttpStatus.UNPROCESSABLE_ENTITY],
      description:
        'Possible error codes: \n\n`users.create.sign_up_code_still_active` - Happens when the user still has an active verification code, preventing the creation of a new one.',
    },
    {
      ...errorTemplates[HttpStatus.CONFLICT],
      description: 'Happens when a user is already registered with the email address provided',
    },
    {
      ...errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR],
    },
  ],
};

export const validateSignUp: ApiDocumentationOptions = {
  tag: ['Users'],
  summary: "Validates a user's sign-up code",
  description: 'Endpoint used to validate a sign-up code',
  requestBody: {
    schema: {
      type: 'object',
      required: ['true'],
      properties: {
        code: {
          type: 'string',
          example: '155975',
        },
        email: {
          type: 'string',
          example: 'john.doe@user.com',
        },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.OK,
      description: 'Sign up validation successful',
    },
    {
      ...errorTemplates[HttpStatus.UNPROCESSABLE_ENTITY],
      description:
        'Possible error codes: \n\n`users.validate_sign_up.code.invalid_or_expired` - Happens when the provided sign-up code is either invalid or has already expired',
    },
    {
      ...errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR],
    },
  ],
};

export const findOne: ApiDocumentationOptions = {
  tag: ['Users'],
  summary: 'Returns details about a user',
  description: 'Endpoint used to retrieve information about a single user',
  params: [
    {
      name: 'id',
      example: '9ab5badf-7bfe-4901-83f4-53df6185478a',
      required: true,
    },
  ],
  auth: { cookie: true },
  responses: [
    {
      status: HttpStatus.OK,
      schema: {
        type: 'object',
        required: ['true'],
        properties: {
          name: {
            type: 'string',
            example: 'John',
          },
          email: {
            type: 'string',
            example: 'john.doe@user.com',
          },
          accountId: {
            type: 'string',
            example: '{{UUID}}',
          },
          createdAt: {
            type: 'date',
            example: new Date().toISOString(),
          },
        },
      },
    },
    {
      ...errorTemplates[HttpStatus.UNAUTHORIZED],
    },
    {
      ...errorTemplates[HttpStatus.NOT_FOUND],
    },
    {
      ...errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR],
    },
  ],
};
