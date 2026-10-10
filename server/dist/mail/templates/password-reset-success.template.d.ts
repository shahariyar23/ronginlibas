export interface PasswordResetSuccessTemplateOptions {
    name?: string;
    loginUrl: string;
    webUrl?: string;
}
export declare function renderPasswordResetSuccessEmail(options: PasswordResetSuccessTemplateOptions): {
    subject: string;
    html: string;
    text: string;
};
