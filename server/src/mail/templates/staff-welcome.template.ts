import { renderBaseEmailTemplate } from './base.template.js';

export interface StaffWelcomeTemplateOptions {
  fullName: string;
  email: string;
  userId: string;
  role: string;
  password: string;
  loginUrl: string;
  mustChangePassword?: boolean;
  webUrl?: string;
}

export function renderStaffWelcomeEmail(options: StaffWelcomeTemplateOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    fullName,
    email,
    userId,
    role,
    password,
    loginUrl,
    mustChangePassword = true,
    webUrl,
  } = options;

  const cleanName = escapeHtml(fullName.trim());
  const cleanEmail = escapeHtml(email.trim());
  const cleanId = escapeHtml(userId.trim());
  const cleanRole = escapeHtml(formatRole(role));
  const cleanPassword = escapeHtml(password);

  const contentHtml = `
    <!-- Top Greeting -->
    <div style="margin-bottom: 22px;">
      <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; color: #c79a45; display: block; margin-bottom: 6px;">
        Atelier Staff Onboarding &bull; Confidential
      </span>
      <h1 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: 600; color: #073a2d; margin: 0 0 12px 0; line-height: 1.3;">
        Welcome to the Administration Team
      </h1>
      <p style="font-size: 15px; font-weight: 600; color: #073a2d; margin: 0; line-height: 1.6;">
        Dear ${cleanName},
      </p>
    </div>

    <!-- Intro Statement -->
    <p style="font-size: 14px; color: #404945; line-height: 1.7; margin-bottom: 22px;">
      Your administrative account for <strong>Rongin Libas</strong> has been provisioned by the shop administration. You have been granted access to manage our atelier operations, orders, bespoke tailoring clientele, and sartorial collections.
    </p>

    <!-- Staff Credentials Box -->
    <div style="background-color: #f7faf8; border: 1px solid #d4e7df; border-radius: 4px; padding: 22px 24px; margin: 26px 0;">
      <div style="font-family: 'Georgia', serif; font-size: 16px; font-weight: 600; color: #073a2d; margin-bottom: 14px; border-bottom: 1px solid #d4e7df; padding-bottom: 8px;">
        Your Staff Account Credentials
      </div>
      
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #717975; width: 140px;" valign="top">
            Full Name:
          </td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #1b1c18;" valign="top">
            ${cleanName}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #717975;" valign="top">
            Staff / User ID:
          </td>
          <td style="padding: 6px 0; font-size: 13px; font-family: monospace; color: #073a2d; font-weight: 600;" valign="top">
            ${cleanId}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #717975;" valign="top">
            Login Email:
          </td>
          <td style="padding: 6px 0; font-size: 14px; font-family: monospace; color: #1b1c18; font-weight: 600;" valign="top">
            ${cleanEmail}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #717975;" valign="top">
            Assigned Role:
          </td>
          <td style="padding: 6px 0; font-size: 13px; color: #073a2d; font-weight: bold;" valign="top">
            <span style="background-color: #bcedda; color: #073a2d; padding: 2px 8px; border-radius: 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
              ${cleanRole}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #ba1a1a;" valign="top">
            Initial Password:
          </td>
          <td style="padding: 10px 0 6px 0; font-size: 15px; font-family: monospace; font-weight: bold; color: #1b1c18;" valign="top">
            <span style="background-color: #fff1f0; border: 1px solid #fecdd3; padding: 4px 10px; border-radius: 3px; letter-spacing: 1px;">
              ${cleanPassword}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Mandatory Password Change Advisory -->
    <div style="background-color: #fff8f6; border-left: 4px solid #ba1a1a; border-top: 1px solid #fecdd3; border-right: 1px solid #fecdd3; border-bottom: 1px solid #fecdd3; border-radius: 4px; padding: 16px 20px; margin: 26px 0;">
      <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #ba1a1a; margin-bottom: 6px;">
        ⚠️ Mandatory Security Requirement &bull; Action Required
      </div>
      <p style="font-size: 13px; color: #404945; line-height: 1.6; margin: 0;">
        For the security of our bespoke tailoring clients and atelier records, <strong>you must change your password immediately after logging in</strong>. Do not share these initial credentials with anyone.
      </p>
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${loginUrl}" class="btn-green" style="color: #ffffff; text-decoration: none; display: inline-block;">
        Log In to Admin Portal
      </a>
      <div style="margin-top: 12px;">
        <span style="font-size: 11px; color: #717975;">
          Direct Portal URL: <a href="${loginUrl}" style="color: #073a2d; text-decoration: underline;">${loginUrl}</a>
        </span>
      </div>
    </div>

    <!-- Password Change Steps Guide -->
    <div style="background-color: #fbf9f2; border: 1px dashed #deddd3; border-radius: 4px; padding: 16px 20px; margin: 24px 0; font-size: 12px; color: #525d57; line-height: 1.6;">
      <strong style="color: #1b1c18;">How to update your password:</strong><br>
      1. Log in to the Rongin Libas Admin Portal using the email and initial password above.<br>
      2. Click on the <strong>Staff</strong> menu or your profile icon in the top header.<br>
      3. Select <strong>Change Password</strong> and establish your new, secure password.
    </div>

    <!-- Signature -->
    <div style="margin-top: 28px; font-size: 13px; color: #525d57; line-height: 1.6;">
      Warm regards,<br>
      <strong style="color: #073a2d; font-family: 'Georgia', serif; font-size: 14px;">The Rongin Libas Administration</strong>
    </div>
  `;

  const html = renderBaseEmailTemplate({
    title: 'Staff Account Provisioned | Rongin Libas',
    previewText: `Welcome ${fullName}. Your Rongin Libas staff account credentials have been established.`,
    contentHtml,
    webUrl,
  });

  const text = `RONGIN LIBAS — CLOTH YOUR IDENTITY
========================================
ATELIER STAFF CREDENTIALS • CONFIDENTIAL

Dear ${fullName},

Your administrative account for Rongin Libas has been provisioned.

YOUR ACCOUNT DETAILS:
----------------------------------------
Full Name:        ${fullName}
Staff User ID:    ${userId}
Login Email:      ${email}
Assigned Role:    ${cleanRole}
Initial Password: ${password}

MANDATORY SECURITY REQUIREMENT:
For security, you must change your password immediately after logging in. Do not share these initial credentials with anyone.

Admin Portal Login:
${loginUrl}

Warm regards,
The Rongin Libas Administration
`;

  return {
    subject: 'Your Rongin Libas Staff Account Credentials — Confidential',
    html,
    text,
  };
}

function formatRole(role: string): string {
  switch (role.toUpperCase()) {
    case 'SUPER_ADMIN':
      return 'Super Administrator';
    case 'ADMIN':
      return 'Store Administrator';
    case 'MANAGER':
      return 'Atelier Operations Manager';
    case 'STAFF':
      return 'Staff Member';
    default:
      return role
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
