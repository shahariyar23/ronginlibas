import { registerAs } from '@nestjs/config';
export const appConfig = registerAs('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    apiPrefix: '/api/v1',
    webFrontendUrl: process.env.WEB_FRONTEND_URL || 'http://localhost:3000',
    adminFrontendUrl: process.env.ADMIN_FRONTEND_URL || 'http://localhost:3001',
    corsOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://ronginlibas.com',
        'https://www.ronginlibas.com',
        process.env.WEB_FRONTEND_URL,
        process.env.ADMIN_FRONTEND_URL,
    ].filter((origin) => Boolean(origin)),
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'rongin_libas_dev_access_secret_key_change_in_production_2026',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'rongin_libas_dev_refresh_secret_key_change_in_production_2026',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
}));
//# sourceMappingURL=app.config.js.map