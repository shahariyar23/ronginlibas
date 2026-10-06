var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateCategoryDto {
    name;
    slug;
    description;
    image;
    parentId;
    sortOrder = 0;
    isActive = true;
}
__decorate([
    ApiProperty({ example: 'Panjabi' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    ApiPropertyOptional({ example: 'panjabi' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Traditional Elegance & Ancestral Weaves' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://images.example.com/panjabi-cat.jpg' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "image", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "parentId", void 0);
__decorate([
    ApiPropertyOptional({ default: 0 }),
    IsInt(),
    IsOptional(),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "sortOrder", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateCategoryDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-category.dto.js.map