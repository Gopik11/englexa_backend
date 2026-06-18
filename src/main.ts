import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WinstonLogger } from './common/logging/winston.logger';
import { isAiConfigured } from './common/utils/ai-error.util';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  if (!isAiConfigured()) {
    console.error(
      '[FATAL] OPENAI_API_KEY (or SPEECH_API_KEY) is not set. AI routes will return degraded fallback responses.',
    );
  } else {
    console.log('[startup] OpenAI API key detected.');
  }

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: new WinstonLogger(),
  });
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ extended: true, limit: '25mb' }));
  app.use(compression({ threshold: 1024 }));
  app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      skip: (req: { url?: string }) => req.url?.includes('/health') ?? false,
    }),
  );
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: isProduction ? undefined : false,
    }),
  );

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  const prisma = app.get(PrismaService);
  const dbStatus = prisma.isConnected ? 'connected' : 'degraded (DB unavailable)';

  console.log(
    `EngLexa API running on http://0.0.0.0:${port}/api/v1 [${dbStatus}]`,
  );
  if (!prisma.isConnected) {
    console.warn(
      'Database is unreachable — fix PostgreSQL, then check GET /api/v1/health/db',
    );
  }
}

bootstrap();
