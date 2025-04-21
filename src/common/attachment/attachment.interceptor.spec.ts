import * as http from 'http';

import { default as AttachmentInterceptor } from './attachment.interceptor';
import { AttachmentUploadException, errorTypes } from '../exceptions';
import { FILE_EXTENSION, FILE_MIMETYPE } from '../../enums';
import * as mocks from '../testing/mocks';

const createMockedRequest = (fileName: string, mimetype: string, contentType: string) => {
  const boundary = '----WebKitFormBoundary12345';

  // Simulate multipart body
  const multipartBody = Buffer.from(
    [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
      `Content-Type: ${mimetype}\r\n\r\n`,
      `<note>\n  <to>user</to>\n  <from>developer</from>\n  <message>Could you just read the error message before opening the ticket?</message>\n</note>\r\n`,
      `--${boundary}--\r\n`,
    ].join(''),
    'utf-8',
  );

  // @ts-expect-error Not necessary to pass a Socket
  const request: http.IncomingMessage & { body: object } = new http.IncomingMessage(undefined);
  request.method = 'POST';
  request.headers['content-type'] = `${contentType}; boundary=${boundary}`;
  request.push(multipartBody);
  request.push(null); // Signal end of stream

  return {
    request,
    response: new http.OutgoingMessage(),
  };
};

describe('Attachment Interceptor', () => {
  describe('Formatting validation', () => {
    it('should fill req.body with the processed files', async () => {
      const filename = '  d,u,m,m,y.pdf';
      const interceptor = new AttachmentInterceptor({ maxFileSizeInBytes: 2048 });
      const { request, response } = createMockedRequest(filename, FILE_MIMETYPE.PDF, FILE_MIMETYPE.MULTIPART_FORM_DATA);
      const executionContext = mocks.createExecutionContext(request, response);
      const callHandler = mocks.createCallHandler({});

      await interceptor.intercept(executionContext, callHandler);

      expect(request.body).toBeDefined();
      expect(request.body).toStrictEqual({
        files: [
          {
            buffer: expect.any(Buffer) as Buffer,
            mimeType: FILE_MIMETYPE.PDF,
            extension: FILE_EXTENSION.PDF,
            size: expect.any(Number) as number,
            originalName: filename,
            parsedFilename: 'd.u.m.m.y.pdf',
          },
        ],
      });
    });
  });

  describe('Error Validation', () => {
    it('should throw an AttachmentUploadException if the content-type is not "multipart/form-data"', async () => {
      const interceptor = new AttachmentInterceptor({ maxFileSizeInBytes: 2048 });
      const { request, response } = createMockedRequest('data.json', FILE_MIMETYPE.JSON, FILE_MIMETYPE.JSON);
      const executionContext = mocks.createExecutionContext(request, response);
      const callHandler = mocks.createCallHandler({});

      try {
        await interceptor.intercept(executionContext, callHandler);
      } catch (error) {
        expect(error).toBeInstanceOf(AttachmentUploadException);

        const receivedError = error as AttachmentUploadException;
        expect(receivedError.message).toStrictEqual('Invalid content-type');
        expect(receivedError.type).toStrictEqual(errorTypes.ATTACHMENTS.CREATE.INVALID_CONTENT_TYPE);
      }
    });

    it('should throw an AttachmentUploadException if the file size exceeds the pre-defined allowed limit', async () => {
      const fileName = 'dummy.pdf';
      const interceptor = new AttachmentInterceptor({ maxFileSizeInBytes: 10 });
      const { request, response } = createMockedRequest(fileName, FILE_MIMETYPE.PDF, FILE_MIMETYPE.MULTIPART_FORM_DATA);
      const executionContext = mocks.createExecutionContext(request, response);
      const callHandler = mocks.createCallHandler({});

      try {
        await interceptor.intercept(executionContext, callHandler);
      } catch (error) {
        expect(error).toBeInstanceOf(AttachmentUploadException);

        const receivedError = error as AttachmentUploadException;
        expect(receivedError.filenames).toContain(fileName);
        expect(receivedError.type).toStrictEqual(errorTypes.ATTACHMENTS.CREATE.FILE_SIZE_LIMIT_EXCEEDED);
        expect(receivedError.message).toStrictEqual('One or more files have exceeded the allowed file size limit');
      }
    });
  });
});
