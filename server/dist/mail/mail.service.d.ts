import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private getTransporter;
    private getFromAddress;
    private getWebUrl;
    sendPasswordResetEmail(email: string, resetToken: string, name?: string): Promise<boolean>;
    sendPasswordResetSuccessEmail(email: string, name?: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name?: string): Promise<boolean>;
}
