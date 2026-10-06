export declare const appConfig: (() => {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    webFrontendUrl: string;
    adminFrontendUrl: string;
    corsOrigins: string[];
    jwt: {
        accessSecret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    webFrontendUrl: string;
    adminFrontendUrl: string;
    corsOrigins: string[];
    jwt: {
        accessSecret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
}>;
