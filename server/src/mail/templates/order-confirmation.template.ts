import { renderBaseEmailTemplate } from './base.template.js';

export interface OrderConfirmationItem {
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  productImage?: string | null;
}

export interface OrderConfirmationAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  division?: string;
  area?: string;
  postalCode?: string;
  deliveryInstructions?: string;
  [key: string]: any;
}

export interface OrderStatusBadgeConfig {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

export const ORDER_STATUS_MAP: Record<string, OrderStatusBadgeConfig> = {
  PENDING: {
    label: 'Confirmed',
    bgColor: '#e6f4ea',
    borderColor: '#073a2d',
    textColor: '#073a2d',
    icon: '✓',
  },
  CONFIRMED: {
    label: 'Confirmed',
    bgColor: '#e6f4ea',
    borderColor: '#073a2d',
    textColor: '#073a2d',
    icon: '✓',
  },
  PROCESSING: {
    label: 'Processing',
    bgColor: '#e2efe9',
    borderColor: '#0d4d3b',
    textColor: '#073a2d',
    icon: '⚙',
  },
  PACKED: {
    label: 'Packed & Ready',
    bgColor: '#e8f0fe',
    borderColor: '#1e5f74',
    textColor: '#1e5f74',
    icon: '📦',
  },
  SHIPPED: {
    label: 'Shipped',
    bgColor: '#e0f2fe',
    borderColor: '#0284c7',
    textColor: '#0369a1',
    icon: '🚚',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    bgColor: '#fef3c7',
    borderColor: '#d97706',
    textColor: '#b45309',
    icon: '📍',
  },
  DELIVERED: {
    label: 'Delivered',
    bgColor: '#dcfce7',
    borderColor: '#15803d',
    textColor: '#166534',
    icon: '★',
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: '#fee2e2',
    borderColor: '#b91c1c',
    textColor: '#991b1b',
    icon: '✕',
  },
  RETURN_REQUESTED: {
    label: 'Return Requested',
    bgColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    icon: '🔄',
  },
  RETURNED: {
    label: 'Returned',
    bgColor: '#f3f4f6',
    borderColor: '#6b7280',
    textColor: '#374151',
    icon: '↩',
  },
  REFUNDED: {
    label: 'Refunded',
    bgColor: '#ede9fe',
    borderColor: '#7c3aed',
    textColor: '#5b21b6',
    icon: '💳',
  },
};

export function getOrderStatusBadge(status?: string | null): OrderStatusBadgeConfig {
  const key = (status || 'PENDING').trim().toUpperCase();
  return (
    ORDER_STATUS_MAP[key] || {
      label: key.replace(/_/g, ' '),
      bgColor: '#f4f3ec',
      borderColor: '#073a2d',
      textColor: '#073a2d',
      icon: '•',
    }
  );
}

export interface OrderConfirmationEmailOptions {
  orderNumber: string;
  orderStatus?: string | null;
  customerName?: string | null;
  items: OrderConfirmationItem[];
  subtotal: number | string;
  deliveryCharge: number | string;
  discountAmount?: number | string;
  totalAmount: number | string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: OrderConfirmationAddress;
  customerNotes?: string | null;
  trackUrl: string;
  webUrl?: string;
  orderDate?: string;
  hasInvoiceAttachment?: boolean;
  invoiceNumber?: string | null;
}

function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `৳${num.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPaymentMethod(method: string): string {
  if (!method) return 'Cash on Delivery (COD)';
  const upper = method.trim().toUpperCase();
  if (upper === 'COD') return 'Cash on Delivery (COD)';
  if (upper === 'UDDOKTAPAY') return 'UddoktaPay (Online Gateway)';
  if (upper === 'BKASH') return 'bKash';
  if (upper === 'NAGAD') return 'Nagad';
  return method;
}

function formatPaymentStatus(status: string): { label: string; color: string } {
  const upper = (status || 'PENDING').trim().toUpperCase();
  switch (upper) {
    case 'PAID':
      return { label: 'Paid', color: '#073a2d' };
    case 'PARTIALLY_PAID':
      return { label: 'Partially Paid', color: '#c79a45' };
    case 'REFUNDED':
      return { label: 'Refunded', color: '#7c3aed' };
    case 'FAILED':
      return { label: 'Failed', color: '#991b1b' };
    case 'PENDING':
    default:
      return { label: 'Pending', color: '#b45309' };
  }
}

export function renderOrderConfirmationEmail(options: OrderConfirmationEmailOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    orderNumber,
    orderStatus,
    customerName,
    items,
    subtotal,
    deliveryCharge,
    discountAmount = 0,
    totalAmount,
    paymentMethod,
    paymentStatus,
    shippingAddress,
    customerNotes,
    trackUrl,
    webUrl,
    orderDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    hasInvoiceAttachment = true,
    invoiceNumber,
  } = options;

  const statusBadge = getOrderStatusBadge(orderStatus);
  const paymentMethodDisplay = formatPaymentMethod(paymentMethod);
  const paymentStatusDisplay = formatPaymentStatus(paymentStatus);

  const displayName = customerName?.trim() || shippingAddress?.fullName?.trim() || 'Valued Patron';
  const isConfirmed = statusBadge.label === 'Confirmed';
  const subject = isConfirmed
    ? `Order Confirmed: ${orderNumber} | Rongin Libas`
    : `Order Received: ${orderNumber} (${statusBadge.label}) | Rongin Libas`;
  const previewText = isConfirmed
    ? `Your order ${orderNumber} has been confirmed. Total: ${formatCurrency(totalAmount)}.`
    : `Your order ${orderNumber} has been received (${statusBadge.label}). Total: ${formatCurrency(totalAmount)}.`;
  const invFilename = invoiceNumber ? invoiceNumber : orderNumber.replace('#', '');

  const discountNum = typeof discountAmount === 'number' ? discountAmount : parseFloat(discountAmount) || 0;

  const addressLines = [
    shippingAddress?.addressLine1,
    shippingAddress?.addressLine2,
    shippingAddress?.area,
    shippingAddress?.city,
    shippingAddress?.division,
    shippingAddress?.postalCode,
  ].filter(Boolean).join(', ');

  const itemsHtml = items.map((item) => {
    const specs = [
      item.variantName && item.variantName !== item.productName ? item.variantName : null,
      item.size ? `Size: ${item.size}` : null,
      item.color ? `Color: ${item.color}` : null,
      item.sku ? `SKU: ${item.sku}` : null,
    ].filter(Boolean).join(' &bull; ');

    return `
      <tr style="border-bottom: 1px solid #ebe9de;">
        <td style="padding: 14px 10px; vertical-align: top;">
          <div style="font-size: 14px; font-weight: 600; color: #073a2d; line-height: 1.4;">
            ${escapeHtml(item.productName)}
          </div>
          ${specs ? `<div style="font-size: 11px; color: #6b7770; margin-top: 3px;">${specs}</div>` : ''}
        </td>
        <td align="center" style="padding: 14px 10px; font-size: 13px; color: #2b332f; vertical-align: top; white-space: nowrap;">
          ${item.quantity}
        </td>
        <td align="right" style="padding: 14px 10px; font-size: 13px; color: #2b332f; vertical-align: top; white-space: nowrap;">
          ${formatCurrency(item.unitPrice)}
        </td>
        <td align="right" style="padding: 14px 10px; font-size: 13px; font-weight: 600; color: #073a2d; vertical-align: top; white-space: nowrap;">
          ${formatCurrency(item.subtotal)}
        </td>
      </tr>
    `;
  }).join('');

  const contentHtml = `
    <!-- GREETING & PLACEMENT HEADER -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #c79a45; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
        Rongin Libas &bull; Sartorial Atelier
      </div>
      <h1 style="font-family: 'Cinzel', 'Georgia', serif; font-size: 24px; color: #073a2d; margin: 0 0 10px 0; font-weight: 700; line-height: 1.3;">
        ${isConfirmed ? `Order Confirmed: ${escapeHtml(orderNumber)}` : `Order Received: ${escapeHtml(orderNumber)}`}
      </h1>
      <!-- ORDER STATUS BADGE (SINGLE UNBROKEN LINE) -->
      <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 0 16px 0; border-collapse: separate;">
        <tr>
          <td style="background-color: ${statusBadge.bgColor}; border: 1px solid ${statusBadge.borderColor}; color: ${statusBadge.textColor}; padding: 6px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 2px; white-space: nowrap !important; vertical-align: middle; line-height: 1.2;">
            <span style="font-size: 12px; vertical-align: middle; display: inline-block; line-height: 1; margin-right: 6px; white-space: nowrap;">${statusBadge.icon}</span><span style="vertical-align: middle; white-space: nowrap !important; display: inline-block; line-height: 1;">Status: ${escapeHtml(statusBadge.label)}</span>
          </td>
        </tr>
      </table>
      <p style="font-size: 15px; color: #37413d; margin: 0 0 10px 0; line-height: 1.6;">
        Dear <strong>${escapeHtml(displayName)}</strong>,
      </p>
      <p style="font-size: 14px; color: #49544e; margin: 0; line-height: 1.6;">
        Thank you for shopping with Rongin Libas. Your order has been successfully received into our Bengal atelier ledger. We will keep you updated about its progress.
      </p>
    </div>

