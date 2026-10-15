import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  WEB_FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  ADMIN_FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  APP_URL?: string;

  @IsString()
  @IsOptional()
  ADMIN_URL?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsString()
  @IsOptional()
  SMTP_PORT?: string;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  @IsString()
  @IsOptional()
  SMTP_FROM?: string;

  @IsString()
  @IsOptional()
  SMTP_SECURE?: string;

  @IsString()
  @IsOptional()
  BKASH_APP_KEY?: string;

  @IsString()
  @IsOptional()
  BKASH_APP_SECRET?: string;

  @IsString()
  @IsOptional()
  NAGAD_MERCHANT_ID?: string;

  @IsString()
  @IsOptional()
  NAGAD_MERCHANT_PRIVATE_KEY?: string;

  @IsString()
  @IsOptional()
  SSLCOMMERZ_STORE_ID?: string;

  @IsString()
  @IsOptional()
  SSLCOMMERZ_STORE_PASSWORD?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  @IsString()
  @IsOptional()
  PATHAO_ENV?: string;

  @IsString()
  @IsOptional()
  PATHAO_BASE_URL?: string;

  @IsString()
  @IsOptional()
  PATHAO_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  PATHAO_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  PATHAO_USERNAME?: string;

  @IsString()
  @IsOptional()
  PATHAO_PASSWORD?: string;

  @IsString()
  @IsOptional()
  PATHAO_GRANT_TYPE?: string;

  @IsString()
  @IsOptional()
  WAITMARK_PUBLIC_KEY?: string;

  @IsString()
  @IsOptional()
  WAITMARK_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  WAITMARK_CHECKOUT_URL?: string;

  @IsString()
  @IsOptional()
  WAITMARK_SUCCESS_URL?: string;

  @IsString()
  @IsOptional()
  META_PIXEL_ID?: string;

  @IsString()
  @IsOptional()
  META_CONVERSIONS_API_ACCESS_TOKEN?: string;

  @IsString()
  @IsOptional()
  META_TEST_EVENT_CODE?: string;

  @IsString()
  @IsOptional()
  UDDOKTAPAY_BASE_URL?: string;

  @IsString()
  @IsOptional()
  UDDOKTAPAY_API_KEY?: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  BACKEND_PUBLIC_URL?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  if (validatedConfig.NODE_ENV === Environment.Production) {
    for (const [key, value] of [
      ['JWT_ACCESS_SECRET', validatedConfig.JWT_ACCESS_SECRET],
      ['JWT_REFRESH_SECRET', validatedConfig.JWT_REFRESH_SECRET],
    ] as const) {
      if (!value || value.length < 32 || value.includes('change_in_production')) {
        console.warn(
          `[SECURITY NOTICE] ${key} is either not set or contains default/short placeholder in production. Please set a strong 32+ char secret in Vercel Environment Variables.`,
        );
      }
    }
  }
  return validatedConfig;
}
