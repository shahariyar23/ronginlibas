export interface StaffWelcomeTemplateOptions {
    fullName: string;
    email: string;
    userId: string;
    role: string;
    password: string;
    loginUrl: string;
    mustChangePassword?: boolean;
    webUrl?: string;
}
export declare function renderStaffWelcomeEmail(options: StaffWelcomeTemplateOptions): {
    subject: string;
    html: string;
    text: string;
};
