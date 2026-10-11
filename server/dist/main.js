import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { default as helmet } from 'helmet';
import compression from 'compression';
import { AppModule } from './app/app.module.js';
async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const helmetMiddleware = helmet;
    app.use(helmetMiddleware());
    app.use(compression());
    const apiPrefix = configService.get('app.apiPrefix') || '/api/v1';
    app.setGlobalPrefix(apiPrefix.replace(/^\//, ''), {
        exclude: ['/'],
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const corsOrigins = configService.get('app.corsOrigins') || [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://ronginlibas.com',
        'https://www.ronginlibas.com',
        'https://admin.ronginlibas.com',
        'https://www.admin.ronginlibas.com'
    ];
    app.enableCors({
        origin: (origin, callback) => {
            const isLocalDev = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
            if (!origin || corsOrigins.includes(origin) || origin.endsWith('.vercel.app') || isLocalDev) {
                callback(null, true);
            }
            else {
                callback(null, false);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    });
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Rongin Libas API')
        .setDescription('REST API for Rongin Libas luxury South Asian bespoke menswear and fashion e-commerce platform and admin dashboard.')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
    }, 'bearer')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || configService.get('app.port') || 4000;
    await app.listen(port);
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
//# sourceMappingURL=main.js.map