// services/emailService.js — Automated Email Service for World Trainer Forum
const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer Transporter.
 *
 * Priority order for configuration:
 *   1. Gmail via EMAIL_USER + EMAIL_PASS (Gmail App Password — recommended for Render)
 *   2. Custom SMTP via SMTP_HOST + SMTP_USER + SMTP_PASS (generic SMTP server)
 *
 * ⚠️  Gmail requires an App Password (NOT your regular Gmail password).
 *     Generate one at: https://myaccount.google.com/apppasswords
 *
 * Required Render Environment Variables:
 *   EMAIL_USER     — Gmail address, e.g. yourname@gmail.com
 *   EMAIL_PASS     — Gmail App Password (16-character code, no spaces)
 *   FRONTEND_URL   — Your deployed frontend URL, e.g. https://worldtrainerforum.com
 *
 * Optional (alternative SMTP):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
function createTransporter() {
  // Option 1: Gmail with App Password
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('[EmailService] Using Gmail transporter (EMAIL_USER).');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Must be a Gmail App Password, NOT your regular password
      }
    });
  }

  // Option 2: Generic SMTP server
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    console.log('[EmailService] Using custom SMTP transporter (SMTP_HOST).');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  console.warn('[EmailService] ⚠️  No email credentials configured. Set EMAIL_USER + EMAIL_PASS in Render environment variables.');
  return null;
}

/**
 * Send Password Reset Email
 * @param {Object} opts - { email, name, resetUrl }
 */
async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const recipientName = name || 'Valued User';
  const fromEmail = process.env.EMAIL_FROM ||
                    process.env.EMAIL_USER ||
                    process.env.SMTP_FROM  ||
                    process.env.SMTP_USER  ||
                    'no-reply@worldtrainerforum.com';
  
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
    .brand-gold {
      color: #C5A059;
    }
    .content {
      padding: 36px 40px;
    }
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
    .link-fallback a {
      color: #C5A059;
      text-decoration: underline;
    }
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
            This password reset link will expire in <strong>15 minutes</strong>. If you did not initiate this request, you can safely ignore this email — your password will remain unchanged.
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

  const textContent = `Hello ${recipientName},\n\nWe received a request to reset your password on World Trainer Forum.\n\nPlease use the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\nIf you did not request a password reset, please ignore this email.\n\nRegards,\nWorld Trainer Forum Team`;

  console.log(`\n📧 [PASSWORD RESET EMAIL LOG] To: ${email}\nReset URL: ${resetUrl}\n`);

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"World Trainer Forum" <${fromEmail}>`,
        to: email,
        subject,
        text: textContent,
        html: htmlContent
      });
      console.log(`✅ [EmailService] Password reset email sent to ${email}`);
      return { success: true };
    } catch (err) {
      console.error(`❌ [EmailService] Nodemailer error sending to ${email}:`, err.message);
      console.error('[EmailService] Full error stack:', err.stack || err);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`ℹ️ [EmailService] SMTP not configured. Logged reset link for dev mode.`);
    return { success: true, simulated: true };
  }
}

module.exports = {
  sendPasswordResetEmail
};
