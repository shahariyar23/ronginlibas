import { renderBaseEmailTemplate } from './base.template.js';

export interface OrderStatusUpdateEmailOptions {
  orderNumber: string;
  customerName?: string | null;
  newStatus: string;
  previousStatus?: string | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: Date | string | null;
  adminNotes?: string | null;
  totalAmount?: number | string | null;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    city?: string;
    division?: string;
    [key: string]: any;
  } | null;
  trackUrl: string;
  webUrl?: string;
}

interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeColor: string;
  headline: string;
  description: string;
  icon: string;
}

const STATUS_METADATA: Record<string, StatusConfig> = {
  PENDING: {
    label: 'Pending',
    badgeBg: '#4a5568',
    badgeColor: '#ffffff',
    headline: 'Your Order is Pending Confirmation',
    description: 'We have received your order details and it is currently awaiting confirmation.',
    icon: '⏳',
  },
  CONFIRMED: {
    label: 'Confirmed',
    badgeBg: '#073a2d',
    badgeColor: '#fbf9f2',
    headline: 'Your Order Has Been Confirmed',
    description: 'Your order details have been verified and confirmed. It is now queued for processing.',
    icon: '✓',
  },
  PROCESSING: {
    label: 'Processing',
    badgeBg: '#0d4d3b',
    badgeColor: '#fbf9f2',
    headline: 'Your Order is Now Processing',
    description: 'Your order is currently being processed and prepared for fulfillment.',
    icon: '⚙',
  },
  PACKED: {
    label: 'Packed',
    badgeBg: '#0a3a2f',
    badgeColor: '#fbf9f2',
    headline: 'Your Order is Packed & Ready',
    description: 'Your items have passed quality checks and are packed securely, ready for courier handover.',
    icon: '📦',
  },
  SHIPPED: {
    label: 'Shipped',
    badgeBg: '#1e5f74',
    badgeColor: '#ffffff',
    headline: 'Your Order Has Been Shipped',
    description: 'Your package has been handed over to our courier partner and is on its way to you.',
    icon: '🚚',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    badgeBg: '#b8860b',
    badgeColor: '#ffffff',
    headline: 'Your Order is Out for Delivery',
    description: 'The delivery executive is in your local area and will deliver your package today.',
    icon: '📍',
  },
  DELIVERED: {
    label: 'Delivered',
    badgeBg: '#157347',
    badgeColor: '#ffffff',
    headline: 'Your Order Has Been Delivered',
    description: 'Your order has been successfully delivered. Thank you for shopping with Rongin Libas!',
    icon: '★',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeBg: '#9b2226',
    badgeColor: '#ffffff',
    headline: 'Your Order Has Been Cancelled',
    description: 'Your order has been cancelled per your request or store policy.',
    icon: '✕',
  },
  RETURN_REQUESTED: {
    label: 'Return Requested',
    badgeBg: '#6a0dad',
    badgeColor: '#ffffff',
    headline: 'Return Request Received',
    description: 'We have received your return request. Our support team will review and coordinate with you shortly.',
    icon: '🔄',
  },
  RETURNED: {
    label: 'Returned',
    badgeBg: '#5a189a',
    badgeColor: '#ffffff',
    headline: 'Order Returned',
    description: 'Your returned package has been received and inspected at our facility.',
    icon: '↩',
  },
  REFUNDED: {
    label: 'Refunded',
    badgeBg: '#3c096c',
    badgeColor: '#ffffff',
    headline: 'Payment Refunded',
    description: 'Your refund has been disbursed via your original payment channel or mobile banking account.',
    icon: '৳',
  },
};

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

