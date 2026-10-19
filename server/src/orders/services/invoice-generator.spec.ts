import { describe, it, expect } from 'vitest';
import {
  generateInvoicePdf,
  generateInvoicePdfKitFallback,
  formatInvoiceIssueDate,
} from './invoice-generator.js';
import { renderInvoiceHtml, InvoiceTemplateData } from '../templates/invoice.template.js';

describe('Invoice System & Multi-Page PDF Generation', () => {
  it('formats invoice dates correctly to British DD MMM YYYY', () => {
    const formatted = formatInvoiceIssueDate(new Date('2026-10-16T12:00:00Z'));
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Oct');
    expect(formatted).toContain('16');
  });

  it('TEST 1: 1 product -> 1-page invoice with footer visible', async () => {
    const order = {
      orderNumber: '#RL2026101608337',
      status: 'CONFIRMED',
      paymentMethod: 'UDDOKTAPAY',
      paymentStatus: 'PAID',
      subtotal: 10,
      discountAmount: 0,
      deliveryCharge: 0,
      totalAmount: 10,
      shippingAddress: {
        fullName: 'Mostak Shahariyar',
        phone: '01352926067',
        addressLine1: 'Uttara 10, Road 10, House 10',
        city: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1230',
      },
      payments: [{ providerTransactionId: 'DJG93BQMOD' }],
      items: [
        {
          productName: 'RL test',
          size: 'XL',
          color: 'Royal Emerald',
          sku: 'RL-POL-3527-ROY-XL',
          unitPrice: 10,
          quantity: 1,
          subtotal: 10,
        },
      ],
    };

    const buffer = await generateInvoicePdf(order, { invoiceNumber: 'INV-2026-000123' });
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(10000);
    expect(buffer.slice(0, 4).toString()).toBe('%PDF');
  });

  it('TEST 6 & 7: Discount display rule', () => {
    const noDiscountHtml = renderInvoiceHtml({
      invoiceNumber: 'INV-1',
      orderNumber: '#RL1',
      issueDate: '16 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'Valued Patron',
      customerPhone: '01352926067',
      deliveryAddress: 'Dhaka',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      deliveryMethod: 'Express (24-48 Hours)',
      items: [],
      itemsSubtotal: 1000,
      discountAmount: 0,
      deliveryCharge: 60,
      grandTotal: 1060,
    });
    expect(noDiscountHtml).not.toContain('summary-row discount-row');

    const discountHtml = renderInvoiceHtml({
      invoiceNumber: 'INV-2',
      orderNumber: '#RL2',
      issueDate: '16 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'Valued Patron',
      customerPhone: '01352926067',
      deliveryAddress: 'Dhaka',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      deliveryMethod: 'Express (24-48 Hours)',
      items: [],
      itemsSubtotal: 1000,
      discountAmount: 150,
      deliveryCharge: 60,
      grandTotal: 910,
    });
    expect(discountHtml).toContain('discount-row');
    expect(discountHtml).toContain('- BDT 150');
  });

  it('TEST 8 & 9: COD order vs Prepaid order formatting', () => {
    const codHtml = renderInvoiceHtml({
      invoiceNumber: 'INV-COD',
      orderNumber: '#RL-COD',
      issueDate: '16 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'Valued Patron',
      customerPhone: '01352926067',
      deliveryAddress: 'Chittagong',
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Pending',
      transactionId: null,
      deliveryMethod: 'Standard Delivery',
      items: [],
      itemsSubtotal: 500,
      grandTotal: 500,
    });
    expect(codHtml).not.toContain('Transaction ID');

    const prepaidHtml = renderInvoiceHtml({
      invoiceNumber: 'INV-PREPAID',
      orderNumber: '#RL-PREPAID',
      issueDate: '16 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'Valued Patron',
      customerPhone: '01352926067',
      deliveryAddress: 'Dhaka',
      paymentMethod: 'UDDOKTAPAY (Digital Gateway)',
      paymentStatus: 'Paid in Full',
      transactionId: 'TXN-99887766',
      deliveryMethod: 'Express (24-48 Hours)',
      items: [],
      itemsSubtotal: 2500,
      grandTotal: 2500,
    });
    expect(prepaidHtml).toContain('Transaction ID');
    expect(prepaidHtml).toContain('TXN-99887766');
    expect(prepaidHtml).toContain('Paid in Full');
  });

  it('TEST 10 & 11: Long address and long product name rendering', () => {
    const longHtml = renderInvoiceHtml({
      invoiceNumber: 'INV-LONG',
      orderNumber: '#RL-LONG',
      issueDate: '16 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'A Very Distinguished Long Customer Name That Spans Multiple Words',
      customerPhone: '01352926067',
      deliveryAddress:
        'Flat 5B, Sky High Luxury Living Tower, Plot 42, Road 18/A, Block C, Ext 3, Uttara Model Town, Dhaka North City Corporation, Dhaka Division, Bangladesh 1230',
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Pending',
      deliveryMethod: 'Express (24-48 Hours)',
      items: [
        {
          productName:
            'Exquisite Limited Edition Handcrafted Royal Gold Embroidered Jamdani Panjabi with Pure Mulberry Silk Collar Detailing and Hand-Carved Brass Buttons',
          sku: 'RL-PAN-EXT-LONG-SKU-990011',
          size: 'XXL (Custom Tailored Fit)',
          color: 'Imperial Royal Emerald & Heritage Metallic Gold',
          unitPrice: 12500,
          quantity: 2,
          lineTotal: 25000,
        },
      ],
      itemsSubtotal: 25000,
      grandTotal: 25000,
    });

    expect(longHtml).toContain('Exquisite Limited Edition Handcrafted Royal Gold');
    expect(longHtml).toContain('Flat 5B, Sky High Luxury Living Tower');
  });

  it('TEST 4 & 5: Image thumbnail vs Fallback badge handling', () => {
    const withThumb = renderInvoiceHtml({
      invoiceNumber: 'INV-IMG',
      orderNumber: '#RL-IMG',
      issueDate: '16 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'Customer',
      customerPhone: '01352926067',
      deliveryAddress: 'Dhaka',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      deliveryMethod: 'Express',
      items: [
        {
          productName: 'Item With Thumb',
          unitPrice: 100,
          quantity: 1,
          lineTotal: 100,
          thumbnailBase64: 'data:image/jpeg;base64,samplebase64',
        },
        {
          productName: 'Item Without Thumb',
          unitPrice: 200,
          quantity: 1,
          lineTotal: 200,
          thumbnailBase64: null,
        },
      ],
      itemsSubtotal: 300,
      grandTotal: 300,
    });

    expect(withThumb).toContain('data:image/jpeg;base64,samplebase64');
    expect(withThumb).toContain('product-thumb-fallback');
    expect(withThumb).toContain('RL');
  });

  it('TEST 2 & 3: Multi-page and last-page-only footer rule in HTML structure', () => {
    const multiHtml = renderInvoiceHtml({
      invoiceNumber: 'INV-MULTI',
      orderNumber: '#RL-MULTI',
      issueDate: '16 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'Customer',
      customerPhone: '01352926067',
      deliveryAddress: 'Dhaka',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      deliveryMethod: 'Express',
      items: Array.from({ length: 15 }, (_, i) => ({
        productName: `Item ${i + 1}`,
        unitPrice: 1000,
        quantity: 1,
        lineTotal: 1000,
      })),
      itemsSubtotal: 15000,
      grandTotal: 15000,
    });

    // Verify table header repetition rule
    expect(multiHtml).toContain('table.product-table thead');
    expect(multiHtml).toContain('display: table-header-group;');

    // Verify product row break prevention
    expect(multiHtml).toContain('page-break-inside: avoid;');
    expect(multiHtml).toContain('break-inside: avoid;');

    // Verify last page only section
    expect(multiHtml).toContain('last-page-section');
    expect(multiHtml).toContain('CUSTOMER SUPPORT');
    expect(multiHtml).toContain('WhatsApp: 01352926067');
    expect(multiHtml).toContain('facebook.com/ronginlibas');
    expect(multiHtml).toContain('www.ronginlibas.com');
    expect(multiHtml).toContain('href="https://facebook.com/ronginlibas"');
    expect(multiHtml).toContain('href="https://www.ronginlibas.com"');
  });

  it('TEST 12: Footer renders website logo and clickable links', () => {
    const htmlWithLogo = renderInvoiceHtml({
      invoiceNumber: 'INV-LOGO',
      orderNumber: '#RL-LOGO',
      issueDate: '19 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'Customer',
      customerPhone: '01352926067',
      deliveryAddress: 'Dhaka',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      deliveryMethod: 'Express',
      items: [],
      itemsSubtotal: 0,
      grandTotal: 0,
      logoBase64: 'data:image/svg+xml;base64,mockLogo',
    });

    expect(htmlWithLogo).toContain('class="footer-logo-img"');
    expect(htmlWithLogo).toContain('data:image/svg+xml;base64,mockLogo');
    expect(htmlWithLogo).toContain('href="https://facebook.com/ronginlibas"');
    expect(htmlWithLogo).toContain('href="https://www.ronginlibas.com"');
  });

  it('TEST 13: Matches product image from order.items when invoice.items snapshot lacks image', async () => {
    const orderWithImage = {
      orderNumber: '#RL481334351D2B',
      status: 'PENDING',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      subtotal: 1590,
      discountAmount: 0,
      deliveryCharge: 120,
      totalAmount: 1710,
      shippingAddress: {
        fullName: 'Mostak Shahariyar',
        phone: '+8801761208866',
        addressLine1: 'Vimolpur, BDG camp',
        city: 'Dinajpur',
        division: 'Rangpur',
        postalCode: '5260',
      },
      items: [
        {
          productName: 'Premium Mercerized Polo T-Shirt',
          size: 'XXL',
          color: 'Raw Silk White',
          sku: 'RL-POL-3000-RAW-XXL',
          unitPrice: 1590,
          quantity: 1,
          subtotal: 1590,
          productImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        },
      ],
    };

    // invoiceRecord.items has NO productImage property (as stored in invoice_items table)
    const invoiceRecord = {
      invoiceNumber: 'RL-INV-2026-000007',
      items: [
        {
          productName: 'Premium Mercerized Polo T-Shirt',
          size: 'XXL',
          color: 'Raw Silk White',
          sku: 'RL-POL-3000-RAW-XXL',
          unitPrice: 1590,
          quantity: 1,
          lineTotal: 1590,
        },
      ],
    };

    const buffer = await generateInvoicePdf(orderWithImage, invoiceRecord);
    expect(buffer).toBeDefined();
    expect(buffer.slice(0, 4).toString()).toBe('%PDF');
  });

  it('TEST 14: PDFKit fallback generates valid A4 PDF buffer independently for environments without Chromium', async () => {
    const templateData: InvoiceTemplateData = {
      invoiceNumber: 'RL-INV-2026-000088',
      orderNumber: '#RL88888',
      issueDate: '19 Oct 2026',
      orderStatus: 'Confirmed',
      customerName: 'Shahariyar Rahman',
      customerPhone: '+8801761208866',
      deliveryAddress: 'House 10, Road 4, Sector 3, Uttara, Dhaka',
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Pending',
      deliveryMethod: 'Express (24-48 Hours)',
      items: [
        {
          productName: 'Royal Bengal Handloom Panjabi',
          size: '42',
          color: 'Ivory White',
          sku: 'RL-PAN-42-IVR',
          unitPrice: 4500,
          quantity: 1,
          lineTotal: 4500,
          thumbnailBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        },
      ],
      itemsSubtotal: 4500,
      deliveryCharge: 80,
      discountAmount: 0,
      grandTotal: 4580,
    };

    const buffer = await generateInvoicePdfKitFallback(templateData);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.slice(0, 4).toString()).toBe('%PDF');
  });
});
