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
