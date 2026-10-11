import { Module } from '@nestjs/common';
import { ReportsService } from './services/reports.service.js';
import { ReportsController } from './controllers/reports.controller.js';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
