export interface AccountBannedTemplateOptions {
    name?: string;
    reason: string;
    supportEmail?: string;
    supportPhone?: string;
    webUrl?: string;
}
export declare function renderAccountBannedEmail(options: AccountBannedTemplateOptions): {
    subject: string;
    html: string;
    text: string;
};
