var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class SteadfastWebhookDto {
    notification_type;
    consignment_id;
    invoice;
    tracking_code;
    status;
    delivery_status;
    cod_amount;
}
__decorate([
    ApiPropertyOptional({ description: 'Notification type sent by Steadfast', example: 'delivery_status' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], SteadfastWebhookDto.prototype, "notification_type", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Steadfast Consignment ID', example: '123456' }),
    IsOptional(),
    __metadata("design:type", Object)
], SteadfastWebhookDto.prototype, "consignment_id", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Merchant invoice number', example: 'RL-INV-2026-000001' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], SteadfastWebhookDto.prototype, "invoice", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Steadfast tracking code', example: 'ST123456' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], SteadfastWebhookDto.prototype, "tracking_code", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Delivery status', example: 'delivered' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], SteadfastWebhookDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Alternative delivery status key', example: 'delivered' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], SteadfastWebhookDto.prototype, "delivery_status", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Collected or remaining COD amount', example: 1500 }),
    IsOptional(),
    __metadata("design:type", Number)
], SteadfastWebhookDto.prototype, "cod_amount", void 0);
//# sourceMappingURL=steadfast-webhook.dto.js.map