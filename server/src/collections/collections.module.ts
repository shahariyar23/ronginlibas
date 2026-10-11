import { Module } from '@nestjs/common';
import { CollectionsService } from './services/collections.service.js';
import { CollectionsController } from './controllers/collections.controller.js';
import { AdminCollectionsController } from './controllers/admin-collections.controller.js';

@Module({
  controllers: [CollectionsController, AdminCollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
