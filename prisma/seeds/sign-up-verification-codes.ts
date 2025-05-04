import { Logger } from '@nestjs/common';
import { transactionClient } from './seed';

export async function unseedSignUpVerificationCodes(client: transactionClient, logger: Logger) {
  logger.log('Unseeding sign-up verification codes...');
  await client.signUpVerificationCode.deleteMany();
  logger.log('Sign-up verification codes successfully unseeded.');
}
