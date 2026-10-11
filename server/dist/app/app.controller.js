var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
let AppController = class AppController {
    getRoot() {
        return {
            success: true,
            message: 'Rongin Libas API is operational',
            data: {
                status: 'ok',
                service: 'rongin-libas-backend',
                environment: process.env.NODE_ENV || 'development',
                documentation: '/api/docs',
                healthCheck: '/api/v1/health',
                timestamp: new Date().toISOString(),
            },
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Backend root status check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
AppController = __decorate([
    ApiTags('System'),
    Public(),
    Controller()
], AppController);
export { AppController };
//# sourceMappingURL=app.controller.js.map