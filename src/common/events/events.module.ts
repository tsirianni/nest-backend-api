import { Module } from '@nestjs/common';
import { EventService } from './events.service';

@Module({
  providers: [EventService],
  exports: [EventService],
})
export class EventsModule {}
