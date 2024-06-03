// src/init.service.ts
import { Injectable } from '@nestjs/common';
import { EventService } from './common/events/events.service';
import { CustomLogger } from './common/logger/logger.service';

@Injectable()
export class InitService {
  constructor(
    private readonly eventService: EventService,
    private readonly logger: CustomLogger,
  ) {}

  async init() {
    try {
      this.logger.log('Initializing application');
      await this.connectToDatabase();

      this.eventService.emitEvent('ready', this.logger);
    } catch (error) {
      this.logger.error(`Initialization failed: ${error.message}`, error.trace);
      process.exit(1);
    }
  }

  private async connectToDatabase() {
    // Simulate a database connection
    return new Promise((resolve) => {
      setTimeout(() => {
        this.logger.log('Connection to database successful');
        resolve(true);
      }, 2000);
    });
  }
}
