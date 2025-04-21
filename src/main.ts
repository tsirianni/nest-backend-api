import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import type { CorsOptions } from 'cors';
import { HttpStatus, Logger } from '@nestjs/common';
import * as passport from 'passport';
import helmet from 'helmet';

import { default as ContentTypeGuard } from './common/validation/guards/content-type.guard';
import * as exceptionFilters from './common/exceptions/filters';
import { EventService } from './common/events/events.service';
import { InitService } from './init/init.service';
import { AppModule } from './app.module';
import { EnvSchema } from './config';

import { default as errorTemplates } from './common/docs/error-templates';

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
  } as CorsOptions);

  eventService.on('ready', (logger: Logger) => {
    const port = configService.get('API_PORT', { infer: true });
    app
      .listen(port)
      .then(() => {
        logger.log(`HTTP server listening on port ${String(port)}`);
      })
      .catch((error: unknown) => {
        logger.error('Unable to start HTTP server', error);
      });
  });

  // Docs
  const config = new DocumentBuilder()
    .setTitle('Nestjs backend API')
    .setDescription('The Nestjs backend API description')
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      description: 'The access token required to access private routes',
      in: 'cookie',
      name: 'access_token',
    })
    .addGlobalResponse(errorTemplates[HttpStatus.INTERNAL_SERVER_ERROR])
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Global Exception Handlers
  app.useGlobalFilters(
    /*
      The global handler has to be the first option. Nest evaluates them as "last-in, first evaluated", which goes
      against common reasoning of specific first - generic later.
     */
    new exceptionFilters.GlobalExceptionFilter(),
    new exceptionFilters.BadRequestExceptionFilter(),
    new exceptionFilters.AttachmentUploadExceptionFilter(),
    new exceptionFilters.UnprocessableEntityExceptionFilter(),
  );

  // Global Guards
  app.useGlobalGuards(new ContentTypeGuard(new Reflector()));

  await initService.init();
}

void bootstrap();
