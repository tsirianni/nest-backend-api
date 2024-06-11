import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './common/events/events.module';
import { InitService } from './init';
import { UsersModule } from './modules/users/users.module';
import configuration from './config';

@Module({
  controllers: [AppController],
  providers: [AppService, InitService],
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    UsersModule,
    EventsModule,
  ],
})
export class AppModule {}
