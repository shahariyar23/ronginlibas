import { renderBaseEmailTemplate } from './base.template.js';
export function renderWelcomeEmail(options) {
    const { name, shopUrl, profileUrl, webUrl } = options;
    const patronGreeting = name && name.trim() ? `Dear ${escapeHtml(name.trim())},` : 'Dear Patron,';
    const contentHtml = `
    <!-- Top Greeting -->
    <div style="margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; color: #c79a45; display: block; margin-bottom: 6px;">
        Welcome to the Atelier Sanctuary
      </span>
      <h1 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: 500; color: #073a2d; margin: 0 0 12px 0; line-height: 1.3;">
        Cloth Your Identity
      </h1>
      <p style="font-size: 15px; font-weight: 600; color: #073a2d; margin: 0; line-height: 1.6;">
        ${patronGreeting}
      </p>
    </div>

    <!-- Main Message -->
    <p style="font-size: 14px; color: #404945; line-height: 1.7; margin-bottom: 18px;">
      It is our distinct honor to welcome you to <strong>Rongin Libas</strong>. 
      Your account has been established, giving you privileged access to our artisanal Bengali menswear, 
      bespoke tailoring cuts, and dedicated concierge services.
    </p>

    <!-- Atelier Privileges Card -->
    <div style="background-color: #f7faf8; border: 1px solid #d4e7df; border-radius: 4px; padding: 22px 24px; margin: 26px 0;">
      <div style="font-family: 'Georgia', serif; font-size: 16px; font-weight: 600; color: #073a2d; margin-bottom: 14px; border-bottom: 1px solid #d4e7df; padding-bottom: 8px;">
        Your Patron Privileges &bull; Bengal Aristocracy
      </div>
      
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #404945;" valign="top">
            <span style="color: #c79a45; font-weight: bold; margin-right: 6px;">✂️</span>
            <strong>Bespoke Silhouette Cuts:</strong> Choose from Slim Heritage, Semi-Fit &amp; Traditional silhouettes tailored to your chest, shoulder, and length measurements.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #404945;" valign="top">
            <span style="color: #c79a45; font-weight: bold; margin-right: 6px;">🚚</span>
            <strong>Express Nationwide Logistics:</strong> 48h express transit inside Dhaka and doorstep delivery to all 64 districts of Bangladesh.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #404945;" valign="top">
            <span style="color: #c79a45; font-weight: bold; margin-right: 6px;">📦</span>
            <strong>Open-Box Inspection:</strong> Examine the artisanal craftsmanship, buttoning, and fabric texture at your doorstep before final payment.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #404945;" valign="top">
            <span style="color: #c79a45; font-weight: bold; margin-right: 6px;">🔄</span>
            <strong>2-Day Doorstep Exchange:</strong> Complimentary size exchange service delivered right to your location.
          </td>
        </tr>
      </table>
    </div>

    <!-- Call to Action Buttons -->
    <div style="text-align: center; margin: 32px 0 20px 0;">
      <a href="${shopUrl}" class="btn-green" style="color: #ffffff; text-decoration: none; margin-bottom: 12px; display: inline-block;">
        Explore Menswear Collection
      </a>
      <div style="margin-top: 10px;">
        <a href="${profileUrl}" style="font-size: 12px; color: #073a2d; text-decoration: underline; font-weight: 600;">
          View Your Sizing Profile &rarr;
        </a>
      </div>
    </div>

    <!-- Signature -->
    <div style="margin-top: 28px; font-size: 13px; color: #525d57; line-height: 1.6;">
      With warm aristocratic regards,<br>
      <strong style="color: #073a2d; font-family: 'Georgia', serif; font-size: 14px;">The Rongin Libas Master Tailor Atelier</strong>
    </div>
  `;
    const html = renderBaseEmailTemplate({
        title: 'Welcome to Rongin Libas | Cloth Your Identity',
        previewText: 'Welcome to Rongin Libas. Your bespoke account is now active.',
        contentHtml,
        webUrl,
    });
    const text = `RONGIN LIBAS — CLOTH YOUR IDENTITY
========================================
Welcome to the Atelier Sanctuary

${patronGreeting}

It is our distinct honor to welcome you to Rongin Libas. Your account has been established, giving you privileged access to our artisanal Bengali menswear, bespoke tailoring cuts, and dedicated concierge services.

Explore the collection:
${shopUrl}

Manage your profile & sizing:
${profileUrl}

Patron Concierge Helpline: +8801352926067
`;
    return {
        subject: 'Welcome to Rongin Libas — Cloth Your Identity',
        html,
        text,
    };
}
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
//# sourceMappingURL=welcome.template.js.map