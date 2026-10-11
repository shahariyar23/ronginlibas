var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class SocialLoginDto {
    idToken;
    fullName;
}
__decorate([
    ApiProperty({
        description: 'Firebase ID Token obtained after Google authentication',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
    }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SocialLoginDto.prototype, "idToken", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Optional customer name passed during initial social authorization',
        example: 'Mahfuzur Rahman',
    }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], SocialLoginDto.prototype, "fullName", void 0);
//# sourceMappingURL=social-login.dto.js.map