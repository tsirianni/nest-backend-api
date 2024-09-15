import DatabaseException, {
  PrismaException,
} from '../exceptions/Database.exception';

type ErrorHandler = (error: PrismaException) => void;

export default async function handleDatabaseCall<T>(
  dbCall: Promise<T>,
  errorHandler?: ErrorHandler,
) {
  try {
    return await dbCall;
  } catch (error) {
    if (errorHandler) errorHandler(error as PrismaException);
    else throw new DatabaseException(error as PrismaException);
  }
}
