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
export function renderAbandonedCartReminderEmail(options) {
    const { customerName, items, subtotal, totalAmount, cartUrl, checkoutUrl, customMessage, webUrl, } = options;
    const displayName = customerName?.trim() || 'Valued Patron';
    const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);
    const subject = `Did you forget something exquisite? Your cart is reserved | Rongin Libas`;
    const previewText = `Your ${itemCount} handcrafted atelier ${itemCount === 1 ? 'piece is' : 'pieces are'} waiting in your shopping bag. Complete your order before artisan pieces sell out.`;
    const itemsHtml = items
        .map((item) => {
        const specs = [
            item.variantName && item.variantName !== item.productName ? item.variantName : null,
            item.size ? `Size: ${item.size}` : null,
            item.color ? `Color: ${item.color}` : null,
        ]
            .filter(Boolean)
            .join(' &bull; ');
        return `
        <tr style="border-bottom: 1px solid #ebe9de;">
          <td width="64" style="padding: 12px 10px 12px 0; vertical-align: middle;">
            ${item.productImage
            ? `<img src="${item.productImage}" alt="${escapeHtml(item.productName)}" width="60" height="75" style="border-radius: 3px; object-fit: cover; display: block; border: 1px solid #deddd3;" />`
            : `<div style="width: 60px; height: 75px; background-color: #f2eee3; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 20px;">👔</div>`}
          </td>
          <td style="padding: 12px 10px; vertical-align: middle;">
            <div style="font-size: 14px; font-weight: 600; color: #073a2d; line-height: 1.4;">
              ${escapeHtml(item.productName)}
            </div>
            ${specs ? `<div style="font-size: 11px; color: #6b7770; margin-top: 3px;">${specs}</div>` : ''}
            <div style="font-size: 12px; color: #838e87; margin-top: 2px;">
              Qty: <strong>${item.quantity}</strong> &times; ${formatCurrency(item.unitPrice)}
            </div>
          </td>
          <td align="right" style="padding: 12px 0 12px 10px; font-size: 14px; font-weight: 700; color: #073a2d; vertical-align: middle; white-space: nowrap;">
            ${formatCurrency(item.subtotal)}
          </td>
        </tr>
      `;
    })
        .join('');
    const contentHtml = `
    <!-- TOP HEADER -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #c79a45; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
        Sartorial Bag Reservation
      </div>
      <h1 style="font-family: 'Cinzel', 'Georgia', serif; font-size: 23px; color: #073a2d; margin: 0 0 12px 0; font-weight: 700; line-height: 1.3;">
        You Left Exquisite Pieces in Your Cart
      </h1>
      <p style="font-size: 15px; color: #37413d; margin: 0 0 12px 0; line-height: 1.6;">
        Dear <strong>${escapeHtml(displayName)}</strong>,
      </p>
      <p style="font-size: 14px; color: #49544e; margin: 0; line-height: 1.6;">
        We noticed you began selecting from our Bengal atelier collections, but did not complete your requisition. 
        Because our garments are crafted in limited artisan batches, our pieces frequently sell out. 
        We have kept your bag safe so you can effortlessly finish your order.
      </p>
    </div>

    ${customMessage
        ? `
    <!-- CUSTOM ATELIER NOTE -->
    <div style="background-color: #faf9f2; border-left: 3px solid #c79a45; padding: 14px 18px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c79a45; font-weight: 700; margin-bottom: 4px;">
        Note From Our Atelier Concierge
      </div>
      <div style="font-size: 13px; color: #37413d; line-height: 1.5;">
        ${escapeHtml(customMessage)}
      </div>
    </div>`
        : ''}

    <!-- RESERVED CART ITEMS -->
    <div style="background-color: #fcfbf7; border: 1px solid #deddd3; border-radius: 4px; padding: 20px; margin-bottom: 26px;">
      <div style="font-size: 12px; font-weight: 700; color: #073a2d; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 2px solid #073a2d; padding-bottom: 6px;">
        Your Reserved Atelier Items (${itemCount} garment${itemCount === 1 ? '' : 's'})
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" align="right" style="padding: 14px 10px 4px 0; font-size: 13px; color: #6b7770;">Estimated Subtotal:</td>
            <td align="right" style="padding: 14px 0 4px 10px; font-size: 14px; color: #2b332f; font-weight: 600;">${formatCurrency(subtotal)}</td>
          </tr>
          <tr style="border-top: 1px dashed #deddd3;">
            <td colspan="2" align="right" style="padding: 10px 10px 4px 0; font-size: 15px; font-weight: 700; color: #073a2d; text-transform: uppercase; letter-spacing: 1px;">Cart Total:</td>
            <td align="right" style="padding: 10px 0 4px 10px; font-size: 18px; font-weight: 700; color: #073a2d; font-family: 'Cinzel', 'Georgia', serif;">${formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- PRIMARY ACTION BUTTONS -->
    <div style="text-align: center; margin: 30px 0 24px 0;">
      <a href="${checkoutUrl}" target="_blank" class="btn-green" style="background-color: #073a2d; color: #ffffff !important; display: inline-block; padding: 15px 36px; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; text-align: center; text-decoration: none; border-radius: 2px; border: 1px solid #c79a45; box-shadow: 0 2px 6px rgba(7, 58, 45, 0.2);">
        Complete Order Now
      </a>
      <div style="margin-top: 12px;">
        <a href="${cartUrl}" target="_blank" style="font-size: 12px; color: #073a2d; text-decoration: underline; font-weight: 600;">
          Or review and edit your shopping bag &rarr;
        </a>
      </div>
    </div>

    <!-- ATELIER ASSURANCE -->
    <div style="background-color: #f7fbf9; border: 1px solid #d0e4dc; border-radius: 4px; padding: 14px 18px; margin: 26px 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="30" valign="top" style="font-size: 18px;">🛡️</td>
          <td valign="top" style="padding-left: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: #073a2d; text-transform: uppercase; letter-spacing: 1px;">
              Open-Box Verification &amp; Nationwide Delivery
            </div>
            <div style="font-size: 12px; color: #49544e; margin-top: 3px; line-height: 1.5;">
              Enjoy Cash on Delivery with open-box quality inspection at your doorstep across all 64 districts.
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- NEED HELP -->
    <div style="border-top: 1px dashed #deddd3; padding-top: 18px; margin-top: 24px; font-size: 12px; color: #6b7770; line-height: 1.6; text-align: center;">
      Questions about sizing, custom length, or fabric weight? Reach out directly to our Dhaka studio concierge on WhatsApp or call <strong>+880 1916 664011</strong>.
    </div>
  `;
    const html = renderBaseEmailTemplate({
        title: subject,
        previewText,
        contentHtml,
        webUrl,
    });
    const text = `
DID YOU FORGET YOUR SARTORIAL CREATIONS?
Rongin Libas Atelier

Dear ${displayName},

We noticed you left handcrafted garments in your shopping bag. Our limited artisan runs tend to sell out quickly—your reserved items are waiting for you.

Items in your cart:
${items.map((i) => `- ${i.productName} (${i.quantity}x) - ${formatCurrency(i.subtotal)}`).join('\n')}

Subtotal: ${formatCurrency(subtotal)}
Total: ${formatCurrency(totalAmount)}

Complete your order: ${checkoutUrl}
Review your bag: ${cartUrl}

${customMessage ? `Concierge Note: ${customMessage}\n` : ''}

Rongin Libas | Bengal Atelier
Dhaka Concierge: +880 1916 664011
  `.trim();
    return { subject, html, text };
}
//# sourceMappingURL=abandoned-cart-reminder.template.js.map