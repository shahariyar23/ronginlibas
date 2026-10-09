import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { RequestHandler } from 'express';
import { default as helmet } from 'helmet';
import compression from 'compression';

import { AppModule } from './app/app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers & compression
  const helmetMiddleware = helmet as unknown as () => RequestHandler;
  app.use(helmetMiddleware());
  app.use(compression());

  // Global API Prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') || '/api/v1';
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));

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
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or vercel deployments
      if (!origin || corsOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
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
  const port = Number(process.env.PORT) || configService.get<number>('app.port') || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`=======================================================`);
  logger.log(`  Rongin Libas Backend Server Initialized Successfully `);
  logger.log(`  Application Port : http://localhost:${port}          `);
  logger.log(`  API Base URL     : http://localhost:${port}${apiPrefix} `);
  logger.log(`  Swagger Docs     : http://localhost:${port}/api/docs `);
  logger.log(`  Health Endpoint  : http://localhost:${port}${apiPrefix}/health`);
  logger.log(`=======================================================`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to bootstrap NestJS application', err);
  process.exit(1);
});
