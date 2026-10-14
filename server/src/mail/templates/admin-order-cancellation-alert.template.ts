import { renderBaseEmailTemplate } from './base.template.js';

export interface AdminOrderCancellationAlertOptions {
  orderNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  createdAt: Date | string;
  cancelledAt: Date | string;
  orderAgeText: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number | string;
  items: Array<{
    productName: string;
    variantName?: string | null;
    size?: string | null;
    color?: string | null;
    quantity: number;
    unitPrice: number | string;
    subtotal: number | string;
  }>;
  adminNotes?: string | null;
  adminOrderUrl: string;
  webUrl?: string;
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

export function renderAdminOrderCancellationAlertEmail(options: AdminOrderCancellationAlertOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    orderNumber,
    customerName,
    customerPhone,
    customerEmail,
    createdAt,
    cancelledAt,
    orderAgeText,
    paymentMethod,
    paymentStatus,
    totalAmount,
    items,
    adminNotes,
    adminOrderUrl,
    webUrl,
  } = options;

  const isPaid = paymentStatus === 'PAID';
  const displayName = customerName?.trim() || 'Guest Customer';

  const subject = `[CANCELLATION ALERT] Order ${orderNumber} cancelled by customer (${paymentMethod})`;
  const previewText = `Customer ${displayName} cancelled order ${orderNumber} within 6-hour window. Total: ${formatCurrency(totalAmount)}.`;

