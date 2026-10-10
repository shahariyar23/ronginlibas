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

export interface OrderConfirmationEmailOptions {
  orderNumber: string;
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

export function renderOrderConfirmationEmail(options: OrderConfirmationEmailOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    orderNumber,
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
  } = options;

  const displayName = customerName?.trim() || shippingAddress?.fullName?.trim() || 'Valued Patron';
  const subject = `Order Confirmed: ${orderNumber} | Rongin Libas Atelier`;
  const previewText = `Your order ${orderNumber} has been received and confirmed. Total: ${formatCurrency(totalAmount)}.`;

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
    <!-- GREETING & CONFIRMATION HEADER -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #c79a45; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
        Sartorial Order Placement
      </div>
      <h1 style="font-family: 'Cinzel', 'Georgia', serif; font-size: 24px; color: #073a2d; margin: 0 0 14px 0; font-weight: 700; line-height: 1.3;">
        Order Confirmed: ${escapeHtml(orderNumber)}
      </h1>
      <p style="font-size: 15px; color: #37413d; margin: 0 0 12px 0; line-height: 1.6;">
        Dear <strong>${escapeHtml(displayName)}</strong>,
      </p>
      <p style="font-size: 14px; color: #49544e; margin: 0; line-height: 1.6;">
        Thank you for choosing Rongin Libas. We have recorded your order with our Bengal heritage atelier. Our master craftsmen and dispatch specialists are now preparing your garments with bespoke care.
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
              Your official A4 PDF tax invoice (<strong>Rongin-Libas-Invoice-${escapeHtml(orderNumber.replace('#', ''))}.pdf</strong>) has been generated and attached to this email for your personal accounting and delivery inspection.
            </div>
          </td>
        </tr>
      </table>
    </div>` : ''}

    <!-- ORDER SUMMARY CARD -->
    <div style="background-color: #fcfbf7; border: 1px solid #deddd3; border-radius: 4px; padding: 20px; margin-bottom: 26px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="50%" valign="top" style="padding-bottom: 14px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Order Reference
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #073a2d; margin-top: 3px; font-family: monospace;">
              ${escapeHtml(orderNumber)}
            </div>
          </td>
          <td width="50%" valign="top" style="padding-bottom: 14px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Placement Date
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #2b332f; margin-top: 3px;">
              ${escapeHtml(orderDate)}
            </div>
          </td>
        </tr>
        <tr>
          <td width="50%" valign="top">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Payment Method
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #2b332f; margin-top: 3px;">
              ${escapeHtml(paymentMethod)} <span style="font-size: 11px; color: #c79a45;">(${escapeHtml(paymentStatus)})</span>
            </div>
          </td>
          <td width="50%" valign="top">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Delivery Recipient
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #2b332f; margin-top: 3px;">
              ${escapeHtml(shippingAddress?.fullName || displayName)}
              ${shippingAddress?.phone ? `<br><span style="font-size: 12px; color: #6b7770;">📞 ${escapeHtml(shippingAddress.phone)}</span>` : ''}
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
ORDER CONFIRMED: ${orderNumber}
Rongin Libas Atelier

Dear ${displayName},

Thank you for choosing Rongin Libas. Your order has been confirmed and our atelier is preparing your garments.

Order Number: ${orderNumber}
Date: ${orderDate}
Payment Method: ${paymentMethod} (${paymentStatus})
Total Amount: ${formatCurrency(totalAmount)}
Shipping Address: ${addressLines}

Items:
${items.map((i) => `- ${i.productName} (${i.quantity}x) - ${formatCurrency(i.subtotal)}`).join('\n')}

Subtotal: ${formatCurrency(subtotal)}
Delivery: ${formatCurrency(deliveryCharge)}
Total: ${formatCurrency(totalAmount)}

Track your order: ${trackUrl}

Rongin Libas | Bengal Atelier
Helpline: +880 1916 664011
  `.trim();

  return { subject, html, text };
}
