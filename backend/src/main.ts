import 'reflect-metadata';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { createValidationPipe } from './common/validation';

// Load backend/.env when present (Node >= 20.12). Real environment variables win.
try {
  process.loadEnvFile(join(process.cwd(), '.env'));
} catch {
  /* no .env file — defaults apply */
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.set('trust proxy', true);
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useBodyParser('json', { limit: '100kb' });
  app.useGlobalPipes(createValidationPipe());
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  Logger.log(`API ready on http://localhost:${port}/api`, 'Bootstrap');
  if (!process.env.ADMIN_TOKEN) {
    Logger.warn('ADMIN_TOKEN is not set — the admin dashboard is disabled.', 'Bootstrap');
  }
}

void bootstrap();
