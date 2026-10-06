var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsEnum, Min, } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateVariantDto {
    size;
    color;
    sku;
    stock;
    priceOverride;
}
__decorate([
    ApiProperty({ example: '40' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateVariantDto.prototype, "size", void 0);
__decorate([
    ApiProperty({ example: 'Heritage Olive' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateVariantDto.prototype, "color", void 0);
__decorate([
    ApiProperty({ example: 'RL-PNJ-25-OG-M' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateVariantDto.prototype, "sku", void 0);
__decorate([
    ApiProperty({ example: 12 }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateVariantDto.prototype, "stock", void 0);
__decorate([
    ApiPropertyOptional({ example: 3450 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], CreateVariantDto.prototype, "priceOverride", void 0);
export class CreateProductImageDto {
    url;
    altText;
    sortOrder;
    isPrimary;
}
__decorate([
    ApiProperty({ example: 'https://images.example.com/panjabi-1.jpg' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateProductImageDto.prototype, "url", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Imperial Zari Panjabi front angle' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductImageDto.prototype, "altText", void 0);
__decorate([
    ApiPropertyOptional({ example: 0 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductImageDto.prototype, "sortOrder", void 0);
__decorate([
    ApiPropertyOptional({ example: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateProductImageDto.prototype, "isPrimary", void 0);
export class CreateProductDto {
    name;
    slug;
    description;
    price;
    compareAtPrice;
    costPrice;
    sku;
    gender = 'MEN';
    fabric;
    fit;
    categoryId;
    isActive = true;
    isFeatured = false;
    isNewArrival = true;
    isBestSeller = false;
    variants;
    images;
}
__decorate([
    ApiProperty({ example: 'Imperial Zari Embroidered Panjabi - Heritage Olive' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: 'imperial-zari-embroidered-panjabi-heritage-olive' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'Handcrafted for solemn evening gatherings and celebratory Eid assemblies...',
    }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ example: 3850 }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    ApiPropertyOptional({ example: 3450 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "compareAtPrice", void 0);
__decorate([
    ApiPropertyOptional({ example: 1620 }),
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "costPrice", void 0);
__decorate([
    ApiProperty({ example: 'RL-PNJ-25-C' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "sku", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['MEN', 'WOMEN', 'UNISEX'], default: 'MEN' }),
    IsEnum(['MEN', 'WOMEN', 'UNISEX']),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "gender", void 0);
__decorate([
    ApiPropertyOptional({ example: '100% Giza Egyptian Combed Cotton' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "fabric", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Tailored Slim Fit' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "fit", void 0);
__decorate([
    ApiProperty({ example: 'panjabi-cat-id' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isActive", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isFeatured", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isNewArrival", void 0);
__decorate([
    ApiPropertyOptional({ default: false }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isBestSeller", void 0);
__decorate([
    ApiPropertyOptional({ type: [CreateVariantDto] }),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => CreateVariantDto),
    IsOptional(),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "variants", void 0);
__decorate([
    ApiPropertyOptional({ type: [CreateProductImageDto] }),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => CreateProductImageDto),
    IsOptional(),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "images", void 0);
//# sourceMappingURL=create-product.dto.js.map