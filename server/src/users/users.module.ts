import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { UsersController } from './controllers/users.controller.js';

import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
