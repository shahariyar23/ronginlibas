var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Equals, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength, MaxLength, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class RegisterCustomerDto {
    phone;
    firstName;
    lastName;
    email;
    password;
    confirmPassword;
    preferredSize;
    preferredFit;
    termsAccepted;
    marketingConsent;
}
__decorate([
    ApiProperty({ example: '01711234567' }),
    IsString(),
    IsNotEmpty(),
    Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "phone", void 0);
__decorate([
    ApiProperty({ example: 'Rahim' }),
    IsString(),
    IsNotEmpty(),
    MaxLength(100),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "firstName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Chowdhury' }),
    IsString(),
    MaxLength(100),
    IsOptional(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "lastName", void 0);
__decorate([
    ApiProperty({ example: 'rahim@gmail.com' }),
    IsEmail(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'SecurePassword123' }),
    IsString(),
    MinLength(10),
    Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "password", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "confirmPassword", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(20),
    IsOptional(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "preferredSize", void 0);
__decorate([
    ApiPropertyOptional(),
    IsString(),
    MaxLength(50),
    IsOptional(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "preferredFit", void 0);
__decorate([
    ApiProperty({ default: true }),
    Transform(({ value }) => value === true || value === 'true'),
    Equals(true),
    __metadata("design:type", Boolean)
], RegisterCustomerDto.prototype, "termsAccepted", void 0);
__decorate([
    ApiPropertyOptional({ default: false }),
    Transform(({ value }) => value === true || value === 'true'),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], RegisterCustomerDto.prototype, "marketingConsent", void 0);
//# sourceMappingURL=register.dto.js.map