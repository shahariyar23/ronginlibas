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
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
export class InitiateWaitmarkPaymentDto {
    orderId;
    phone;
    trackingToken;
}
__decorate([
    ApiProperty({
        description: 'Internal order ID (UUID) or customer order reference (#RL...)',
        example: '7c5d2f5d-69f8-454f-8b15-2026fca797e6',
    }),
    IsString(),
    IsNotEmpty(),
    MaxLength(60),
    __metadata("design:type", String)
], InitiateWaitmarkPaymentDto.prototype, "orderId", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Contact phone for guest order access verification',
        example: '01711223344',
    }),
    IsString(),
    IsOptional(),
    MaxLength(25),
    __metadata("design:type", String)
], InitiateWaitmarkPaymentDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Guest tracking token for guest order access verification',
    }),
    IsString(),
    IsOptional(),
    MaxLength(128),
    __metadata("design:type", String)
], InitiateWaitmarkPaymentDto.prototype, "trackingToken", void 0);
//# sourceMappingURL=initiate-waitmark-payment.dto.js.map