import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { MailModule } from '../mail/mail.module.js';
import { CartController, CartMergeController } from './cart.controller.js';
import { AdminCartsController } from './admin-carts.controller.js';
import { CartService } from './cart.service.js';

@Module({
  imports: [AuthModule, SettingsModule, MailModule],
  controllers: [CartController, CartMergeController, AdminCartsController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}

