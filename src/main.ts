import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import * as exceptionFilters from './common/exceptions/filters';
import { EventService } from './common/events/events.service';
import { InitService } from './init/init.service';
import { AppModule } from './app.module';
import { EnvSchema } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  // Get Services
  const configService = app.get<ConfigService<EnvSchema, true>>(ConfigService);
  const eventService = app.get(EventService);
  const initService = app.get(InitService);

  eventService.onEvent('ready', async (logger) => {
    const port = configService.get('API_PORT', { infer: true });
    await app.listen(port);
    logger.log(`HTTP server listening on port ${port}`);
  });

  // Global Exception Handlers
  app.useGlobalFilters(
    new exceptionFilters.HttpExceptionFilter(),
    new exceptionFilters.UnprocessableEntityExceptionFilter(),
    new exceptionFilters.BadRequestExceptionFilter(),
  );

  await initService.init();
}
bootstrap();
