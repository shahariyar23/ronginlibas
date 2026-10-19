/**
 * Rongin Libas - Base Email Template Shell
 * High-compatibility, responsive HTML email layout with Bengali Heritage luxury aesthetic.
 */

export interface BaseEmailOptions {
  title: string;
  previewText: string;
  contentHtml: string;
  webUrl?: string;
}

export function renderBaseEmailTemplate(options: BaseEmailOptions): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultWebUrl = isProduction ? 'https://ronginlibas.com' : 'http://localhost:3000';

  let rawWebUrl =
    options.webUrl ||
    process.env.WEB_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    defaultWebUrl;

  if (isProduction && (rawWebUrl.includes('localhost') || rawWebUrl.includes('127.0.0.1'))) {
    rawWebUrl = 'https://ronginlibas.com';
  }

  const { title, previewText, contentHtml } = options;
  const normalizedWebUrl = rawWebUrl.trim().replace(/\/$/, '');
  const currentYear = new Date().getFullYear();
  const logoUrl = `${normalizedWebUrl}/logo.svg`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style>
    * { font-family: 'Georgia', serif !important; }
  </style>
  <![endif]-->
  <style>
    /* Reset & Client-Specific Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f4f3ec;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2b332f;
      line-height: 1.6;
    }
    a { color: #073a2d; text-decoration: none; }
    .email-container { max-width: 600px; margin: 0 auto; }
    .btn-green {
      background-color: #073a2d;
      background: linear-gradient(135deg, #0d4d3b 0%, #073a2d 100%);
      color: #ffffff !important;
      display: inline-block;
      padding: 14px 32px;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-align: center;
      text-decoration: none;
      border-radius: 2px;
      border: 1px solid #c79a45;
      box-shadow: 0 4px 14px rgba(7, 58, 45, 0.25);
    }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .content-padding { padding: 24px 18px !important; }
      .badge-col { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
      .header-title { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f3ec;">
  <!-- Hidden Preheader -->
  <div style="display: none; font-size: 1px; color: #f4f3ec; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(previewText)}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <!-- Background Wrapper -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f3ec; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px 40px 12px;">
        <!-- Email Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border: 1px solid #deddd3; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          
          <!-- BRAND HEADER BANNER (FIRST OF THE PAGE LOGO) -->
          <tr>
            <td align="center" style="background-color: #fbf9f5; padding: 28px 24px 24px 24px; border-top: 4px solid #073a2d; border-bottom: 2px solid #c79a45;">
              <table border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <!-- Brand Official Logo Emblem (First of the page) -->
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${normalizedWebUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${logoUrl}" alt="Rongin Libas Logo" width="84" height="62" style="display: block; margin: 0 auto; max-height: 62px; width: auto; border: 0; outline: none;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <!-- Brand Name -->
                  <td align="center">
                    <span style="font-family: 'Cinzel', 'Georgia', serif; font-size: 22px; font-weight: 700; color: #073a2d; letter-spacing: 4px; text-transform: uppercase; display: block; margin: 0;">
                      RONGIN LIBAS
                    </span>
                  </td>
                </tr>
                <tr>
                  <!-- Tagline -->
                  <td align="center" style="padding-top: 4px;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; font-weight: 700; color: #a87829; letter-spacing: 3px; text-transform: uppercase; display: block;">
                      CLOTH YOUR IDENTITY &bull; BENGAL ATELIER
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 30px 36px; background-color: #ffffff;">
              ${contentHtml}
            </td>
          </tr>

          <!-- ATELIER ASSURANCE BADGES -->
          <tr>
            <td style="background-color: #fcfbf7; padding: 24px 28px; border-top: 1px solid #deddd3; border-bottom: 1px solid #deddd3;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50%" class="badge-col" style="padding: 6px 8px;" valign="top">
                    <div style="font-size: 12px; font-weight: 600; color: #073a2d; margin-bottom: 2px;">
                      🚚 48h Inside Dhaka Transit
                    </div>
                    <div style="font-size: 11px; color: #717975;">
                      Fast dispatch to all 64 districts
                    </div>
                  </td>
                  <td width="50%" class="badge-col" style="padding: 6px 8px;" valign="top">
                    <div style="font-size: 12px; font-weight: 600; color: #073a2d; margin-bottom: 2px;">
                      📦 Open-Box Inspection Privilege
                    </div>
                    <div style="font-size: 11px; color: #717975;">
                      Inspect fabrics before payment
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" class="badge-col" style="padding: 6px 8px;" valign="top">
                    <div style="font-size: 12px; font-weight: 600; color: #073a2d; margin-bottom: 2px;">
                      🔄 2-Day Doorstep Exchange
                    </div>
                    <div style="font-size: 11px; color: #717975;">
                      2-Day hassle-free exchange
                    </div>
                  </td>
                  <td width="50%" class="badge-col" style="padding: 6px 8px;" valign="top">
                    <div style="font-size: 12px; font-weight: 600; color: #073a2d; margin-bottom: 2px;">
                      ✂️ Master Cutter Atelier
                    </div>
                    <div style="font-size: 11px; color: #717975;">
                      Bespoke panjabi craftsmanship
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONCIERGE & SUPPORT FOOTER (LAST OF THE PAGE LOGO & NO EMAIL) -->
          <tr>
            <td style="background-color: #fbf9f5; padding: 28px 30px 24px 30px; text-align: center; color: #49544e; border-top: 2px solid #c79a45;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Brand Logo at Last of the Page -->
                  <td align="center" style="padding-bottom: 14px;">
                    <a href="${normalizedWebUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${logoUrl}" alt="Rongin Libas Logo" width="56" height="42" style="display: block; margin: 0 auto; max-height: 42px; width: auto; border: 0; outline: none; opacity: 1;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <!-- Helpline (Email removed as requested) -->
                  <td align="center" style="font-size: 12px; line-height: 1.6; color: #49544e;">
                    <span style="color: #073a2d; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Patron Concierge Helpline:</span><br>
                    WhatsApp / Direct: <a href="https://wa.me/8801352926067" style="color: #073a2d; text-decoration: underline; font-weight: bold;">+8801352926067</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 14px; font-size: 11px; color: #717975; border-top: 1px solid #deddd3; margin-top: 12px;">
                    &copy; ${currentYear} Rongin Libas. All rights reserved.<br>
                    Dhaka, Bangladesh &bull; <a href="${normalizedWebUrl}" style="color: #073a2d; text-decoration: underline; font-weight: 600;">Visit Sanctuary Storefront</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
