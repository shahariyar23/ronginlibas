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

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('app.jwt.accessSecret') ||
          'rongin_libas_dev_access_secret_key_change_in_production_2026',
        signOptions: {
          expiresIn: (configService.get<string>('app.jwt.accessExpiresIn') || '15m') as any,
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
export class AuthModule {}
