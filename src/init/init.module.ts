import { Module } from '@nestjs/common';

import { EventsModule } from '../common/events/events.module';
import { InitService } from './init.service';
import { PrismaModule } from '../common/database/prisma/prisma.module';

@Module({
  imports: [EventsModule, PrismaModule],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
