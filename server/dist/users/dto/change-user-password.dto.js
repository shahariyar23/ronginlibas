var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class ChangeUserPasswordDto {
    currentPassword;
    newPassword;
}
__decorate([
    ApiPropertyOptional({ example: 'CurrentSecret123' }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], ChangeUserPasswordDto.prototype, "currentPassword", void 0);
__decorate([
    ApiProperty({ example: 'MyNewSecret123' }),
    IsString(),
    IsNotEmpty(),
    MinLength(6, { message: 'New password must be at least 6 characters long' }),
    __metadata("design:type", String)
], ChangeUserPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=change-user-password.dto.js.map