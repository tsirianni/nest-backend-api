import { Logger } from '@nestjs/common';

import { transactionClient } from './seed';
import * as bcrypt from 'bcrypt';

export async function seedUsers(client: transactionClient, logger: Logger) {
  logger.log('Initializing users seed...');
  const password = await bcrypt.hash('Test123!', Number(process.env.BCRYPT_ROUNDS)); // prisma will load .env

  await client.user.createMany({
    data: [
      {
        id: '127b21cd-7924-418d-be8e-a42e0f47c60a',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        accountId: '35cfb296-f8c3-409e-9e52-fc493c2a2c66',
        verified: true,
        password,
      },
      {
        id: '4c6b3fa9-bc44-4c9a-953c-9dd5807bd695',
        name: 'Jane Doe',
        email: 'jane.doe@gmail.com',
        password,
        verified: true,
        accountId: '7b668092-629d-4b21-9757-b7b2fb1faafb',
      },
    ],
  });
  logger.log('Users seed successfully initialized.');
}

export async function unseedUsers(client: transactionClient, logger: Logger) {
  logger.log('Unseeding users...');
  await client.user.deleteMany();
  logger.log('Users successfully unseeded.');
}
