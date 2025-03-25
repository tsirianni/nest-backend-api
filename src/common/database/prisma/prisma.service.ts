import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export default class PrismaService extends PrismaClient implements OnApplicationShutdown {
  constructor() {
    super({ log: ['warn'] });
  }

  private readonly logger = new Logger(PrismaService.name);

  // Disconnect from DB on crashes
  async onApplicationShutdown(signal: string) {
    this.logger.warn(`Received ${signal} signal. Disconnecting from database...`);
    return this.$disconnect();
  }

  createSelectObject<T extends string>(fields: readonly T[]) {
    return Object.fromEntries(fields.map((key) => [key, true])) as Record<T, true>;
  }
}
