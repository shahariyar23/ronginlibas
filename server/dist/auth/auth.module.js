var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CustomerAuthGuard } from './guards/customer-auth.guard.js';
import { OptionalCustomerAuthGuard } from './guards/optional-customer-auth.guard.js';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [
            PassportModule.register({ defaultStrategy: 'jwt' }),
            JwtModule.registerAsync({
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('app.jwt.accessSecret') ||
                        'rongin_libas_dev_access_secret_key_change_in_production_2026',
                    signOptions: {
                        expiresIn: (configService.get('app.jwt.accessExpiresIn') || '15m'),
                    },
                }),
            }),
        ],
        controllers: [AuthController],
        providers: [AuthService, JwtStrategy, JwtAuthGuard, CustomerAuthGuard, OptionalCustomerAuthGuard],
        exports: [
            AuthService,
            JwtAuthGuard,
            CustomerAuthGuard,
            OptionalCustomerAuthGuard,
            PassportModule,
            JwtModule,
        ],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map