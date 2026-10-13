var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { PathaoAuthService } from './services/pathao-auth.service.js';
import { PathaoService } from './services/pathao.service.js';
import { AdminPathaoController } from './controllers/admin-pathao.controller.js';
import { PathaoWebhookController } from './controllers/pathao-webhook.controller.js';
let PathaoModule = class PathaoModule {
};
PathaoModule = __decorate([
    Module({
        imports: [PrismaModule, AuditModule],
        controllers: [AdminPathaoController, PathaoWebhookController],
        providers: [PathaoAuthService, PathaoService],
        exports: [PathaoService, PathaoAuthService],
    })
], PathaoModule);
export { PathaoModule };
//# sourceMappingURL=pathao.module.js.map