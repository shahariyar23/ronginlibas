import { renderBaseEmailTemplate } from './base.template.js';
const STATUS_METADATA = {
    CONFIRMED: {
        label: 'Order Confirmed',
        badgeBg: '#073a2d',
        badgeColor: '#fbf9f2',
        headline: 'Your Bespoke Order has been Confirmed',
        description: 'Our atelier concierge has verified your order specifications and requisitioned the master fabrics for tailoring.',
        icon: '✓',
    },
    PROCESSING: {
        label: 'In Atelier Tailoring',
        badgeBg: '#0d4d3b',
        badgeColor: '#fbf9f2',
        headline: 'Garments Entering Tailoring & Finishing',
        description: 'Our Bengal artisans are diligently cutting, sewing, and applying bespoke finishing touches to your garments.',
        icon: '✂',
    },
    PACKED: {
        label: 'Packaged with Care',
        badgeBg: '#0a3a2f',
        badgeColor: '#fbf9f2',
        headline: 'Garments Packaged & Sealed',
        description: 'Your garments have passed master inspection and are boxed in pristine atelier packaging, ready for courier handover.',
        icon: '📦',
    },
    SHIPPED: {
        label: 'Dispatched with Courier',
        badgeBg: '#1e5f74',
        badgeColor: '#ffffff',
        headline: 'Your Garments are on the Way',
        description: 'Your order has been handed over to our verified logistics partner for swift and secure delivery.',
        icon: '🚚',
    },
    OUT_FOR_DELIVERY: {
        label: 'Out for Delivery Today',
        badgeBg: '#b8860b',
        badgeColor: '#ffffff',
        headline: 'Arrival Anticipated Today',
        description: 'The delivery executive is in your local area and will contact you shortly to complete the doorstep handover.',
        icon: '📍',
    },
    DELIVERED: {
        label: 'Delivered',
        badgeBg: '#157347',
        badgeColor: '#ffffff',
        headline: 'Order Successfully Delivered',
        description: 'We hope your Rongin Libas garments bring elegance to your wardrobe. Thank you for placing your trust in our atelier.',
        icon: '★',
    },
    CANCELLED: {
        label: 'Order Cancelled',
        badgeBg: '#9b2226',
        badgeColor: '#ffffff',
        headline: 'Order Has Been Cancelled',
        description: 'Your order has been cancelled per your request or atelier policy. Any reserved inventory has been replenished.',
        icon: '✕',
    },
    RETURN_REQUESTED: {
        label: 'Return Requested',
        badgeBg: '#6a0dad',
        badgeColor: '#ffffff',
        headline: 'Return Requisition Received',
        description: 'We have received your return request. Our concierge team will review and coordinate doorstep exchange.',
        icon: '🔄',
    },
    RETURNED: {
        label: 'Returned to Atelier',
        badgeBg: '#5a189a',
        badgeColor: '#ffffff',
        headline: 'Garments Returned',
        description: 'The garments have arrived back at our central workshop for inspection.',
        icon: '↩',
    },
    REFUNDED: {
        label: 'Payment Refunded',
        badgeBg: '#3c096c',
        badgeColor: '#ffffff',
        headline: 'Refund Processed',
        description: 'Your refund has been disbursed via your original payment channel or mobile banking account.',
        icon: '৳',
    },
};
function formatCurrency(amount) {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `৳${num.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
function escapeHtml(str) {
    return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
export function renderOrderStatusUpdateEmail(options) {
    const { orderNumber, customerName, newStatus, courierName, trackingNumber, trackingUrl, estimatedDelivery, adminNotes, totalAmount, shippingAddress, trackUrl, webUrl, } = options;
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
//# sourceMappingURL=order-status-update.template.js.map