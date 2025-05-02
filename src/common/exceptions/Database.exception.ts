import { Prisma } from '@prisma/client';
import BaseException from './Base.exception';
import { HttpStatus } from '@nestjs/common';

export type PrismaException =
  | Prisma.PrismaClientInitializationError
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientRustPanicError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientValidationError;

export default class DatabaseException extends BaseException {
  code?: string;
  stack?: string;

  constructor(error: PrismaException) {
    super(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    this.stack = error.stack;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.code = error.code;
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      this.code = error.errorCode;
    }
  }
}
