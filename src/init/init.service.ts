import { PrismaService } from 'src/common/database/prisma';
import { EventService } from '../common/events/events.service';
import { handleDatabaseCall } from 'src/common/utils';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InitService {
  constructor(
    private readonly database: PrismaService,
    private readonly events: EventService,
  ) {}

  private readonly logger = new Logger(InitService.name);

  async init() {
    try {
      this.logger.log('Initializing application');
      await this.connectToDatabase();

      this.events.emit('ready', this.logger);
    } catch (error) {
      const errorDetails = structuredClone(error) as { message: string; stack: string; code?: number; statusCode?: number };

      this.logger.error(
        `Initialization failed: ${errorDetails.message}`,
        errorDetails.stack,
        `code: ${String(errorDetails.code || errorDetails.statusCode)}`,
      );
      process.exit(1);
    }
  }

  private async connectToDatabase() {
    await handleDatabaseCall(this.database.$connect());
    this.logger.log('Connection to database successful');
  }
}
