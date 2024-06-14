import DatabaseException, {
  PrismaException,
} from '../exceptions/Database.exception';

type ErrorHandler = (error: PrismaException) => void;

export async function handleDatabaseCall<T>(
  dbCall: Promise<T>,
  errorHandler?: ErrorHandler,
) {
  try {
    return await dbCall;
  } catch (error: any) {
    if (errorHandler) errorHandler(error);
    else throw new DatabaseException(error);
  }
}
