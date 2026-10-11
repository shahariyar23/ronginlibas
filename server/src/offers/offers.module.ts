import { Module } from '@nestjs/common';
import { OffersService } from './services/offers.service.js';
import { OffersController } from './controllers/offers.controller.js';
import { AdminOffersController } from './controllers/admin-offers.controller.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [SettingsModule, AuditModule],
  controllers: [OffersController, AdminOffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
