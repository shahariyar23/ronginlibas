export interface PasswordResetTemplateOptions {
    name?: string;
    resetUrl: string;
    expiresInMinutes?: number;
    webUrl?: string;
}
export declare function renderPasswordResetEmail(options: PasswordResetTemplateOptions): {
    subject: string;
    html: string;
    text: string;
};
