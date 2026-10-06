import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { UsersController } from './controllers/users.controller.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
