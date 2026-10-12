import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { PathaoAuthService } from './services/pathao-auth.service.js';
import { PathaoService } from './services/pathao.service.js';
import { AdminPathaoController } from './controllers/admin-pathao.controller.js';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminPathaoController],
  providers: [PathaoAuthService, PathaoService],
  exports: [PathaoService, PathaoAuthService],
})
export class PathaoModule {}
