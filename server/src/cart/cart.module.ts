import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { CartController, CartMergeController } from './cart.controller.js';
import { CartService } from './cart.service.js';

@Module({
  imports: [AuthModule, SettingsModule],
  controllers: [CartController, CartMergeController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
