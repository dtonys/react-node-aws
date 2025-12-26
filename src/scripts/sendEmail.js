const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { init, sendEmail } = require('../../dist/server/email/mailer');
const { default: verifyEmail } = require('../../dist/server/email/templates/verifyEmail');
const { default: resetPassword } = require('../../dist/server/email/templates/resetPassword');

async function main() {
  console.log('Sending verifyEmail...');

  console.log('RESEND_API_KEY', process.env.RESEND_API_KEY);
  // Initialize mailer with Resend API key
  init(process.env.RESEND_API_KEY);

  const { html, subject } = verifyEmail({ email: 'fitcal007@gmail.com', token: '1234567890' });
  await sendEmail({ to: 'fitcal007@gmail.com', subject, html });

  console.log('Email sent successfully');
}

main();
