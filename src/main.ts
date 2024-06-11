import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { EventService } from './common/events/events.service';
import { InitService } from './init';
import enums from './enums';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  // Get Services
  const configService = app.get(ConfigService);
  const eventService = app.get(EventService);
  const initService = app.get(InitService);

  eventService.onEvent('ready', async (logger) => {
    const PORT = configService.get(enums.CONFIG.API_PORT);
    await app.listen(PORT);
    logger.log(`HTTP server listening on port ${PORT}`);
  });

  // Global Error Handler
  app.useGlobalFilters(new HttpExceptionFilter());

  await initService.init(eventService);
}
bootstrap();
