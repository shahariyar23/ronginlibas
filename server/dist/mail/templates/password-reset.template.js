import { renderBaseEmailTemplate } from './base.template.js';
export function renderPasswordResetEmail(options) {
    const { name, resetUrl, expiresInMinutes = 30, webUrl } = options;
    const patronGreeting = name && name.trim() ? `Dear ${escapeHtml(name.trim())},` : 'Dear Patron,';
    const contentHtml = `
    <!-- Top Greeting -->
    <div style="margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; color: #c79a45; display: block; margin-bottom: 6px;">
        Account Security &bull; Credentials Recovery
      </span>
      <h1 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: 500; color: #073a2d; margin: 0 0 12px 0; line-height: 1.3;">
        Password Recovery Request
      </h1>
      <p style="font-size: 15px; font-weight: 600; color: #073a2d; margin: 0; line-height: 1.6;">
        ${patronGreeting}
      </p>
    </div>

    <!-- Main Message (User's Exact Specification) -->
    <p style="font-size: 14px; color: #404945; line-height: 1.7; margin-bottom: 24px;">
      We received a request to reset the password for your Rongin Libas account. To protect your bespoke tailoring records and order history, please establish your new password using the secure link below:
    </p>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="btn-green" style="color: #ffffff; text-decoration: none;">
        Reset My Password
      </a>
    </div>

    <!-- Security Information Box -->
    <div style="background-color: #f7faf8; border-left: 3px solid #c79a45; padding: 16px 18px; border-radius: 2px; margin: 28px 0 24px 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="top" style="font-size: 16px; padding-right: 10px; width: 22px;">🛡️</td>
          <td style="font-size: 12px; color: #404945; line-height: 1.6;">
            <strong style="color: #073a2d;">Security Advisory:</strong><br>
            &bull; This single-use recovery link will expire in <strong>${expiresInMinutes} minutes</strong>.<br>
            &bull; If you did not initiate this request, no changes will be made to your account. You can safely disregard this email.
          </td>
        </tr>
      </table>
    </div>

    <!-- Fallback Plain Text URL -->
    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed #deddd3; font-size: 12px; color: #717975; line-height: 1.6;">
      <p style="margin: 0 0 6px 0;">If the button above does not work, copy and paste this link into your browser:</p>
      <a href="${resetUrl}" style="color: #073a2d; word-break: break-all; font-family: monospace; font-size: 11px; text-decoration: underline;">
        ${resetUrl}
      </a>
    </div>

    <!-- Signature -->
    <div style="margin-top: 28px; font-size: 13px; color: #525d57; line-height: 1.6;">
      With aristocratic regard,<br>
      <strong style="color: #073a2d; font-family: 'Georgia', serif; font-size: 14px;">The Rongin Libas Atelier Concierge</strong>
    </div>
  `;
    const html = renderBaseEmailTemplate({
        title: 'Reset Your Rongin Libas Password',
        previewText: 'We received a request to reset the password for your Rongin Libas account.',
        contentHtml,
        webUrl,
    });
    const text = `RONGIN LIBAS — CLOTH YOUR IDENTITY
========================================
Password Recovery Request

${patronGreeting}

We received a request to reset the password for your Rongin Libas account. To protect your bespoke tailoring records and order history, please establish your new password using the secure link below:

${resetUrl}

This link will expire in ${expiresInMinutes} minutes for your security.
If you did not request this recovery, please ignore this email.

Patron Concierge Helpline: +880 1916 664011
`;
    return {
        subject: 'Reset your Rongin Libas password',
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
//# sourceMappingURL=password-reset.template.js.map