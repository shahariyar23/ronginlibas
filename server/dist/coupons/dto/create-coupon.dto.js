var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, IsBoolean, Min, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateCouponDto {
    code;
    description;
    type;
    value;
    minimumOrderAmount = 0;
    maximumDiscount;
    startDate;
    expiryDate;
    usageLimit;
    isActive = true;
}
__decorate([
    ApiProperty({ example: 'EID2026' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "code", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Eid-ul-Fitr Grand Atelier Festival' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ enum: ['PERCENTAGE', 'FIXED'], default: 'PERCENTAGE' }),
    IsEnum(['PERCENTAGE', 'FIXED']),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "type", void 0);
__decorate([
    ApiProperty({ example: 15 }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateCouponDto.prototype, "value", void 0);
__decorate([
    ApiPropertyOptional({ example: 5000 }),
    IsNumber(),
    IsOptional(),
    Min(0),
    __metadata("design:type", Number)
], CreateCouponDto.prototype, "minimumOrderAmount", void 0);
__decorate([
    ApiPropertyOptional({ example: 1000 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], CreateCouponDto.prototype, "maximumDiscount", void 0);
__decorate([
    ApiPropertyOptional(),
    IsDateString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "startDate", void 0);
__decorate([
    ApiProperty({ example: '2026-12-31T23:59:59.000Z' }),
    IsDateString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "expiryDate", void 0);
__decorate([
    ApiPropertyOptional({ example: 500 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], CreateCouponDto.prototype, "usageLimit", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateCouponDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-coupon.dto.js.map