var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/constants/roles.constant.js';
export class UpdateUserDto {
    email;
    password;
    firstName;
    lastName;
    role;
    permissions;
    isActive;
    mustChangePassword;
}
__decorate([
    ApiPropertyOptional({ example: 'manager@ronginlibas.com' }),
    IsEmail({}, { message: 'Please provide a valid email address' }),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({ example: 'NewSecret123' }),
    IsString(),
    MinLength(6, { message: 'Password must be at least 6 characters long' }),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "password", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Farhan' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Hasan' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    ApiPropertyOptional({ enum: UserRole }),
    IsEnum(UserRole),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
__decorate([
    ApiPropertyOptional({ example: ['products', 'orders'] }),
    IsArray(),
    IsString({ each: true }),
    IsOptional(),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "permissions", void 0);
__decorate([
    ApiPropertyOptional({ default: true }),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "isActive", void 0);
__decorate([
    ApiPropertyOptional(),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "mustChangePassword", void 0);
//# sourceMappingURL=update-user.dto.js.map