export interface WelcomeTemplateOptions {
    name?: string;
    shopUrl: string;
    profileUrl: string;
    webUrl?: string;
}
export declare function renderWelcomeEmail(options: WelcomeTemplateOptions): {
    subject: string;
    html: string;
    text: string;
};
