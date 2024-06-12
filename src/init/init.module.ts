import { Module } from '@nestjs/common';
import { EventsModule } from 'src/common/events/events.module';
import { InitService } from './init.service';
import { PrismaService } from 'src/common/database/prisma/prisma.service';

@Module({
  imports: [EventsModule],
  providers: [InitService, PrismaService],
  exports: [InitService],
})
export class InitModule {}
