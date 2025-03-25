import { ApiDocumentationOptions } from '../../common/docs/route-doc';
import { errorTemplates } from '../../common/docs';
import { HttpStatus } from '@nestjs/common';

export const createAttachment: ApiDocumentationOptions = {
  tag: ['Attachment'],
  summary: 'Uploads one or more files as multipart/form-data',
  description: 'Uploads one or more files as multipart/form-data. Files are limited to 2Mb in size per file.',
  auth: {
    cookie: true,
  },
  requestBody: {
    contentType: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.CREATED,
      description: 'One or more uploaded file details',
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Encrypted attachment ID',
            example: 'xyi9aMl7DFmlO4iMF9dprCvgBNuZx_QwZO5kw0QdsJEb_ocfpeA2bZDIDW65LSkX9u5QvGkbQ4-IrFLStKIgJw',
          },
          key: {
            type: 'string',
            description: 'Encrypted attachment ID key',
            example: 'zyi8aMl7DFmlO4iMF9dprCvgBNuZx_QwZO5kw0QdsJEb_pqzpeA2bZFBDW82LSkX9u5QvGkbQ4-IrFLStKIgJf',
          },
        },
      },
    },
    {
      ...errorTemplates[HttpStatus.BAD_REQUEST],
    },
    {
      ...errorTemplates[HttpStatus.UNAUTHORIZED],
    },
    {
      ...errorTemplates[HttpStatus.UNPROCESSABLE_ENTITY],
      description:
        'Possible error types:<br><br>' +
        '`attachments.create.file_size_limit_exceeded` - Happens when one or more attachments have exceeded the file size limit',
    },
    {
      ...errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR],
    },
  ],
};

export const downloadAttachment: ApiDocumentationOptions = {
  tag: ['Attachment'],
  summary: 'Downloads an attachment',
  description: 'Returns the pre-signed url to allow the attachment download',
  params: [
    {
      name: 'id',
      example: 'xyi9aMl7DFmlO4iMF9dprCvgBNuZx_QwZO5kw0QdsJEb_ocfpeA2bZDIDW65LSkX9u5QvGkbQ4-IrFLStKIgJw',
      required: true,
    },
  ],
  auth: {
    cookie: true,
  },
  responses: [
    {
      status: HttpStatus.OK,
      description: 'The url to download the attachment, signed with a pre-defined expiration time.',
      schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The url to download the attachment',
            example: 'https://theAwsPreSignedUrlHere.com',
          },
        },
      },
    },
    {
      ...errorTemplates[HttpStatus.BAD_REQUEST],
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

export const deleteAttachment: ApiDocumentationOptions = {
  tag: ['Attachment'],
  summary: 'Deletes an attachment',
  description: 'Deletes an attachment',
  params: [
    {
      name: 'id',
      example: 'xyi9aMl7DFmlO4iMF9dprCvgBNuZx_QwZO5kw0QdsJEb_ocfpeA2bZDIDW65LSkX9u5QvGkbQ4-IrFLStKIgJw',
      required: true,
    },
  ],
  auth: {
    cookie: true,
  },
  responses: [
    {
      status: HttpStatus.NO_CONTENT,
      description: 'The deletion has been successful',
    },
    {
      ...errorTemplates[HttpStatus.BAD_REQUEST],
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