export function renderOrderStatusUpdateEmail(options: OrderStatusUpdateEmailOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    orderNumber,
    customerName,
    newStatus,
    courierName,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
    adminNotes,
    totalAmount,
    shippingAddress,
    trackUrl,
    webUrl,
  } = options;

  const config = STATUS_METADATA[newStatus] || {
    label: newStatus.replace(/_/g, ' '),
    badgeBg: '#073a2d',
    badgeColor: '#fbf9f2',
    headline: `Order Stage: ${newStatus.replace(/_/g, ' ')}`,
    description: `Your order ${orderNumber} is now at stage ${newStatus}.`,
    icon: '●',
  };

  const displayName = customerName?.trim() || shippingAddress?.fullName?.trim() || 'Valued Patron';
  const subject = `Order Update: ${orderNumber} is now ${config.label} | Rongin Libas`;
  const previewText = `Your order ${orderNumber} status update: ${config.label}. ${config.description}`;

  const formattedEstimated = estimatedDelivery
    ? new Date(estimatedDelivery).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const contentHtml = `
    <!-- STATUS BADGE & HEADER -->
    <div style="margin-bottom: 24px;">
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; background-color: ${config.badgeBg}; color: ${config.badgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border-radius: 2px; border: 1px solid #c79a45;">
          ${config.icon} ${escapeHtml(config.label)}
        </span>
      </div>
      <h1 style="font-family: 'Cinzel', 'Georgia', serif; font-size: 23px; color: #073a2d; margin: 0 0 12px 0; font-weight: 700; line-height: 1.3;">
        ${escapeHtml(config.headline)}
      </h1>
      <p style="font-size: 15px; color: #37413d; margin: 0 0 10px 0; line-height: 1.6;">
        Dear <strong>${escapeHtml(displayName)}</strong>,
      </p>
      <p style="font-size: 14px; color: #49544e; margin: 0; line-height: 1.6;">
        ${escapeHtml(config.description)}
      </p>
    </div>

    <!-- ORDER STATUS DETAIL CARD -->
    <div style="background-color: #fcfbf7; border: 1px solid #deddd3; border-radius: 4px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="50%" valign="top" style="padding-bottom: 12px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Order Number
            </div>
            <div style="font-size: 15px; font-weight: 700; color: #073a2d; margin-top: 3px; font-family: monospace;">
              ${escapeHtml(orderNumber)}
            </div>
          </td>
          <td width="50%" valign="top" style="padding-bottom: 12px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Current Stage
            </div>
            <div style="font-size: 14px; font-weight: 700; color: ${config.badgeBg}; margin-top: 3px;">
              ${escapeHtml(config.label)}
            </div>
          </td>
        </tr>

        ${(courierName || trackingNumber) ? `
        <tr>
          <td width="50%" valign="top" style="padding-bottom: 12px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Courier Logistics
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #2b332f; margin-top: 3px;">
              ${escapeHtml(courierName || 'Atelier Dispatch')}
            </div>
          </td>
          <td width="50%" valign="top" style="padding-bottom: 12px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Tracking / Consignment
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #073a2d; margin-top: 3px; font-family: monospace;">
              ${trackingUrl ? `<a href="${escapeHtml(trackingUrl)}" target="_blank" style="color: #073a2d; text-decoration: underline;">${escapeHtml(trackingNumber || 'Track Consignment')}</a>` : escapeHtml(trackingNumber || 'Assigned')}
            </div>
          </td>
        </tr>` : ''}

        ${formattedEstimated ? `
        <tr>
          <td colspan="2" style="padding-bottom: 12px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
              Estimated Delivery Arrival
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #073a2d; margin-top: 3px;">
              🗓️ ${escapeHtml(formattedEstimated)}
            </div>
          </td>
        </tr>` : ''}

        ${totalAmount !== undefined && totalAmount !== null ? `
        <tr>
          <td colspan="2" style="padding-top: 10px; border-top: 1px dashed #deddd3;">
            <span style="font-size: 12px; color: #6b7770;">Order Total Payable:</span>
            <strong style="font-size: 14px; color: #073a2d; margin-left: 6px;">${formatCurrency(totalAmount)}</strong>
          </td>
        </tr>` : ''}
      </table>
    </div>

    ${adminNotes ? `
    <!-- ATELIER DISPATCH NOTE -->
    <div style="background-color: #faf9f2; border-left: 3px solid #c79a45; padding: 14px 18px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c79a45; font-weight: 700; margin-bottom: 4px;">
        Note from Rongin Libas Concierge
      </div>
      <div style="font-size: 13px; color: #37413d; font-style: italic; line-height: 1.5;">
        "${escapeHtml(adminNotes)}"
      </div>
    </div>` : ''}

    <!-- CTA BUTTON -->
    <div style="text-align: center; margin: 30px 0 20px 0;">
      <a href="${trackUrl}" target="_blank" class="btn-green" style="background-color: #073a2d; color: #ffffff !important; display: inline-block; padding: 14px 34px; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; text-align: center; text-decoration: none; border-radius: 2px; border: 1px solid #c79a45;">
        Track Live Status
      </a>
      <div style="margin-top: 10px; font-size: 11px; color: #838e87;">
        View full delivery milestones and courier timeline
      </div>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    title: subject,
    previewText,
    contentHtml,
    webUrl,
  });

  const text = `
ORDER UPDATE: ${orderNumber}
Stage: ${config.label}
Rongin Libas Atelier

Dear ${displayName},

${config.headline}
${config.description}

Order Number: ${orderNumber}
Stage: ${config.label}
${courierName ? `Courier: ${courierName}\n` : ''}${trackingNumber ? `Tracking: ${trackingNumber}\n` : ''}${formattedEstimated ? `Estimated Delivery: ${formattedEstimated}\n` : ''}${adminNotes ? `Atelier Note: "${adminNotes}"\n` : ''}
Track live progress: ${trackUrl}

Rongin Libas | Bengal Atelier
Helpline: +880 1916 664011
  `.trim();

  return { subject, html, text };
}
