var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class WaitmarkWebhookPayloadDto {
    order_id;
    trx_id;
    amount;
    currency;
    status;
    paid_at;
}
__decorate([
    ApiProperty({ description: 'Merchant order identifier / payment attempt ID', example: 'WMPAY-RL559840-ABCD' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], WaitmarkWebhookPayloadDto.prototype, "order_id", void 0);
__decorate([
    ApiProperty({ description: 'Waitmark unique transaction identifier', example: 'WM7X9K2P1Q' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], WaitmarkWebhookPayloadDto.prototype, "trx_id", void 0);
__decorate([
    ApiProperty({ description: 'Authorized payment amount', example: '500.00' }),
    IsNotEmpty(),
    __metadata("design:type", Object)
], WaitmarkWebhookPayloadDto.prototype, "amount", void 0);
__decorate([
    ApiProperty({ description: 'Currency code', example: 'BDT' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], WaitmarkWebhookPayloadDto.prototype, "currency", void 0);
__decorate([
    ApiProperty({ description: 'Payment status from Waitmark', example: 'completed' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], WaitmarkWebhookPayloadDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ description: 'ISO timestamp when transaction was completed', example: '2026-07-28T14:30:00Z' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], WaitmarkWebhookPayloadDto.prototype, "paid_at", void 0);
//# sourceMappingURL=waitmark-webhook.dto.js.map