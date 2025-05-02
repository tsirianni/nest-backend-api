import { Module } from '@nestjs/common';

import { EventsModule } from '../common/events/events.module';
import { InitService } from './init.service';

@Module({
  imports: [EventsModule],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
