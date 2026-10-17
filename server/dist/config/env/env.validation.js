var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
var Environment;
(function (Environment) {
    Environment["Development"] = "development";
    Environment["Production"] = "production";
    Environment["Test"] = "test";
})(Environment || (Environment = {}));
class EnvironmentVariables {
    NODE_ENV = Environment.Development;
    PORT = 4000;
    DATABASE_URL;
    JWT_ACCESS_SECRET;
    JWT_REFRESH_SECRET;
    WEB_FRONTEND_URL;
    ADMIN_FRONTEND_URL;
    APP_URL;
    ADMIN_URL;
    SMTP_HOST;
    SMTP_PORT;
    SMTP_USER;
    SMTP_PASS;
    SMTP_FROM;
    SMTP_SECURE;
    BKASH_APP_KEY;
    BKASH_APP_SECRET;
    NAGAD_MERCHANT_ID;
    NAGAD_MERCHANT_PRIVATE_KEY;
    SSLCOMMERZ_STORE_ID;
    SSLCOMMERZ_STORE_PASSWORD;
    CLOUDINARY_CLOUD_NAME;
    CLOUDINARY_API_KEY;
    CLOUDINARY_API_SECRET;
    PATHAO_ENV;
    PATHAO_BASE_URL;
    PATHAO_CLIENT_ID;
    PATHAO_CLIENT_SECRET;
    PATHAO_USERNAME;
    PATHAO_PASSWORD;
    PATHAO_GRANT_TYPE;
    META_PIXEL_ID;
    META_CONVERSIONS_API_ACCESS_TOKEN;
    META_TEST_EVENT_CODE;
    UDDOKTAPAY_ENV;
    UDDOKTAPAY_BASE_URL;
    UDDOKTAPAY_API_KEY;
    UDDOKTAPAY_WEBHOOK_URL;
    UDDOKTAPAY_SUCCESS_URL;
    UDDOKTAPAY_CANCEL_URL;
    FRONTEND_URL;
    BACKEND_PUBLIC_URL;
    STEADFAST_ENABLED;
    STEADFAST_MODE;
    STEADFAST_BASE_URL;
    STEADFAST_API_KEY;
    STEADFAST_SECRET_KEY;
    STEADFAST_TIMEOUT;
    STEADFAST_WEBHOOK_SECRET;
}
__decorate([
    IsEnum(Environment),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DATABASE_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_ACCESS_SECRET", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_SECRET", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "WEB_FRONTEND_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "ADMIN_FRONTEND_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "APP_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "ADMIN_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_HOST", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_PORT", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_USER", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_PASS", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_FROM", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_SECURE", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "BKASH_APP_KEY", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "BKASH_APP_SECRET", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NAGAD_MERCHANT_ID", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NAGAD_MERCHANT_PRIVATE_KEY", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SSLCOMMERZ_STORE_ID", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SSLCOMMERZ_STORE_PASSWORD", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CLOUDINARY_CLOUD_NAME", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CLOUDINARY_API_KEY", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CLOUDINARY_API_SECRET", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "PATHAO_ENV", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "PATHAO_BASE_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "PATHAO_CLIENT_ID", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "PATHAO_CLIENT_SECRET", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "PATHAO_USERNAME", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "PATHAO_PASSWORD", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "PATHAO_GRANT_TYPE", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "META_PIXEL_ID", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "META_CONVERSIONS_API_ACCESS_TOKEN", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "META_TEST_EVENT_CODE", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "UDDOKTAPAY_ENV", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "UDDOKTAPAY_BASE_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "UDDOKTAPAY_API_KEY", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "UDDOKTAPAY_WEBHOOK_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "UDDOKTAPAY_SUCCESS_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "UDDOKTAPAY_CANCEL_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "FRONTEND_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "BACKEND_PUBLIC_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STEADFAST_ENABLED", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STEADFAST_MODE", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STEADFAST_BASE_URL", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STEADFAST_API_KEY", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STEADFAST_SECRET_KEY", void 0);
__decorate([
    IsNumber(),
    IsOptional(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "STEADFAST_TIMEOUT", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "STEADFAST_WEBHOOK_SECRET", void 0);
export function validateEnv(config) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    if (validatedConfig.STEADFAST_MODE === 'live') {
        if (!validatedConfig.STEADFAST_API_KEY || !validatedConfig.STEADFAST_SECRET_KEY) {
            throw new Error('STEADFAST_API_KEY and STEADFAST_SECRET_KEY are required when STEADFAST_MODE=live');
        }
    }
    if (validatedConfig.NODE_ENV === Environment.Production) {
        for (const [key, value] of [
            ['JWT_ACCESS_SECRET', validatedConfig.JWT_ACCESS_SECRET],
            ['JWT_REFRESH_SECRET', validatedConfig.JWT_REFRESH_SECRET],
        ]) {
            if (!value || value.length < 32 || value.includes('change_in_production')) {
                console.warn(`[SECURITY NOTICE] ${key} is either not set or contains default/short placeholder in production. Please set a strong 32+ char secret in Vercel Environment Variables.`);
            }
        }
    }
    return validatedConfig;
}
//# sourceMappingURL=env.validation.js.map