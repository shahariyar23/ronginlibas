import { renderBaseEmailTemplate } from './base.template.js';
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
export function renderOrderEditEmail(options) {
    const { orderNumber, customerName, status, totalAmount, changeSummary, shippingAddress, courierName, trackingNumber, trackingUrl, adminNotes, trackUrl, webUrl, } = options;
    const displayName = customerName?.trim() || shippingAddress?.fullName?.trim() || 'Valued Patron';
    const subject = `Order Details Updated: ${orderNumber} | Rongin Libas`;
    const previewText = `Updates have been recorded for your Rongin Libas order ${orderNumber}.`;
    const addressLines = [
        shippingAddress?.addressLine1,
        shippingAddress?.addressLine2,
        shippingAddress?.area,
        shippingAddress?.city,
        shippingAddress?.division,
        shippingAddress?.postalCode,
    ].filter(Boolean).join(', ');
    const changesHtml = (changeSummary && changeSummary.length > 0)
        ? changeSummary.map((c) => `<li style="margin-bottom: 6px; color: #2b332f;">${escapeHtml(c)}</li>`).join('')
        : '<li style="color: #2b332f;">Order records and fulfillment specifications were updated.</li>';
    const contentHtml = `
    <!-- HEADER -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #c79a45; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
        Order Revision Notice
      </div>
      <h1 style="font-family: 'Cinzel', 'Georgia', serif; font-size: 23px; color: #073a2d; margin: 0 0 12px 0; font-weight: 700; line-height: 1.3;">
        Order Details Updated: ${escapeHtml(orderNumber)}
      </h1>
      <p style="font-size: 15px; color: #37413d; margin: 0 0 10px 0; line-height: 1.6;">
        Dear <strong>${escapeHtml(displayName)}</strong>,
      </p>
      <p style="font-size: 14px; color: #49544e; margin: 0; line-height: 1.6;">
        We are writing to inform you that updates have been recorded for your order <strong>${escapeHtml(orderNumber)}</strong> at our atelier. Please review the updated specifications below:
      </p>
    </div>

    <!-- REVISION HIGHLIGHTS CARD -->
    <div style="background-color: #fcfbf7; border: 1px solid #deddd3; border-radius: 4px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #073a2d; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #e2e0d5; padding-bottom: 6px;">
        Updated Information
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
        ${changesHtml}
      </ul>

      ${addressLines ? `
      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #deddd3;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
          Current Delivery Address
        </div>
        <div style="font-size: 13px; color: #2b332f; margin-top: 3px;">
          📍 ${escapeHtml(addressLines)}
        </div>
      </div>` : ''}

      ${(courierName || trackingNumber) ? `
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #deddd3;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #838e87; font-weight: 600;">
          Courier Logistics
        </div>
        <div style="font-size: 13px; color: #2b332f; margin-top: 3px;">
          ${escapeHtml(courierName || 'Atelier Dispatch')} &bull; ${trackingUrl ? `<a href="${escapeHtml(trackingUrl)}" target="_blank" style="color: #073a2d; text-decoration: underline;">${escapeHtml(trackingNumber || 'Track')}</a>` : escapeHtml(trackingNumber || 'Assigned')}
        </div>
      </div>` : ''}

      ${totalAmount !== undefined && totalAmount !== null ? `
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #deddd3;">
        <span style="font-size: 12px; color: #6b7770;">Order Total:</span>
        <strong style="font-size: 14px; color: #073a2d; margin-left: 6px;">${formatCurrency(totalAmount)}</strong>
        <span style="font-size: 12px; color: #838e87; margin-left: 8px;">(Stage: ${escapeHtml(status)})</span>
      </div>` : ''}
    </div>

    ${adminNotes ? `
    <!-- ATELIER NOTE -->
    <div style="background-color: #faf9f2; border-left: 3px solid #c79a45; padding: 14px 18px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c79a45; font-weight: 700; margin-bottom: 4px;">
        Concierge Instruction
      </div>
      <div style="font-size: 13px; color: #37413d; font-style: italic; line-height: 1.5;">
        "${escapeHtml(adminNotes)}"
      </div>
    </div>` : ''}

    <!-- CTA BUTTON -->
    <div style="text-align: center; margin: 30px 0 20px 0;">
      <a href="${trackUrl}" target="_blank" class="btn-green" style="background-color: #073a2d; color: #ffffff !important; display: inline-block; padding: 14px 34px; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; text-align: center; text-decoration: none; border-radius: 2px; border: 1px solid #c79a45;">
        View Updated Order
      </a>
    </div>
  `;
    const html = renderBaseEmailTemplate({
        title: subject,
        previewText,
        contentHtml,
        webUrl,
    });
    const text = `
ORDER DETAILS UPDATED: ${orderNumber}
Rongin Libas Atelier

Dear ${displayName},

Updates have been recorded for your order ${orderNumber}.

${addressLines ? `Delivery Address: ${addressLines}\n` : ''}${courierName ? `Courier: ${courierName}\n` : ''}${trackingNumber ? `Tracking: ${trackingNumber}\n` : ''}${totalAmount ? `Total: ${formatCurrency(totalAmount)}\n` : ''}
View updated order: ${trackUrl}

Rongin Libas | Bengal Atelier
Helpline: +8801352926067
  `.trim();
    return { subject, html, text };
}
//# sourceMappingURL=order-edit.template.js.map