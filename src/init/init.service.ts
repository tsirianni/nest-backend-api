import { handleDatabaseCall } from 'src/common/utils/handle-database-call.wrapper';
import { PrismaService } from 'src/common/database/prisma/prisma.service';
import { EventService } from '../common/events/events.service';
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

      this.events.emitEvent('ready', this.logger);
    } catch (error: any) {
      this.logger.error(
        `Initialization failed: ${error.message}`,
        error.stack,
        `code: ${error?.code || error?.statusCode}`,
      );
      process.exit(1);
    }
  }

  private async connectToDatabase() {
    await handleDatabaseCall(this.database.$connect());
    this.logger.log('Connection to database successful');
  }
}
