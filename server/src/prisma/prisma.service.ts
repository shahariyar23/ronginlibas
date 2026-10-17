import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const rawUrl = process.env.DATABASE_URL;
    const dbUrl = rawUrl ? rawUrl.replace(/^["']|["']$/g, '') : undefined;
    super({
      ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
      transactionOptions: {
        maxWait: 10000,
        timeout: 30000,
      },
    });
  }

  async onModuleInit() {
    // Non-blocking connection so serverless cold start and health check don't time out
    this.$connect()
      .then(() => {
        this.logger.log('PostgreSQL database connection established successfully via Prisma.');
      })
      .catch((error) => {
        this.logger.warn(
          `Unable to connect to PostgreSQL at startup (${(error as Error).message}). Server will continue running in decoupled mode.`,
        );
      });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('PostgreSQL connection disconnected.');
  }
}
