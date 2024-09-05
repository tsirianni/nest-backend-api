import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnApplicationShutdown
{
  constructor() {
    super({ log: ['warn'] });
  }

  private readonly logger = new Logger(PrismaService.name);

  // Disconnect from DB on crashes
  async onApplicationShutdown(signal: string) {
    this.logger.warn(
      `Received ${signal} signal. Disconnecting from database...`,
    );
    return await this.$disconnect();
  }
}
