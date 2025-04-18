import { z as zod } from 'zod';
import type { ParsedQs } from 'qs';
import type { ParamsDictionary } from 'express-serve-static-core';

import { SchemaContainer } from './payload-validation.interceptor';
import { BadRequestException } from '../exceptions';
import { ValidationInterceptor } from './index';
import { getMockReq } from '@jest-mock/express';
import * as mocks from '../testing/mocks';

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

  it('should pass the validation if the payload matches the expected schema', () => {
    const executionContext = mocks.createExecutionContext(
      getMockReq({ body: payload.body, params: payload.params, query: payload.query }),
    );
    const callHandler = mocks.createCallHandler({});

    try {
      interceptor.intercept(executionContext, callHandler);
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  describe('Params Validation', () => {
    it('should throw a BadRequestException if the validation fails', () => {
      // @ts-expect-error Forcing wrong type to create error scenario
      payload.params.id = true;
      const executionContext = mocks.createExecutionContext(
        getMockReq({ body: payload.body, params: payload.params, query: payload.query }),
      );
      const callHandler = mocks.createCallHandler({});

      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('Body Validation', () => {
    it('should throw a BadRequestException if the validation fails', () => {
      // @ts-expect-error Forcing wrong type to create error scenario
      payload.body.newPassword = true;
      const executionContext = mocks.createExecutionContext(
        getMockReq({ body: payload.body, params: payload.params, query: payload.query }),
      );
      const callHandler = mocks.createCallHandler({});

      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('Query Params Validation', () => {
    it('should throw a BadRequestException if the validation fails', () => {
      // @ts-expect-error Forcing wrong type to create error scenario
      payload.query.shouldReturn = 10;
      const executionContext = mocks.createExecutionContext(
        getMockReq({ body: payload.body, params: payload.params, query: payload.query }),
      );
      const callHandler = mocks.createCallHandler({});

      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
