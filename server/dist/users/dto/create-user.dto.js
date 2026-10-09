var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/constants/roles.constant.js';
export class CreateUserDto {
    email;
    password;
    firstName;
    lastName;
    role = UserRole.MANAGER;
    permissions;
    mustChangePassword = true;
}
__decorate([
    ApiProperty({ example: 'manager@ronginlibas.com' }),
    IsEmail({}, { message: 'Please provide a valid email address' }),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'SecurePassword123' }),
    IsString(),
    IsNotEmpty(),
    MinLength(6, { message: 'Password must be at least 6 characters long' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    ApiProperty({ example: 'Farhan' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    ApiProperty({ example: 'Hasan' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    ApiPropertyOptional({ enum: UserRole, default: UserRole.MANAGER }),
    IsEnum(UserRole),
    IsOptional(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    ApiPropertyOptional({ example: ['products', 'orders'] }),
    IsArray(),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "permissions", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "mustChangePassword", void 0);
//# sourceMappingURL=create-user.dto.js.map