import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type PrismaException =
  | Prisma.PrismaClientInitializationError
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientRustPanicError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientValidationError;

export default class DatabaseException extends Error {
  name: string;
  code?: string;
  stack?: string;

  constructor(error: PrismaException) {
    super(error.message);
    this.name = 'Database Exception';
    this.stack = error.stack;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.code = error.code;
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      this.code = error.errorCode;
    }
  }

  getStatus() {
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
