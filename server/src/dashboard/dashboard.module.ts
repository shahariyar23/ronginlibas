import { Module } from '@nestjs/common';
import { DashboardService } from './services/dashboard.service.js';
import { DashboardController } from './controllers/dashboard.controller.js';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
