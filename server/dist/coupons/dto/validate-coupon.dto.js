var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
export class CouponCartItemDto {
    variantId;
    quantity;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], CouponCartItemDto.prototype, "variantId", void 0);
__decorate([
    ApiProperty({ minimum: 1 }),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CouponCartItemDto.prototype, "quantity", void 0);
export class ValidateCouponDto {
    code;
    items;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], ValidateCouponDto.prototype, "code", void 0);
__decorate([
    ApiProperty({ type: [CouponCartItemDto] }),
    IsArray(),
    ArrayMinSize(1),
    ValidateNested({ each: true }),
    Type(() => CouponCartItemDto),
    __metadata("design:type", Array)
], ValidateCouponDto.prototype, "items", void 0);
//# sourceMappingURL=validate-coupon.dto.js.map