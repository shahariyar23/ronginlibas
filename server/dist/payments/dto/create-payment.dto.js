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
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreatePaymentDto {
    orderNumber;
    provider;
    phone;
    trackingToken;
}
__decorate([
    ApiProperty({ description: 'Order ID or order number (#RL...)', example: '#RL1001' }),
    IsString(),
    MaxLength(60),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "orderNumber", void 0);
__decorate([
    ApiProperty({ enum: ['BKASH', 'NAGAD', 'CARD', 'UDDOKTAPAY'] }),
    IsIn(['BKASH', 'NAGAD', 'CARD', 'UDDOKTAPAY']),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "provider", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Contact phone for guest order access' }),
    IsString(),
    MaxLength(25),
    IsOptional(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Guest tracking token for guest order access' }),
    IsString(),
    MaxLength(128),
    IsOptional(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "trackingToken", void 0);
//# sourceMappingURL=create-payment.dto.js.map