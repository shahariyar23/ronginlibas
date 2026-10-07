var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsEmail, IsOptional, IsString, Matches, MaxLength, } from 'class-validator';
export class UpdateCustomerProfileDto {
    firstName;
    lastName;
    phone;
    email;
    secondaryPhone;
    dateOfBirth;
    preferredSize;
    preferredFit;
    marketingConsent;
}
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "firstName", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "lastName", void 0);
__decorate([
    ApiPropertyOptional({ example: '+8801712345678' }),
    IsString(),
    Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional(),
    IsEmail(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "secondaryPhone", void 0);
__decorate([
    ApiPropertyOptional(),
    IsDateString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(20),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "preferredSize", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(50),
    IsOptional(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "preferredFit", void 0);
__decorate([
    ApiPropertyOptional(),
    Transform(({ value }) => value === true || value === 'true'),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateCustomerProfileDto.prototype, "marketingConsent", void 0);
//# sourceMappingURL=update-customer-profile.dto.js.map