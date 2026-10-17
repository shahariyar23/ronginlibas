declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL?: string;
    JWT_ACCESS_SECRET?: string;
    JWT_REFRESH_SECRET?: string;
    WEB_FRONTEND_URL?: string;
    ADMIN_FRONTEND_URL?: string;
    APP_URL?: string;
    ADMIN_URL?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM?: string;
    SMTP_SECURE?: string;
    BKASH_APP_KEY?: string;
    BKASH_APP_SECRET?: string;
    NAGAD_MERCHANT_ID?: string;
    NAGAD_MERCHANT_PRIVATE_KEY?: string;
    SSLCOMMERZ_STORE_ID?: string;
    SSLCOMMERZ_STORE_PASSWORD?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    PATHAO_ENV?: string;
    PATHAO_BASE_URL?: string;
    PATHAO_CLIENT_ID?: string;
    PATHAO_CLIENT_SECRET?: string;
    PATHAO_USERNAME?: string;
    PATHAO_PASSWORD?: string;
    PATHAO_GRANT_TYPE?: string;
    META_PIXEL_ID?: string;
    META_CONVERSIONS_API_ACCESS_TOKEN?: string;
    META_TEST_EVENT_CODE?: string;
    UDDOKTAPAY_ENV?: string;
    UDDOKTAPAY_BASE_URL?: string;
    UDDOKTAPAY_API_KEY?: string;
    UDDOKTAPAY_WEBHOOK_URL?: string;
    UDDOKTAPAY_SUCCESS_URL?: string;
    UDDOKTAPAY_CANCEL_URL?: string;
    FRONTEND_URL?: string;
    BACKEND_PUBLIC_URL?: string;
    STEADFAST_ENABLED?: string;
    STEADFAST_MODE?: string;
    STEADFAST_BASE_URL?: string;
    STEADFAST_API_KEY?: string;
    STEADFAST_SECRET_KEY?: string;
    STEADFAST_TIMEOUT?: number;
    STEADFAST_WEBHOOK_SECRET?: string;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
export {};
