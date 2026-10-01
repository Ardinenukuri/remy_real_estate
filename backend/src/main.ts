import 'reflect-metadata';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

function assertProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;

  const missing: string[] = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'super_secret_jwt_key_remy_2026') {
    missing.push('JWT_SECRET (must be set to a real secret, not the dev default)');
  }
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    missing.push('DATABASE_URL (or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME)');
  }
  if (!process.env.FRONTEND_URL) {
    missing.push('FRONTEND_URL (your deployed frontend origin, for CORS)');
  }

  if (missing.length > 0) {
    throw new Error(
      `Refusing to start in production with missing/insecure config:\n  - ${missing.join('\n  - ')}`,
    );
  }
}

async function bootstrap() {
  assertProductionConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  app.setGlobalPrefix('api');
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''));
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
}

bootstrap();
