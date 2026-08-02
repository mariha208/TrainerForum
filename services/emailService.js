// services/emailService.js — Automated Email Service for World Trainer Forum
// Uses Resend HTTP API — bypasses Render's SMTP port blocks (465/587) entirely.
//
// Required Render Environment Variables:
//   RESEND_API_KEY  — Your Resend API key from https://resend.com/api-keys
//   RESEND_FROM     — (Optional) Verified sender address e.g. noreply@yourdomain.com
//                     Defaults to 'onboarding@resend.dev' (works without domain verification)
//   FRONTEND_URL    — Your deployed frontend URL e.g. https://worldtrainerforum.com
//
// Free Resend plan: 3,000 emails/month, 100/day. No credit card required.
// Docs: https://resend.com/docs/send-with-nodejs

const { Resend } = require('resend');

// Lazy-initialise so missing key shows a clear error at send-time, not at boot
let _resend = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        '[EmailService] RESEND_API_KEY is not set. ' +
        'Add it to your Render environment variables.'
      );
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/**
 * Send Password Reset Email via Resend
 * @param {Object} opts
 * @param {string} opts.email    — Recipient email address
 * @param {string} opts.name     — Recipient display name
 * @param {string} opts.resetUrl — Full password reset URL with token
 */
async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const recipientName = name || 'Valued User';

  // Use verified custom domain sender when available, else fall back to verified domain
  const fromAddress = process.env.RESEND_FROM || 'no-reply@worldtrainerforum.com';
  const fromFormatted = `World Trainer Forum <${fromAddress}>`;

  const subject = 'Reset Your Password — World Trainer Forum';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #08111e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #08111e;
      padding: 40px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: linear-gradient(145deg, #0b1b32 0%, #112646 100%);
      border: 1px solid rgba(197, 160, 89, 0.25);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .header {
      padding: 36px 40px 24px 40px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #ffffff;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-gold { color: #C5A059; }
    .content { padding: 36px 40px; }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 28px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #C5A059 0%, #D4B271 100%);
      color: #0B1B32 !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      border-radius: 10px;
      box-shadow: 0 8px 20px rgba(197, 160, 89, 0.35);
      letter-spacing: 0.5px;
    }
    .notice-card {
      background: rgba(197, 160, 89, 0.08);
      border-left: 4px solid #C5A059;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 28px;
    }
    .notice-title {
      font-size: 13px;
      font-weight: 700;
      color: #C5A059;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 4px 0;
    }
    .notice-text {
      font-size: 13px;
      color: #e2e8f0;
      margin: 0;
      line-height: 1.5;
    }
    .link-fallback {
      font-size: 12px;
      color: #94a3b8;
      word-break: break-all;
      margin-top: 24px;
      line-height: 1.5;
    }
    .link-fallback a { color: #C5A059; text-decoration: underline; }
    .footer {
      padding: 24px 40px;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    @media only screen and (max-width: 600px) {
      .content, .header, .footer {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .btn {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">WORLD <span class="brand-gold">TRAINER</span> FORUM</h1>
      </div>
      <div class="content">
        <h2 class="greeting">Hello ${recipientName},</h2>
        <p class="text">
          We received a request to reset the password associated with your World Trainer Forum account.
          Click the button below to establish a new password.
        </p>

        <div class="btn-container">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Your Password</a>
        </div>

        <div class="notice-card">
          <p class="notice-title">⏱️ Security Notice</p>
          <p class="notice-text">
            This password reset link will expire in <strong>15 minutes</strong>. If you did not initiate
            this request, you can safely ignore this email — your password will remain unchanged.
          </p>
        </div>

        <p class="link-fallback">
          If the button above does not work, copy and paste this link into your web browser:<br>
          <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} World Trainer Forum. All rights reserved.<br>
        This is an automated operational email. Please do not reply directly to this message.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = [
    `Hello ${recipientName},`,
    '',
    'We received a request to reset your password on World Trainer Forum.',
    '',
    `Reset your password here:\n${resetUrl}`,
    '',
    'This link will expire in 15 minutes.',
    'If you did not request a password reset, please ignore this email.',
    '',
    'Regards,',
    'World Trainer Forum Team'
  ].join('\n');

  console.log(`\n📧 [EmailService] Sending password reset email via Resend to: ${email}`);
  console.log(`   Reset URL: ${resetUrl}`);

  try {
    const resend = getResend();
    const response = await resend.emails.send({
      from: fromFormatted,
      to: email,
      subject,
      html: htmlContent,
      text: textContent
    });

    console.log(`✅ [EmailService] Resend accepted email for ${email}. ID: ${response?.data?.id || 'n/a'}`);
    return { success: true, id: response?.data?.id };
  } catch (err) {
    console.error(`❌ [EmailService] Resend error sending to ${email}:`, err.message);
    console.error('[EmailService] Full error:', err);
    throw err; // Re-throw so auth.js .catch() logs it properly
  }
}

module.exports = { sendPasswordResetEmail };
