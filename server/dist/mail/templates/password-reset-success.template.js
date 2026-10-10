import { renderBaseEmailTemplate } from './base.template.js';
export function renderPasswordResetSuccessEmail(options) {
    const { name, loginUrl, webUrl } = options;
    const patronGreeting = name && name.trim() ? `Dear ${escapeHtml(name.trim())},` : 'Dear Patron,';
    const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    const contentHtml = `
    <!-- Top Greeting -->
    <div style="margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; color: #073a2d; display: block; margin-bottom: 6px;">
        Account Security Notice
      </span>
      <h1 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: 500; color: #073a2d; margin: 0 0 12px 0; line-height: 1.3;">
        Password Updated Successfully
      </h1>
      <p style="font-size: 15px; font-weight: 600; color: #073a2d; margin: 0; line-height: 1.6;">
        ${patronGreeting}
      </p>
    </div>

    <!-- Success Indicator Box -->
    <div style="background-color: #f0f7f4; border: 1px solid #b2ddcf; border-radius: 4px; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
      <div style="display: inline-block; width: 36px; height: 36px; line-height: 36px; border-radius: 50%; background-color: #073a2d; color: #ffffff; font-size: 18px; margin-bottom: 8px;">
        ✓
      </div>
      <div style="font-size: 15px; font-weight: 600; color: #073a2d; margin-bottom: 4px;">
        Your Password Has Been Changed
      </div>
      <div style="font-size: 12px; color: #525d57;">
        Completed on ${timestamp} (BST)
      </div>
    </div>

    <!-- Main Message -->
    <p style="font-size: 14px; color: #404945; line-height: 1.7; margin-bottom: 22px;">
      This email confirms that the password for your Rongin Libas account has been updated successfully. 
      For your security, all active sessions on other devices have been automatically invalidated.
    </p>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" class="btn-green" style="color: #ffffff; text-decoration: none;">
        Sign In to Your Account
      </a>
    </div>

    <!-- Security Warning Box -->
    <div style="background-color: #fdfbf7; border-left: 3px solid #ba1a1a; padding: 16px 18px; border-radius: 2px; margin: 26px 0 20px 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="top" style="font-size: 16px; padding-right: 10px; width: 22px;">⚠️</td>
          <td style="font-size: 12px; color: #404945; line-height: 1.6;">
            <strong style="color: #ba1a1a;">Did not make this change?</strong><br>
            If you did not reset your password, please contact our concierge immediately at 
            <a href="https://wa.me/8801916664011" style="color: #073a2d; font-weight: bold; text-decoration: underline;">+880 1916 664011</a> 
            to secure your account.
          </td>
        </tr>
      </table>
    </div>

    <!-- Signature -->
    <div style="margin-top: 28px; font-size: 13px; color: #525d57; line-height: 1.6;">
      With aristocratic regard,<br>
      <strong style="color: #073a2d; font-family: 'Georgia', serif; font-size: 14px;">The Rongin Libas Atelier Concierge</strong>
    </div>
  `;
    const html = renderBaseEmailTemplate({
        title: 'Your Password Has Been Updated | Rongin Libas',
        previewText: 'Your Rongin Libas credentials were successfully updated.',
        contentHtml,
        webUrl,
    });
    const text = `RONGIN LIBAS — CLOTH YOUR IDENTITY
========================================
Password Updated Successfully

${patronGreeting}

This email confirms that the password for your Rongin Libas account has been updated successfully on ${timestamp} (BST).

Sign in to your account:
${loginUrl}

If you did NOT authorize this change, please contact our Concierge immediately:
WhatsApp / Direct: +880 1916 664011
`;
    return {
        subject: 'Your Rongin Libas password has been updated',
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
//# sourceMappingURL=password-reset-success.template.js.map