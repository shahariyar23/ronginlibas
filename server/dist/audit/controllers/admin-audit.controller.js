var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditQueryDto } from '../dto/audit-query.dto.js';
import { AuditService } from '../audit.service.js';
let AdminAuditController = class AdminAuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    async findAll(query) {
        const data = await this.auditService.findAll(query);
        return {
            message: 'Administrative activity retrieved successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List administrative activity and change history' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAuditController.prototype, "findAll", null);
AdminAuditController = __decorate([
    ApiTags('Admin - Activity'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    Controller('admin/activity'),
    __metadata("design:paramtypes", [AuditService])
], AdminAuditController);
export { AdminAuditController };
//# sourceMappingURL=admin-audit.controller.js.map