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
    ApiProperty(),
    IsString(),
    MaxLength(40),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "orderNumber", void 0);
__decorate([
    ApiProperty({ enum: ['BKASH', 'NAGAD', 'CARD'] }),
    IsIn(['BKASH', 'NAGAD', 'CARD']),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "provider", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(20),
    IsOptional(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "trackingToken", void 0);
export class VerifyPaymentDto {
    transactionId;
}
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "transactionId", void 0);
//# sourceMappingURL=payment-request.dto.js.map