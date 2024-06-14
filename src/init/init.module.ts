import { Module } from '@nestjs/common';
import { EventsModule } from 'src/common/events/events.module';
import { InitService } from './init.service';
import { PrismaModule } from 'src/common/database/prisma/prisma.module';

@Module({
  imports: [EventsModule, PrismaModule],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
