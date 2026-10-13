export interface BackInStockEmailOptions {
    customerName?: string | null;
    productName: string;
    productSlug: string;
    price: number | string;
    imageUrl?: string | null;
    size?: string | null;
    color?: string | null;
    webUrl?: string;
}
export declare function renderBackInStockEmail(options: BackInStockEmailOptions): {
    subject: string;
    html: string;
    text: string;
};
