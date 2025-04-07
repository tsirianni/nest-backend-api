import { z as zod } from 'zod';
import type { ParsedQs } from 'qs';
import type { ParamsDictionary } from 'express-serve-static-core';

import { SchemaContainer } from './payload-validation.interceptor';
import { ValidationInterceptor } from './index';
import { getMockReq } from '@jest-mock/express';
import * as mocks from '../testing/mocks';
import { HttpStatus } from '@nestjs/common';

describe('Payload Validation Interceptor', () => {
  let requestSchema: SchemaContainer;
  let interceptor: ValidationInterceptor;
  let payload: { params: ParamsDictionary; body: unknown; query: ParsedQs };

  beforeEach(() => {
    requestSchema = {
      params: zod.object({
        id: zod.string(),
      }),
      body: zod.object({
        newPassword: zod.string(),
      }),
      query: zod.object({
        shouldReturn: zod.string(),
      }),
    };

    interceptor = new ValidationInterceptor(requestSchema);

    payload = {
      params: {
        id: '{{encryptedId}}',
      },
      body: {
        newPassword: 'somePassword',
      },
      query: {
        shouldReturn: 'true',
      },
    };
  });

  it('should pass the validation if the payload matches the expected schema', async () => {
    const executionContext = mocks.createExecutionContext(
      getMockReq({ body: payload.body, params: payload.params, query: payload.query }),
    );
    const callHandler = mocks.createCallHandler({});

    let receivedError;
    try {
      interceptor.intercept(executionContext, callHandler);
    } catch (error) {
      receivedError = error;
    }

    expect(receivedError).toBeUndefined();
  });

  describe('Params Validation', () => {
    it('should throw a BadRequestException if the validation fails', async () => {
      // @ts-expect-error Forcing wrong type to create error scenario
      payload.params.id = true;
      const executionContext = mocks.createExecutionContext(
        getMockReq({ body: payload.body, params: payload.params, query: payload.query }),
      );
      const callHandler = mocks.createCallHandler({});

      let receivedError;
      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.name).toStrictEqual('BadRequestException');
      expect(receivedError.status).toStrictEqual(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Body Validation', () => {
    it('should throw a BadRequestException if the validation fails', async () => {
      // @ts-expect-error Forcing wrong type to create error scenario
      payload.body.newPassword = true;
      const executionContext = mocks.createExecutionContext(
        getMockReq({ body: payload.body, params: payload.params, query: payload.query }),
      );
      const callHandler = mocks.createCallHandler({});

      let receivedError;
      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.name).toStrictEqual('BadRequestException');
      expect(receivedError.status).toStrictEqual(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Query Params Validation', () => {
    it('should throw a BadRequestException if the validation fails', async () => {
      // @ts-expect-error Forcing wrong type to create error scenario
      payload.query.shouldReturn = 10;
      const executionContext = mocks.createExecutionContext(
        getMockReq({ body: payload.body, params: payload.params, query: payload.query }),
      );
      const callHandler = mocks.createCallHandler({});

      let receivedError;
      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (error) {
        receivedError = error;
      }

      expect(receivedError.name).toStrictEqual('BadRequestException');
      expect(receivedError.status).toStrictEqual(HttpStatus.BAD_REQUEST);
    });
  });
});
