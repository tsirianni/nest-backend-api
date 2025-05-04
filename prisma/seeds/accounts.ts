import { Logger } from '@nestjs/common';
import { transactionClient } from './seed';

export async function seedAccounts(client: transactionClient, logger: Logger) {
  logger.log('Initializing accounts seed...');
  await client.account.createMany({
    data: [
      {
        id: '35cfb296-f8c3-409e-9e52-fc493c2a2c66',
      },
      {
        id: '7b668092-629d-4b21-9757-b7b2fb1faafb',
      },
    ],
  });
  logger.log('Accounts seed successfully initialized.');
}

export async function unseedAccounts(client: transactionClient, logger: Logger) {
  logger.log('Unseeding accounts...');
  await client.account.deleteMany();
  logger.log('Accounts successfully unseeded.');
}
