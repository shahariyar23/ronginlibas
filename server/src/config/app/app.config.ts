import { registerAs } from '@nestjs/config';

const isProduction = process.env.NODE_ENV === 'production';

const defaultWebFrontendUrl = isProduction
  ? 'https://ronginlibas.com'
  : 'http://localhost:3000';

const resolvedWebFrontendUrl = (
  process.env.WEB_FRONTEND_URL ||
  process.env.FRONTEND_URL ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  defaultWebFrontendUrl
).replace(/\/$/, '');

const defaultAdminFrontendUrl = isProduction
  ? 'https://admin.ronginlibas.com'
  : 'http://localhost:3001';

const resolvedAdminFrontendUrl = (
  process.env.ADMIN_FRONTEND_URL ||
  process.env.ADMIN_URL ||
  defaultAdminFrontendUrl
).replace(/\/$/, '');

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: '/api/v1',
  webFrontendUrl: resolvedWebFrontendUrl,
  adminFrontendUrl: resolvedAdminFrontendUrl,
  corsOrigins: [
    ...(isProduction
      ? ['https://ronginlibas.com', 'https://www.ronginlibas.com', 'https://admin.ronginlibas.com']
      : ['http://localhost:3000', 'http://localhost:3001']),
    resolvedWebFrontendUrl,
    resolvedAdminFrontendUrl,
    process.env.WEB_FRONTEND_URL,
    process.env.FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL,
    process.env.ADMIN_URL,
  ].filter((origin): origin is string => Boolean(origin)),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'rongin_libas_dev_access_secret_key_change_in_production_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'rongin_libas_dev_refresh_secret_key_change_in_production_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
}));
