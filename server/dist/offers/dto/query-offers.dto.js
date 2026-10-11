var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min, } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
const toStringArray = ({ value }) => value === undefined
    ? undefined
    : (Array.isArray(value) ? value : [value])
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);
export class QueryOffersDto {
    category;
    discountBand;
    minPrice;
    maxPrice;
    size;
    color;
    tab;
    sort;
    page = 1;
    limit = 24;
}
__decorate([
    ApiPropertyOptional({ description: 'Category slug or name' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], QueryOffersDto.prototype, "category", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Minimum discount percentage (e.g. 10, 20, 30)' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], QueryOffersDto.prototype, "discountBand", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 0 }),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], QueryOffersDto.prototype, "minPrice", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 0 }),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], QueryOffersDto.prototype, "maxPrice", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    Transform(toStringArray),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], QueryOffersDto.prototype, "size", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    Transform(toStringArray),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], QueryOffersDto.prototype, "color", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['all', 'best-discounts', 'bundle'] }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], QueryOffersDto.prototype, "tab", void 0);
__decorate([
    ApiPropertyOptional({
        enum: ['featured', 'discount-high', 'price-low', 'price-high', 'newest'],
        default: 'discount-high',
    }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], QueryOffersDto.prototype, "sort", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 1, default: 1 }),
    Type(() => Number),
    IsInt(),
    Min(1),
    IsOptional(),
    __metadata("design:type", Number)
], QueryOffersDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 1, default: 24 }),
    Type(() => Number),
    IsInt(),
    Min(1),
    IsOptional(),
    __metadata("design:type", Number)
], QueryOffersDto.prototype, "limit", void 0);
export class QueryAdminOffersDto {
    search;
    status;
}
__decorate([
    ApiPropertyOptional(),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], QueryAdminOffersDto.prototype, "search", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED', 'INACTIVE'] }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], QueryAdminOffersDto.prototype, "status", void 0);
//# sourceMappingURL=query-offers.dto.js.map