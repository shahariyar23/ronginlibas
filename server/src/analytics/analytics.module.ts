import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AnalyticsService } from './services/analytics.service.js';
import { VisitorSessionService } from './services/visitor-session.service.js';
import { Ga4MeasurementProtocolService } from './services/ga4-measurement-protocol.service.js';
import { AnalyticsController } from './controllers/analytics.controller.js';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController, AdminAnalyticsController],
  providers: [AnalyticsService, VisitorSessionService, Ga4MeasurementProtocolService],
  exports: [AnalyticsService, VisitorSessionService, Ga4MeasurementProtocolService],
})
export class AnalyticsModule {}
