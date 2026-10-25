import { InvoiceTemplateData } from '../templates/invoice.template.js';
export declare function getLogoBase64(): string;
export declare function getLogoBuffer(): Buffer | null;
export interface BrowserLaunchConfig {
    executablePath: string;
    args: string[];
    headless: boolean | 'shell';
}
export declare function resolveBrowserLaunchConfig(): Promise<BrowserLaunchConfig>;
export declare function getChromeExecutablePath(): string;
export declare function fetchThumbnailBase64(rawUrl?: string | null): Promise<string | null>;
export declare function formatInvoiceIssueDate(dateInput: Date | string): string;
export declare function generateInvoicePdf(order: any, invoice?: any): Promise<Buffer>;
export declare function generateInvoicePdfKitFallback(data: InvoiceTemplateData): Promise<Buffer>;