    ${hasInvoiceAttachment ? `
    <!-- OFFICIAL INVOICE ATTACHED CALLOUT -->
    <div style="background-color: #f7fbf9; border: 1px solid #c79a45; border-radius: 4px; padding: 14px 18px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="30" valign="top" style="font-size: 20px; line-height: 1;">
            📄
          </td>
          <td valign="top" style="padding-left: 10px;">
            <div style="font-size: 12px; font-weight: 700; color: #073a2d; text-transform: uppercase; letter-spacing: 1px;">
              Official Tax Invoice Attached
            </div>
            <div style="font-size: 12px; color: #49544e; margin-top: 3px; line-height: 1.5;">
              Your official A4 PDF tax invoice (<strong>Rongin-Libas-Invoice-${escapeHtml(invFilename)}.pdf</strong>) has been generated and attached to this email for your personal accounting and delivery inspection.
            </div>
          </td>
        </tr>
      </table>
    </div>` : ''}

    <!-- ORDER INFORMATION CARD (CLEAR, BALANCED & NON-DUPLICATIVE) -->
    <div style="background-color: #fcfbf7; border: 1px solid #deddd3; border-radius: 4px; padding: 20px; margin-bottom: 26px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="50%" valign="top" style="padding-bottom: 14px; padding-right: 10px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Order Reference
            </div>
            <div style="font-size: 15px; font-weight: 700; color: #073a2d; margin-top: 3px; font-family: monospace;">
              ${escapeHtml(orderNumber)}
            </div>
          </td>
          <td width="50%" valign="top" style="padding-bottom: 14px; padding-left: 10px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Placement Date
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #2b332f; margin-top: 3px;">
              ${escapeHtml(orderDate)}
            </div>
          </td>
        </tr>
        <tr>
          <td width="50%" valign="top" style="padding-bottom: 14px; padding-right: 10px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Payment Method
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #2b332f; margin-top: 3px;">
              ${escapeHtml(paymentMethodDisplay)}
            </div>
          </td>
          <td width="50%" valign="top" style="padding-bottom: 14px; padding-left: 10px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Payment Status
            </div>
            <div style="font-size: 13px; font-weight: 700; color: ${paymentStatusDisplay.color}; margin-top: 3px;">
              ${escapeHtml(paymentStatusDisplay.label)}
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" valign="top">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Delivery Recipient
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #2b332f; margin-top: 3px;">
              ${escapeHtml(shippingAddress?.fullName || displayName)}
              ${shippingAddress?.phone ? ` &bull; <span style="font-size: 12px; color: #6b7770;">📞 ${escapeHtml(shippingAddress.phone)}</span>` : ''}
            </div>
          </td>
        </tr>
        ${addressLines ? `
        <tr>
          <td colspan="2" style="padding-top: 14px; border-top: 1px dashed #deddd3; margin-top: 12px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Shipping Destination
            </div>
            <div style="font-size: 12px; color: #37413d; margin-top: 3px; line-height: 1.5;">
              📍 ${escapeHtml(addressLines)}
            </div>
          </td>
        </tr>` : ''}
      </table>
    </div>

