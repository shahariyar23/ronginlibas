import { PrismaService } from '../../prisma/prisma.service.js';
import { Invoice, Prisma } from '@prisma/client';
export interface InvoiceWithDetails extends Invoice {
    items: Array<{
        id: string;
        invoiceId: string;
        productId: string | null;
        productVariantId: string | null;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
        lineTotal: Prisma.Decimal;
        variantLabel: string | null;
        size: string | null;
        color: string | null;
        createdAt: Date;
    }>;
    payments?: Array<{
        id: string;
        provider: string;
        providerOrderId: string;
        providerInvoiceId: string | null;
        providerTransactionId: string | null;
        amount: Prisma.Decimal;
        status: string;
        paidAt: Date | null;
    }>;
    order?: {
        id: string;
        orderNumber: string;
        status: string;
        paymentStatus: string;
        paymentMethod: string;
        createdAt: Date;
    };
}
export declare class InvoicesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateNextInvoiceNumber(tx?: Prisma.TransactionClient, year?: number): Promise<string>;
    createInvoiceForOrderInTx(tx: Prisma.TransactionClient, orderId: string, paymentId?: string): Promise<InvoiceWithDetails>;
    getOrCreateInvoiceForOrder(orderId: string, paymentId?: string): Promise<InvoiceWithDetails>;
    findByOrderIdOrNumber(idOrNumber: string): Promise<InvoiceWithDetails | null>;
    findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceWithDetails | null>;
}
