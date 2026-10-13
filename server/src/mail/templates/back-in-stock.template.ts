import { renderBaseEmailTemplate } from './base.template.js';

export interface BackInStockEmailOptions {
  customerName?: string | null;
  productName: string;
  productSlug: string;
  price: number | string;
  imageUrl?: string | null;
  size?: string | null;
  color?: string | null;
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

export function renderBackInStockEmail(options: BackInStockEmailOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    customerName,
    productName,
    productSlug,
    price,
    imageUrl,
    size,
    color,
    webUrl = 'https://runginlibas.com',
  } = options;

  const displayName = customerName?.trim() || 'Valued Patron';
  const productUrl = `${webUrl}/products/${productSlug}`;
  const subject = `Good news! ${productName} is back in stock at Rongin Libas`;
  const previewText = `Your wishlisted garment ${productName} has just been restocked. Secure your size before atelier stock runs out.`;

  const contentHtml = `
    <!-- Hero Alert Banner -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="background-color: #fbf9f2; border: 1px solid #c79a45; padding: 20px; text-align: center;">
          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #c79a45; font-weight: 700; display: block; margin-bottom: 6px;">
            Wishlist Restock Alert
          </span>
          <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #073a2d; margin: 0 0 8px 0; font-weight: 400;">
            A Piece You Adored Has Returned
          </h2>
          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #404945; margin: 0; line-height: 1.6;">
            Greetings, ${escapeHtml(displayName)}. You saved <strong>${escapeHtml(productName)}</strong> to your atelier wishlist. Our master weavers have just replenished inventory.
          </p>
        </td>
      </tr>
    </table>

    <!-- Product Showcase Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #deddd3; background-color: #ffffff; margin-bottom: 28px;">
      <tr>
        ${
          imageUrl
            ? `
        <td width="140" valign="top" style="padding: 16px; border-right: 1px solid #f0eee7;">
          <a href="${escapeHtml(productUrl)}" style="display: block; text-decoration: none;">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(productName)}" width="120" style="display: block; width: 120px; height: auto; object-fit: cover; border: 1px solid #deddd3;" />
          </a>
        </td>
        `
            : ''
        }
        <td valign="middle" style="padding: 20px;">
          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #717975; display: block; margin-bottom: 4px;">
            Bespoke Menswear Collection
          </span>
          <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #073a2d; margin: 0 0 6px 0;">
            <a href="${escapeHtml(productUrl)}" style="color: #073a2d; text-decoration: none;">
              ${escapeHtml(productName)}
            </a>
          </h3>
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #073a2d; margin-bottom: 12px;">
            ${formatCurrency(price)}
          </div>
          ${
            size || color
              ? `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #717975; margin-bottom: 16px;">
            ${size ? `<span>Size: <strong>${escapeHtml(size)}</strong></span>` : ''}
            ${size && color ? ' &bull; ' : ''}
            ${color ? `<span>Color: <strong>${escapeHtml(color)}</strong></span>` : ''}
          </div>
          `
              : ''
          }
          <!-- CTA Button -->
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #073a2d; text-align: center;">
                <a href="${escapeHtml(productUrl)}" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: #fbf9f2; text-decoration: none; padding: 12px 24px; display: inline-block; text-transform: uppercase; letter-spacing: 0.15em;">
                  Claim Your Piece &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Artisanal Guarantee Footnote -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 12px; background-color: #f5f4ed; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #717975;">
          <span>Limited batch production. Nationwide 48h express dispatch & doorstep open-box verification included.</span>
        </td>
      </tr>
    </table>
  `;

  const html = renderBaseEmailTemplate({
    title: subject,
    previewText,
    contentHtml,
    webUrl,
  });

  const text = `
Good news! ${productName} is back in stock at Rongin Libas.

Greetings ${displayName},

You previously saved ${productName} to your wishlist. Our artisans have restocked this garment.

Price: ${formatCurrency(price)}
${size ? `Size: ${size}\n` : ''}
${color ? `Color: ${color}\n` : ''}

Shop now: ${productUrl}

Thank you for honoring Rongin Libas.
Haute Couture & Bespoke Menswear | Dhaka, Bangladesh
  `.trim();

  return { subject, html, text };
}
