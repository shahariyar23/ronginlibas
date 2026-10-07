import { Module } from '@nestjs/common';
import { SettingsService } from './services/settings.service.js';
import { SettingsController } from './controllers/settings.controller.js';
import { AdminSettingsController } from './controllers/admin-settings.controller.js';
import { StoreSettingsController } from './controllers/store-settings.controller.js';

@Module({
  controllers: [SettingsController, StoreSettingsController, AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
