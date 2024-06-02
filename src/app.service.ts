import { Injectable } from '@nestjs/common';
import { CustomLogger } from './common/logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: CustomLogger) {}

  getHello(): string {
    const dbError = new Error('Failed to connect');

    this.logger.log(dbError.message, 'contextInfo');
    this.logger.error(dbError.message, dbError.stack);
    this.logger.warn(dbError.message, 'contextInfo');
    this.logger.debug(dbError.message, 'contextInfo', { property: 'value' });

    return 'Hello World!!';
  }
}
