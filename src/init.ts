// src/init.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { EventService } from './common/events/events.service';
import validateEnv from './utils/validate-env';
import * as path from 'path';

@Injectable()
export class InitService {
  private readonly logger = new Logger(InitService.name);

  async init(eventService: EventService) {
    try {
      this.logger.log('Initializing application');

      // Validate .env
      this.validateEnv();
      await this.connectToDatabase();

      eventService.emitEvent('ready', this.logger);
    } catch (error: any) {
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
      }, 1000);
    });
  }

  private validateEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    const sampleEnvPath = path.resolve(__dirname, '../.env.sample');
    const missingVariablesMessage = validateEnv(envPath, sampleEnvPath);

    if (missingVariablesMessage) {
      throw new Error(missingVariablesMessage);
    }
  }
}
