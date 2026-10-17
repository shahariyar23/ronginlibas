import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { RequestHandler } from 'express';
import { default as helmet } from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Normalize environment variables by stripping surrounding quotes (supports Docker --env-file)
  for (const [key, value] of Object.entries(process.env)) {
    if (value && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      process.env[key] = value.slice(1, -1);
    }
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  // Security headers & compression
  const helmetMiddleware = helmet as unknown as () => RequestHandler;
  app.use(helmetMiddleware());
  app.use(compression());
  app.use(cookieParser());

  // Global API Prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') || '/api/v1';
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''), {
    exclude: ['/'],
  });

  // Global Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS Configuration
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://ronginlibas.com',
    'https://www.ronginlibas.com',
    'https://admin.ronginlibas.com',
    'https://www.admin.ronginlibas.com'
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const isLocalDev =
        origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server), vercel deployments, or local dev origins
      if (!origin || corsOrigins.includes(origin) || origin.endsWith('.vercel.app') || isLocalDev) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'RT-UDDOKTAPAY-API-KEY', 'rt-uddoktapay-api-key', 'X-Visitor-Id', 'x-visitor-id'],
  });

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rongin Libas API')
    .setDescription(
      'REST API for Rongin Libas luxury South Asian bespoke menswear and fashion e-commerce platform and admin dashboard.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Application Port
  const port = process.env.PORT || configService.get<number>('app.port') || 4000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  logger.log(`=======================================================`);
  logger.log(`  Rongin Libas Backend Server Initialized Successfully `);
  logger.log(`  Application Port : http://${host}:${port}          `);
  logger.log(`  API Base URL     : http://${host}:${port}${apiPrefix} `);
  logger.log(`  Swagger Docs     : http://${host}:${port}/api/docs `);
  logger.log(`  Health Endpoint  : http://${host}:${port}${apiPrefix}/health`);
  logger.log(`=======================================================`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to bootstrap NestJS application', err);
  process.exit(1);
});
