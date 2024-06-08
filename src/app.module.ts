import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { EventService } from './common/events/events.service';
import { InitService } from './init';
import { UsersModule } from './modules/users/users.module';
import configuration from './config';

@Module({
  controllers: [AppController],
  providers: [AppService, EventService, InitService],
  exports: [EventService],
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    UsersModule,
  ],
})
export class AppModule {}
