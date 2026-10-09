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
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
const toStringArray = ({ value }) => value === undefined
    ? undefined
    : (Array.isArray(value) ? value : [value])
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);
const toBoolean = ({ value }) => value === undefined || value === true || value === false
    ? value
    : value === 'true'
        ? true
        : value === 'false'
            ? false
            : value;
export class ProductQueryDto extends PaginationQueryDto {
    category;
    status;
    gender;
    size;
    color;
    fabric;
    fabricOrigin;
    fit;
    minPrice;
    maxPrice;
    inStock;
    featured;
    newArrival;
    bestSeller;
    onSale;
    expressAvailable;
    sort;
}
__decorate([
    ApiPropertyOptional({ description: 'Category slug or name' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "category", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['Active', 'Low Stock', 'Out of Stock', 'Archived', 'All'] }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ enum: Gender }),
    IsEnum(Gender),
    IsOptional(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "gender", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    Transform(toStringArray),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], ProductQueryDto.prototype, "size", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    Transform(toStringArray),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], ProductQueryDto.prototype, "color", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    Transform(toStringArray),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], ProductQueryDto.prototype, "fabric", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    Transform(toStringArray),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], ProductQueryDto.prototype, "fabricOrigin", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    Transform(toStringArray),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], ProductQueryDto.prototype, "fit", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 0 }),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], ProductQueryDto.prototype, "minPrice", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 0 }),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], ProductQueryDto.prototype, "maxPrice", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(toBoolean),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], ProductQueryDto.prototype, "inStock", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(toBoolean),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], ProductQueryDto.prototype, "featured", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(toBoolean),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], ProductQueryDto.prototype, "newArrival", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(toBoolean),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], ProductQueryDto.prototype, "bestSeller", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(toBoolean),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], ProductQueryDto.prototype, "onSale", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(toBoolean),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], ProductQueryDto.prototype, "expressAvailable", void 0);
__decorate([
    ApiPropertyOptional({
        enum: ['featured', 'newest', 'price-asc', 'price-desc', 'best-selling'],
        default: 'newest',
    }),
    IsEnum(['featured', 'newest', 'price-asc', 'price-desc', 'best-selling']),
    IsOptional(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "sort", void 0);
//# sourceMappingURL=product-query.dto.js.map