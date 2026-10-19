import { describe, it, expect } from 'vitest';
import {
  renderOrderConfirmationEmail,
  ORDER_STATUS_MAP,
  getOrderStatusBadge,
} from './order-confirmation.template.js';

describe('Order Confirmation Email Template', () => {
  const baseOrderOptions = {
    orderNumber: '#RL20261019-001',
    customerName: 'Shahariyar Rahman',
    items: [
      {
        productName: 'Royal Bengal Handloom Panjabi',
        variantName: 'Ivory / 42',
        size: '42',
        color: 'Ivory',
        quantity: 1,
        unitPrice: 4500,
        subtotal: 4500,
      },
    ],
    subtotal: 4500,
    deliveryCharge: 80,
    discountAmount: 0,
    totalAmount: 4580,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    shippingAddress: {
      fullName: 'Shahariyar Rahman',
      phone: '01711223344',
      addressLine1: 'House 12, Road 5, Block C',
      city: 'Dhaka',
      division: 'Dhaka',
    },
    trackUrl: 'http://localhost:3000/track-order?id=%23RL20261019-001',
    webUrl: 'http://localhost:3000',
    orderDate: '19 October 2026',
    hasInvoiceAttachment: true,
    invoiceNumber: 'RL-INV-2026-000101',
  };

  it('CASE 1: New order displays Confirmed status, never displays Pending Confirmation', () => {
    const { subject, html, text } = renderOrderConfirmationEmail({
      ...baseOrderOptions,
      orderStatus: 'CONFIRMED',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
    });

    // Subject has Confirmed
    expect(subject).toBe('Order Confirmed: #RL20261019-001 | Rongin Libas');

    // Status badge is rendered near top with Confirmed in green
    expect(html).toContain('Status: Confirmed');
    expect(html).toContain('#e6f4ea'); // Emerald green badge
    expect(html).not.toContain('Pending Confirmation');
    expect(html).not.toContain('pending and confirmation');

    // Paragraph does NOT repeat status
    expect(html).toContain('Thank you for shopping with Rongin Libas. Your order has been successfully received');
    expect(html).not.toContain('under status <strong>Pending Confirmation</strong>');

    // Order Information Card contains Order Reference, Placement Date, Payment Method, Payment Status
    expect(html).toContain('Order Reference');
    expect(html).toContain('Placement Date');
    expect(html).toContain('Payment Method');
    expect(html).toContain('Payment Status');
    expect(html).toContain('Cash on Delivery (COD)');
    expect(html).toContain('Pending');

    // "Order Status" header must NOT be duplicated in the Information Card
    expect(html).not.toContain('>Order Status<');
    expect(html).not.toContain('>ORDER STATUS<');

    // Text version check
    expect(text).toContain('ORDER CONFIRMED: #RL20261019-001');
    expect(text).toContain('Payment Method: Cash on Delivery (COD)');
    expect(text).toContain('Payment Status: Pending');
    expect(text).not.toContain('Pending Confirmation');
  });

  it('CASE 2: Even with legacy PENDING status, email displays Confirmed and zero Pending Confirmation', () => {
    const { subject, html, text } = renderOrderConfirmationEmail({
      ...baseOrderOptions,
      orderStatus: 'PENDING',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
    });

    expect(subject).toBe('Order Confirmed: #RL20261019-001 | Rongin Libas');
    expect(html).toContain('Status: Confirmed');
    expect(html).not.toContain('Pending Confirmation');
    expect(text).toContain('ORDER CONFIRMED: #RL20261019-001');
    expect(text).not.toContain('Pending Confirmation');
  });

  it('CASE 3: Prepaid / UddoktaPay order displays Paid payment status and Confirmed order status independently', () => {
    const { subject, html, text } = renderOrderConfirmationEmail({
      ...baseOrderOptions,
      orderStatus: 'CONFIRMED',
      paymentMethod: 'UDDOKTAPAY',
      paymentStatus: 'PAID',
    });

    // Subject shows Confirmed
    expect(subject).toBe('Order Confirmed: #RL20261019-001 | Rongin Libas');

    // Status badge shows Confirmed with green palette
    expect(html).toContain('Status: Confirmed');
    expect(html).toContain('#e6f4ea');
    expect(html).not.toContain('Pending Confirmation');

    // Payment method and payment status
    expect(html).toContain('UddoktaPay (Online Gateway)');
    expect(html).toContain('Paid');

    expect(text).toContain('ORDER CONFIRMED: #RL20261019-001');
    expect(text).toContain('Payment Method: UddoktaPay (Online Gateway)');
    expect(text).toContain('Payment Status: Paid');
  });

  it('CASE 4: Order with CANCELLED status displays Cancelled dynamically without hardcoded Pending Confirmation', () => {
    const { subject, html } = renderOrderConfirmationEmail({
      ...baseOrderOptions,
      orderStatus: 'CANCELLED',
      paymentMethod: 'COD',
      paymentStatus: 'FAILED',
    });

    expect(subject).toContain('(Cancelled)');
    expect(html).toContain('Status: Cancelled');
    expect(html).toContain('#fee2e2'); // red background
    expect(html).not.toContain('Pending Confirmation');
  });

  it('CASE 5: Correctly handles all database OrderStatus enum values', () => {
    const statuses = [
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
      'REFUNDED',
    ];

    for (const st of statuses) {
      const badge = getOrderStatusBadge(st);
      expect(badge.label).toBeDefined();
      expect(badge.bgColor).toBeDefined();

      const { subject, html } = renderOrderConfirmationEmail({
        ...baseOrderOptions,
        orderStatus: st,
      });

      expect(html).toContain(`Status: ${badge.label.replace('&', '&amp;')}`);
      // Ensure "Order Status" is not duplicated in the table
      expect(html).not.toContain('>Order Status<');
    }
  });

  it('CASE 6: Preserves invoice PDF callout and Rongin Libas business contact details', () => {
    const { html, text } = renderOrderConfirmationEmail({
      ...baseOrderOptions,
      hasInvoiceAttachment: true,
      invoiceNumber: 'RL-INV-2026-9999',
    });

    expect(html).toContain('Official Tax Invoice Attached');
    expect(html).toContain('Rongin-Libas-Invoice-RL-INV-2026-9999.pdf');

    // Customer support details
    expect(html).toContain('https://wa.me/8801352926067');
    expect(text).toContain('+8801352926067');
    expect(text).toContain('https://wa.me/8801352926067');

    // Customer recipient details preserved
    expect(html).toContain('Shahariyar Rahman');
    expect(html).toContain('01711223344');
    expect(html).toContain('House 12, Road 5, Block C, Dhaka, Dhaka');
  });

  it('CASE 7: Omits invoice callout when hasInvoiceAttachment is false', () => {
    const { html } = renderOrderConfirmationEmail({
      ...baseOrderOptions,
      hasInvoiceAttachment: false,
    });

    expect(html).not.toContain('Official Tax Invoice Attached');
  });
});
