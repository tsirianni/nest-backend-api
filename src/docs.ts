import { ApiDocumentationOptions } from 'src/common/docs/route-doc';

export const healthCheck: ApiDocumentationOptions = {
  tag: ['Health Check'],
  summary: 'Health checks the application',
  description:
    'Endpoint used to health check the application, thus making sure it is functional',
  responses: [
    {
      status: 200,
      description: 'Login Operation Successful',
      schema: {
        type: 'string',
        example: 'OK',
      },
    },
  ],
};
