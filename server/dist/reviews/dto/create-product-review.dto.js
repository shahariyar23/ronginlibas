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
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class CreateProductReviewDto {
    rating;
    comment;
    images;
}
__decorate([
    ApiProperty({ minimum: 1, maximum: 5 }),
    IsInt(),
    Min(1),
    Max(5),
    __metadata("design:type", Number)
], CreateProductReviewDto.prototype, "rating", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    IsNotEmpty(),
    MaxLength(3000),
    __metadata("design:type", String)
], CreateProductReviewDto.prototype, "comment", void 0);
__decorate([
    ApiPropertyOptional({ example: ['https://res.cloudinary.com/.../image.jpg'], type: [String] }),
    IsOptional(),
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], CreateProductReviewDto.prototype, "images", void 0);
//# sourceMappingURL=create-product-review.dto.js.map