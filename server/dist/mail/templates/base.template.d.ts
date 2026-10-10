export interface BaseEmailOptions {
    title: string;
    previewText: string;
    contentHtml: string;
    webUrl?: string;
}
export declare function renderBaseEmailTemplate(options: BaseEmailOptions): string;
