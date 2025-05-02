import {
  ExpiredTokenException,
  MalformedPolicyDocumentException,
  PackedPolicyTooLargeException,
  RegionDisabledException,
  STSServiceException,
} from '@aws-sdk/client-sts';
import { HttpStatus } from '@nestjs/common';

import BaseException from './Base.exception';

export type AmazonSTSError =
  | MalformedPolicyDocumentException
  | PackedPolicyTooLargeException
  | RegionDisabledException
  | ExpiredTokenException
  | STSServiceException;

export default class AmazonSTSException extends BaseException {
  name: string;
  fault: string;

  constructor(private readonly error: AmazonSTSError) {
    super(error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    this.name = 'AmazonSTSException';
    this.fault = error.$fault;
  }
}
