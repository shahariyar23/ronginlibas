import { Module } from '@nestjs/common';
import { CustomersService } from './services/customers.service.js';
import { CustomersController } from './controllers/customers.controller.js';
import { AdminCustomersController } from './controllers/admin-customers.controller.js';

@Module({
  controllers: [CustomersController, AdminCustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
