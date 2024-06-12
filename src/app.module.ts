import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './common/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { InitModule } from './init/init.module';
import { envSchema } from './config';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        const response = envSchema.safeParse(env);
        if (!response.success) {
          throw new Error(
            `Application could not be started, missing environment variables: ${response.error}`,
          );
        }

        return env;
      },
    }),
    UsersModule,
    EventsModule,
    InitModule,
  ],
})
export class AppModule {}
