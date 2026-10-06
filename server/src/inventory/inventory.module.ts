import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service.js';
import { AdminInventoryController } from './controllers/admin-inventory.controller.js';

@Module({
  controllers: [AdminInventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