  const formattedPlacedDate = new Date(createdAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedCancelledDate = new Date(cancelledAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const contentHtml = `
    <!-- ALERT BADGE & HEADER -->
    <div style="margin-bottom: 24px;">
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; background-color: #9b2226; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border-radius: 2px; border: 1px solid #7209b7;">
          ✕ CUSTOMER CANCELLATION
        </span>
        <span style="display: inline-block; background-color: #f5f4ed; color: #073a2d; font-size: 11px; font-weight: 600; padding: 6px 10px; border-radius: 2px; margin-left: 8px; border: 1px solid #deddd3;">
          Window: Within 6h (${escapeHtml(orderAgeText)})
        </span>
      </div>
      <h1 style="font-family: 'Cinzel', 'Georgia', serif; font-size: 22px; color: #073a2d; margin: 0 0 10px 0; font-weight: 700;">
        Order ${escapeHtml(orderNumber)} Cancelled by Customer
      </h1>
      <p style="font-size: 14px; color: #49544e; margin: 0; line-height: 1.6;">
        Patron <strong>${escapeHtml(displayName)}</strong> has requested immediate order cancellation through the storefront within the permitted 6-hour policy window.
      </p>
    </div>

    ${
      isPaid
        ? `
    <!-- REFUND REQUIRED ALERT -->
    <div style="background-color: #fef2f2; border: 1.5px solid #ef4444; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 18px; margin-right: 8px;">⚠️</span>
        <strong style="color: #991b1b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
          Action Required: Process Customer Refund
        </strong>
      </div>
      <p style="font-size: 13.5px; color: #7f1d1d; margin: 0; line-height: 1.5;">
        This order was marked as <strong>PAID</strong> via <strong>${escapeHtml(paymentMethod)}</strong>. Please verify the transaction and initiate the refund of <strong>${formatCurrency(totalAmount)}</strong> to the patron.
      </p>
    </div>
    `
        : `
    <!-- COD / UNPAID NOTE -->
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
      <p style="font-size: 13px; color: #166534; margin: 0; line-height: 1.5;">
        ✓ <strong>No Financial Refund Needed:</strong> Payment method is <strong>${escapeHtml(paymentMethod)}</strong> (${escapeHtml(paymentStatus)}). Inventory has been safely released back to stock.
      </p>
    </div>
    `
    }

    <!-- ORDER DETAILS TABLE -->
    <div style="background-color: #ffffff; border: 1px solid #deddd3; border-radius: 4px; padding: 18px; margin-bottom: 24px;">
      <h3 style="font-family: 'Cinzel', serif; font-size: 14px; color: #073a2d; text-transform: uppercase; margin: 0 0 14px 0; border-bottom: 1px solid #f0eee7; padding-bottom: 8px;">
        Order & Patron Summary
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #717975; width: 40%;">Order Number:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #073a2d;">${escapeHtml(orderNumber)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #717975;">Placed At:</td>
          <td style="padding: 6px 0; color: #1b1c18;">${escapeHtml(formattedPlacedDate)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #717975;">Cancelled At:</td>
          <td style="padding: 6px 0; color: #9b2226; font-weight: 600;">${escapeHtml(formattedCancelledDate)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #717975;">Customer Name:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #1b1c18;">${escapeHtml(displayName)}</td>
        </tr>
        ${
          customerPhone
            ? `
        <tr>
          <td style="padding: 6px 0; color: #717975;">Phone:</td>
          <td style="padding: 6px 0; color: #1b1c18;"><a href="tel:${escapeHtml(customerPhone)}" style="color: #073a2d; text-decoration: underline;">${escapeHtml(customerPhone)}</a></td>
        </tr>
        `
            : ''
        }
        ${
          customerEmail
            ? `
        <tr>
          <td style="padding: 6px 0; color: #717975;">Email:</td>
          <td style="padding: 6px 0; color: #1b1c18;"><a href="mailto:${escapeHtml(customerEmail)}" style="color: #073a2d; text-decoration: underline;">${escapeHtml(customerEmail)}</a></td>
        </tr>
        `
            : ''
        }
        <tr>
          <td style="padding: 6px 0; color: #717975;">Payment Method:</td>
          <td style="padding: 6px 0; color: #1b1c18; font-weight: 600;">${escapeHtml(paymentMethod)} (${escapeHtml(paymentStatus)})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #717975;">Total Order Value:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #073a2d; font-size: 15px;">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>
    </div>

    <!-- ITEMS RELEASED BACK TO STOCK -->
    <div style="background-color: #ffffff; border: 1px solid #deddd3; border-radius: 4px; padding: 18px; margin-bottom: 24px;">
      <h3 style="font-family: 'Cinzel', serif; font-size: 14px; color: #073a2d; text-transform: uppercase; margin: 0 0 12px 0; border-bottom: 1px solid #f0eee7; padding-bottom: 8px;">
        Artisan Items Restored to Inventory (${items.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 1px solid #deddd3; color: #717975; font-size: 11px; text-transform: uppercase;">
            <th style="text-align: left; padding: 6px 0;">Item</th>
            <th style="text-align: center; padding: 6px 0;">Size / Color</th>
            <th style="text-align: center; padding: 6px 0;">Qty</th>
            <th style="text-align: right; padding: 6px 0;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #f0eee7;">
              <td style="padding: 8px 0; color: #1b1c18; font-weight: 600;">
                ${escapeHtml(item.productName)}
              </td>
              <td style="padding: 8px 0; text-align: center; color: #717975;">
                ${escapeHtml([item.size, item.color].filter(Boolean).join(' / ') || 'Standard')}
              </td>
              <td style="padding: 8px 0; text-align: center; font-weight: 700; color: #073a2d;">
                ${item.quantity}
              </td>
              <td style="padding: 8px 0; text-align: right; color: #1b1c18;">
                ${formatCurrency(item.subtotal)}
              </td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- CALL TO ACTION -->
    <div style="text-align: center; margin: 28px 0 16px 0;">
      <a
        href="${escapeHtml(adminOrderUrl)}"
        style="display: inline-block; background-color: #073a2d; color: #fbf9f2; font-family: 'Cinzel', 'Georgia', serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 2px; border: 1px solid #c79a45;"
      >
        View Order in Admin Portal
      </a>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    title: `Order Cancellation: ${orderNumber}`,
    previewText,
    contentHtml,
    webUrl,
  });

  const text = `
ORDER CANCELLATION NOTICE - CUSTOMER INITIATED
--------------------------------------------------
Order Number: ${orderNumber}
Status: CANCELLED (By customer within 6-hour window)
Customer: ${displayName}
Phone: ${customerPhone || 'N/A'}
Email: ${customerEmail || 'N/A'}
Order Placed: ${formattedPlacedDate}
Order Cancelled: ${formattedCancelledDate}
Payment: ${paymentMethod} (${paymentStatus})
Total Amount: ${formatCurrency(totalAmount)}
${isPaid ? '\n[ACTION REQUIRED] Order was PAID online. Please process refund of ' + formatCurrency(totalAmount) : ''}

Items restored to inventory:
${items.map((i) => `- ${i.productName} (${[i.size, i.color].filter(Boolean).join('/') || 'Std'}) x${i.quantity} = ${formatCurrency(i.subtotal)}`).join('\n')}

View in Admin Portal: ${adminOrderUrl}
`;

  return { subject, html, text };
}
