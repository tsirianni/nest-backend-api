import { HttpStatus } from '@nestjs/common';
import { z as zod, ZodError } from 'zod';
import errorMessages from '../validation/error-messages';
import errorCodes from '../validation/error-codes';
import BaseException from './Base.exception';

type ErrorLocation = 'body' | 'query' | 'params';

interface validationIssue {
  code: string;
  path: (string | number)[];
  nonAllowedKeys: string[];
  message: string;
  location?: ErrorLocation;
}

export default class BadRequestException extends BaseException {
  name: string;
  validationIssues: validationIssue[] = [];

  constructor(error: ZodError | string, location?: ErrorLocation) {
    super(typeof error === 'string' ? error : error.message, HttpStatus.BAD_REQUEST);

    this.name = 'BadRequestException';

    if (typeof error === 'object') {
      error.issues.forEach((issue: zod.ZodIssue) => {
        const issueObject: validationIssue = {
          message: errorMessages[issue.code],
          path: [],
          nonAllowedKeys: [],
          code: issue.code,
          location,
        };

        if (issue.code === errorCodes.UNRECOGNIZED_KEYS) {
          issue.keys.forEach((key) => issueObject['nonAllowedKeys'].push(key));
        } else {
          issue.path.forEach((value) => issueObject['path'].push(value));
        }

        this.validationIssues.push(issueObject);
      });
    }
  }
}
