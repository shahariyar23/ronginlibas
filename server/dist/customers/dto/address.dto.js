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
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
export class CreateAddressDto {
    fullName;
    email;
    phone;
    addressLine1;
    addressLine2;
    city;
    division;
    area;
    postalCode;
    deliveryInstructions;
    isDefault;
}
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(120),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "fullName", void 0);
__decorate([
    ApiPropertyOptional(),
    IsEmail(),
    IsOptional(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "email", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "phone", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(250),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "addressLine1", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(250),
    IsOptional(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "addressLine2", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "city", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "division", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "area", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(20),
    IsOptional(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "postalCode", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(500),
    IsOptional(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "deliveryInstructions", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(({ value }) => value === true || value === 'true'),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateAddressDto.prototype, "isDefault", void 0);
export class UpdateAddressDto {
    fullName;
    email;
    phone;
    addressLine1;
    addressLine2;
    city;
    division;
    area;
    postalCode;
    deliveryInstructions;
    isDefault;
}
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(120),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "fullName", void 0);
__decorate([
    ApiPropertyOptional(),
    IsEmail(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(250),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "addressLine1", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(250),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "addressLine2", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "city", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "division", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "area", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(20),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "postalCode", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(500),
    IsOptional(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "deliveryInstructions", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(({ value }) => value === true || value === 'true'),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateAddressDto.prototype, "isDefault", void 0);
//# sourceMappingURL=address.dto.js.map