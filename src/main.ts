import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/errors/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.use(helmet());

  // Global Error Handler
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(4000);
}
bootstrap();
