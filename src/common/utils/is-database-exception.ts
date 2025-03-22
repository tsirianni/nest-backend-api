import { Prisma } from '@prisma/client';
import { PrismaException } from '../exceptions/Database.exception';

export default function isDatabaseException(error: unknown): error is PrismaException {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  );
}
