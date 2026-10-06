import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { appConfig } from '../config/app/app.config.js';
import { databaseConfig } from '../config/database/database.config.js';
import { validateEnv } from '../config/env/env.validation.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { CustomersModule } from '../customers/customers.module.js';
import { ProductsModule } from '../products/products.module.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { OrdersModule } from '../orders/orders.module.js';
import { CouponsModule } from '../coupons/coupons.module.js';
import { ReviewsModule } from '../reviews/reviews.module.js';
import { DashboardModule } from '../dashboard/dashboard.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { ShippingModule } from '../shipping/shipping.module.js';

import { HealthController } from './health.controller.js';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor.js';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    CategoriesModule,
    InventoryModule,
    OrdersModule,
    CouponsModule,
    ReviewsModule,
    DashboardModule,
    SettingsModule,
    PaymentsModule,
    ShippingModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