    <!-- ITEMIZED GARMENT PURCHASE LIST -->
    <div style="margin-bottom: 28px;">
      <div style="font-size: 12px; font-weight: 700; color: #073a2d; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 2px solid #073a2d; padding-bottom: 6px;">
        Itemized Atelier Requisition (${items.length} garment${items.length === 1 ? '' : 's'})
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f7f6ef; border-bottom: 1px solid #deddd3;">
            <th align="left" style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #073a2d; font-weight: 700;">Garment</th>
            <th align="center" style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #073a2d; font-weight: 700;">Qty</th>
            <th align="right" style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #073a2d; font-weight: 700;">Unit</th>
            <th align="right" style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #073a2d; font-weight: 700;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" align="right" style="padding: 10px 10px 4px 10px; font-size: 13px; color: #6b7770;">Subtotal:</td>
            <td align="right" style="padding: 10px 10px 4px 10px; font-size: 13px; color: #2b332f; font-weight: 600;">${formatCurrency(subtotal)}</td>
          </tr>
          ${discountNum > 0 ? `
          <tr>
            <td colspan="3" align="right" style="padding: 4px 10px; font-size: 13px; color: #c79a45;">Atelier Privilege / Discount:</td>
            <td align="right" style="padding: 4px 10px; font-size: 13px; color: #c79a45; font-weight: 600;">- ${formatCurrency(discountNum)}</td>
          </tr>` : ''}
          <tr>
            <td colspan="3" align="right" style="padding: 4px 10px; font-size: 13px; color: #6b7770;">Delivery Concierge:</td>
            <td align="right" style="padding: 4px 10px; font-size: 13px; color: #2b332f; font-weight: 600;">${formatCurrency(deliveryCharge)}</td>
          </tr>
          <tr style="border-top: 2px solid #073a2d;">
            <td colspan="3" align="right" style="padding: 12px 10px; font-size: 15px; font-weight: 700; color: #073a2d; text-transform: uppercase; letter-spacing: 1px;">Total Amount:</td>
            <td align="right" style="padding: 12px 10px; font-size: 18px; font-weight: 700; color: #073a2d; font-family: 'Cinzel', 'Georgia', serif;">${formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${customerNotes ? `
    <!-- PATRON INSTRUCTIONS CALLOUT -->
    <div style="background-color: #faf9f2; border-left: 3px solid #c79a45; padding: 12px 16px; margin-bottom: 26px; border-radius: 0 4px 4px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c79a45; font-weight: 700; margin-bottom: 4px;">
        Patron Notes & Tailoring Instructions
      </div>
      <div style="font-size: 13px; color: #37413d; font-style: italic; line-height: 1.5;">
        "${escapeHtml(customerNotes)}"
      </div>
    </div>` : ''}

    <!-- CTA ACTION -->
    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${trackUrl}" target="_blank" class="btn-green" style="background-color: #073a2d; color: #ffffff !important; display: inline-block; padding: 14px 34px; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; text-align: center; text-decoration: none; border-radius: 2px; border: 1px solid #c79a45;">
        Track Order Status
      </a>
      <div style="margin-top: 10px; font-size: 11px; color: #838e87;">
        Real-time dispatch updates and concierge status
      </div>
    </div>

    <!-- SARTORIAL ASSURANCE NOTE -->
    <div style="border-top: 1px dashed #deddd3; padding-top: 18px; margin-top: 24px; font-size: 12px; color: #6b7770; line-height: 1.6; text-align: center;">
      Every Rongin Libas creation is prepared in limited artisan runs. We look forward to delivering our bespoke Bengal panjabi artistry to your doorstep.
    </div>
  `;

  const html = renderBaseEmailTemplate({
    title: subject,
    previewText,
    contentHtml,
    webUrl,
  });

  const text = `
${isConfirmed ? `ORDER CONFIRMED: ${orderNumber}` : `ORDER RECEIVED: ${orderNumber} (${statusBadge.label})`}
Rongin Libas Atelier

Dear ${displayName},

Thank you for shopping with Rongin Libas. Your order has been successfully received into our Bengal atelier ledger. We will keep you updated about its progress.

Order Reference: ${orderNumber}
Placement Date: ${orderDate}
Payment Method: ${paymentMethodDisplay}
Payment Status: ${paymentStatusDisplay.label}
Total Amount: ${formatCurrency(totalAmount)}
Shipping Destination: ${addressLines}

Items:
${items.map((i) => `- ${i.productName} (${i.quantity}x) - ${formatCurrency(i.subtotal)}`).join('\n')}

Subtotal: ${formatCurrency(subtotal)}
Delivery: ${formatCurrency(deliveryCharge)}
Total: ${formatCurrency(totalAmount)}

Track your order: ${trackUrl}

Rongin Libas | Bengal Atelier
Helpline: +8801352926067
WhatsApp: https://wa.me/8801352926067
  `.trim();

  return { subject, html, text };
}
