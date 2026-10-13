import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service.js';
import { AdminInventoryController } from './controllers/admin-inventory.controller.js';
import { WishlistModule } from '../wishlist/wishlist.module.js';

@Module({
  imports: [WishlistModule],
  controllers: [AdminInventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
