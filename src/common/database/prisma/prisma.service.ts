import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ log: ['warn'] });
  }

  // Disconnect from DB on crashes
  async onModuleDestroy() {
    return await this.$disconnect();
  }
}
