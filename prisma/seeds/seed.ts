import { DefaultArgs } from '@prisma/client/runtime/client';
import { Prisma, PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

import { unseedSignUpVerificationCodes } from './sign-up-verification-codes';
import { seedAccounts, unseedAccounts } from './accounts';
import { seedUsers, unseedUsers } from './users';

const client = new PrismaClient();
const logger = new Logger('Seeder');
const allowedOperations = ['seed', 'unseed'] as const;
type OperationFunction = (client: PrismaClient, logger: Logger) => Promise<void>;
export type transactionClient = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

const operationFunctionMap: Record<(typeof allowedOperations)[number], OperationFunction> = {
  seed: async (client, logger) => {
    await client.$transaction(
      async (client) => {
        await seedAccounts(client, logger);
        await seedUsers(client, logger);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  },
  unseed: async (client, logger) => {
    await client.$transaction(
      async (client) => {
        await unseedSignUpVerificationCodes(client, logger);
        await unseedUsers(client, logger);
        await unseedAccounts(client, logger);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  },
};

const handleOperationError = async (error: unknown) => {
  logger.error(error);
  await client.$disconnect();
  logger.error('Operation failed!');
  process.exit(1);
};

const performOperation = async (operation: string) => {
  try {
    if (!allowedOperations.includes(operation as (typeof allowedOperations)[number])) {
      throw new Error(`Invalid Operation: Choose either ${allowedOperations.join(' or ')}`);
    }

    logger.log(`Executing operation: ${operation}`);
    await operationFunctionMap[operation as (typeof allowedOperations)[number]](client, logger);
    await client.$disconnect();
    logger.log('Operation successful!');
  } catch (error) {
    await handleOperationError(error);
  }
};

(async () => {
  const selectedOperation = process.argv[2];
  await performOperation(selectedOperation);
})()
  .then(() => {})
  .catch(() => {});
