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
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
export class AddCartItemDto {
    variantId;
    quantity;
    cartId;
}
__decorate([
    ApiProperty(),
    IsUUID(),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "variantId", void 0);
__decorate([
    ApiProperty({ minimum: 1 }),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], AddCartItemDto.prototype, "quantity", void 0);
__decorate([
    ApiPropertyOptional(),
    IsUUID(),
    IsOptional(),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "cartId", void 0);
export class UpdateCartItemDto {
    quantity;
    cartId;
}
__decorate([
    ApiProperty({ minimum: 1 }),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "quantity", void 0);
__decorate([
    ApiPropertyOptional(),
    IsUUID(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCartItemDto.prototype, "cartId", void 0);
export class CartIdentityDto {
    cartId;
}
__decorate([
    ApiPropertyOptional(),
    IsUUID(),
    IsOptional(),
    __metadata("design:type", String)
], CartIdentityDto.prototype, "cartId", void 0);
export class CartContactDto {
    cartId;
    email;
    phone;
    name;
}
__decorate([
    ApiPropertyOptional(),
    IsUUID(),
    IsOptional(),
    __metadata("design:type", String)
], CartContactDto.prototype, "cartId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", String)
], CartContactDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", String)
], CartContactDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", String)
], CartContactDto.prototype, "name", void 0);
export class AdminCartQueryDto {
    page;
    limit;
    filter;
    search;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", String)
], AdminCartQueryDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", String)
], AdminCartQueryDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", String)
], AdminCartQueryDto.prototype, "filter", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", String)
], AdminCartQueryDto.prototype, "search", void 0);
export class SendCartReminderDto {
    customMessage;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    __metadata("design:type", String)
], SendCartReminderDto.prototype, "customMessage", void 0);
//# sourceMappingURL=cart-item.dto.js.map