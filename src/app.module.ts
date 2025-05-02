import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './common/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { InitModule } from './init/init.module';
import { envSchema } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { AttachmentModule } from './modules/attachment/attachment.module';
import { PrismaModule } from './common/database/prisma/prisma.module';

const logger = new Logger('AppModule');

@Module({
  controllers: [AppController, AuthController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        const response = envSchema.safeParse(env);
        if (!response.success) {
          logger.error(
            `Application could not be started, environment variables are either missing or have incorrect values`,
            response.error.errors,
          );
          process.exit(1);
        }
        return env;
      },
    }),
    PrismaModule,
    UsersModule,
    EventsModule,
    InitModule,
    AuthModule,
    AttachmentModule,
  ],
})
export class AppModule {}
