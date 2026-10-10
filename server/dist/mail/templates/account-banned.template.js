import { renderBaseEmailTemplate } from './base.template.js';
export function renderAccountBannedEmail(options) {
    const { name, reason, supportEmail = 'support@ronginlibas.com', supportPhone = '+880 1916 664011', webUrl, } = options;
    const patronGreeting = name && name.trim() ? `Dear ${escapeHtml(name.trim())},` : 'Dear Patron,';
    const cleanReason = escapeHtml(reason.trim());
    const contentHtml = `
    <!-- Top Notice Header -->
    <div style="margin-bottom: 22px;">
      <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; color: #ba1a1a; display: block; margin-bottom: 6px;">
        Atelier Administration Notice
      </span>
      <h1 style="font-family: 'Georgia', serif; font-size: 22px; font-weight: 600; color: #1b1c18; margin: 0 0 12px 0; line-height: 1.3;">
        Account Access Suspended
      </h1>
      <p style="font-size: 15px; font-weight: 600; color: #073a2d; margin: 0; line-height: 1.6;">
        ${patronGreeting}
      </p>
    </div>

    <!-- Main Explanation -->
    <p style="font-size: 14px; color: #404945; line-height: 1.7; margin-bottom: 18px;">
      We are writing to inform you that your <strong>Rongin Libas</strong> customer account has been suspended by the shop administration.
    </p>

    <!-- Reason Box -->
    <div style="background-color: #fff8f6; border-left: 4px solid #ba1a1a; border-top: 1px solid #fecdd3; border-right: 1px solid #fecdd3; border-bottom: 1px solid #fecdd3; border-radius: 4px; padding: 18px 20px; margin: 24px 0;">
      <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #ba1a1a; margin-bottom: 8px;">
        Stated Reason from Shop Administration:
      </div>
      <div style="font-family: 'Georgia', serif; font-size: 15px; color: #1b1c18; line-height: 1.6; font-style: italic;">
        &ldquo;${cleanReason}&rdquo;
      </div>
    </div>

    <!-- Impact Details -->
    <p style="font-size: 13px; color: #525d57; line-height: 1.7; margin-bottom: 20px;">
      While this suspension is in effect, you will not be able to log in to your account, book bespoke tailoring consignments, or place new orders on our storefront. Any pending deliveries placed prior to this action will continue to be processed or handled directly by our fulfillment team.
    </p>

    <!-- Support and Dispute Resolution -->
    <div style="background-color: #f7faf8; border: 1px solid #d4e7df; border-radius: 4px; padding: 18px 20px; margin: 24px 0;">
      <div style="font-family: 'Georgia', serif; font-size: 14px; font-weight: 600; color: #073a2d; margin-bottom: 8px;">
        Assistance &amp; Inquiries
      </div>
      <p style="font-size: 13px; color: #404945; line-height: 1.6; margin: 0;">
        If you believe this administrative action was taken in error or if you wish to appeal this decision, please contact our concierge administration team:
      </p>
      <div style="margin-top: 12px; font-size: 13px; color: #073a2d; font-weight: 600;">
        Direct Line: <span style="font-family: monospace; font-size: 14px;">${supportPhone}</span><br>
        Email: <a href="mailto:${supportEmail}" style="color: #073a2d; text-decoration: underline;">${supportEmail}</a>
      </div>
    </div>

    <!-- Signature -->
    <div style="margin-top: 28px; font-size: 13px; color: #525d57; line-height: 1.6;">
      Respectfully,<br>
      <strong style="color: #073a2d; font-family: 'Georgia', serif; font-size: 14px;">The Rongin Libas Administration Team</strong>
    </div>
  `;
    const html = renderBaseEmailTemplate({
        title: 'Account Status Notification | Rongin Libas',
        previewText: `Your Rongin Libas account has been suspended: ${reason.slice(0, 80)}`,
        contentHtml,
        webUrl,
    });
    const text = `RONGIN LIBAS — CLOTH YOUR IDENTITY
========================================
ACCOUNT ACCESS SUSPENDED NOTICE

${patronGreeting}

We are writing to inform you that your Rongin Libas customer account has been suspended by the shop administration.

REASON FOR SUSPENSION:
"${reason}"

While this suspension is in effect, you will not be able to log in to your account, book bespoke tailoring consignments, or place new orders on our storefront.

If you believe this administrative action was taken in error or wish to appeal, please contact our concierge administration:
- Direct Line: ${supportPhone}
- Email: ${supportEmail}

Respectfully,
The Rongin Libas Administration Team
`;
    return {
        subject: 'Important: Notice Regarding Your Rongin Libas Account',
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
//# sourceMappingURL=account-banned.template.js.map