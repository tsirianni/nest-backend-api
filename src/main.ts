import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import * as passport from 'passport';
import helmet from 'helmet';

import * as exceptionFilters from './common/exceptions/filters';
import { EventService } from './common/events/events.service';
import { InitService } from './init/init.service';
import { AppModule } from './app.module';
import { EnvSchema } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get Services
  const configService = app.get<ConfigService<EnvSchema, true>>(ConfigService);
  const eventService = app.get(EventService);
  const initService = app.get(InitService);

  app.enableShutdownHooks();
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(helmet());
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS'),
  });

  eventService.onEvent('ready', async (logger) => {
    const port = configService.get('API_PORT', { infer: true });
    await app.listen(port);
    logger.log(`HTTP server listening on port ${port}`);
  });

  // Docs
  const config = new DocumentBuilder()
    .setTitle('Nestjs backend API')
    .setDescription('The Nestjs backend API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Global Exception Handlers
  app.useGlobalFilters(
    new exceptionFilters.HttpExceptionFilter(),
    new exceptionFilters.BadRequestExceptionFilter(),
    new exceptionFilters.AttachmentUploadExceptionFilter(),
    new exceptionFilters.UnprocessableEntityExceptionFilter(),
  );

  await initService.init();
}

bootstrap();
