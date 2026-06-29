// Email service using Resend
// Get a free API key at resend.com (100 emails/day free)
// Add RESEND_API_KEY to your .env file

const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Mentora <noreply@mentora.az>';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

async function sendVerificationEmail(userEmail, userName, token) {
  if (!resend) {
    // Dev mode: just print the link to the console
    console.log('\n📧 DEV MODE - Email verification link:');
    console.log(`${APP_URL}/verify-email?token=${token}`);
    console.log('(Add RESEND_API_KEY to .env to send real emails)\n');
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: 'Mentora — E-poçtunu təsdiqlə',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="background: #0B7A75; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Mentora</h1>
        </div>
        <h2 style="font-size: 20px; margin-bottom: 8px;">Salam, ${userName}!</h2>
        <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Hesabını aktivləşdirmək üçün aşağıdakı düyməyə bas. Bu keçid 24 saat ərzində etibarlıdır.
        </p>
        <a href="${APP_URL}/verify-email?token=${token}"
           style="display: inline-block; background: #0B7A75; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
          E-poçtu təsdiqlə
        </a>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
          Bu e-poçtu siz göndərməmisinizsə, lütfən nəzərə almayın.
        </p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(userEmail, userName, token) {
  if (!resend) {
    console.log('\n📧 DEV MODE - Password reset link:');
    console.log(`${APP_URL}/reset-password?token=${token}`);
    console.log('(Add RESEND_API_KEY to .env to send real emails)\n');
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: 'Mentora — Şifrəni yenilə',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="background: #0B7A75; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Mentora</h1>
        </div>
        <h2 style="font-size: 20px; margin-bottom: 8px;">Şifrəni yeniləmək istədin?</h2>
        <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Bu keçid 1 saat ərzində etibarlıdır.
        </p>
        <a href="${APP_URL}/reset-password?token=${token}"
           style="display: inline-block; background: #0B7A75; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
          Şifrəni yenilə
        </a>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
          Bu əməliyyatı siz etməmisinizsə, şifrəniz dəyişdirilməyəcək.
        </p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
