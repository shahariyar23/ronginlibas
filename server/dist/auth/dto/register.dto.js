var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class RegisterCustomerDto {
    phone;
    firstName;
    lastName;
    email;
    password;
}
__decorate([
    ApiProperty({ example: '01711234567' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "phone", void 0);
__decorate([
    ApiProperty({ example: 'Rahim' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "firstName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Chowdhury' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "lastName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'rahim@gmail.com' }),
    IsEmail(),
    IsOptional(),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({ example: 'SecurePassword123' }),
    IsString(),
    IsOptional(),
    MinLength(6),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "password", void 0);
//# sourceMappingURL=register.dto.js.map