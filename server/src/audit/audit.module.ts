import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { AdminAuditController } from './controllers/admin-audit.controller.js';

@Global()
@Module({
  controllers: [AdminAuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
