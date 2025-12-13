const dotenv = require('dotenv');
const path = require('path');
const repl = require('repl');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { sendEmail } = require('../server/dist/server/email/mailer');
const { default: verifyEmail } = require('../server/dist/server/email/templates/verifyEmail');
const { default: resetPassword } = require('../server/dist/server/email/templates/resetPassword');

async function main() {
  console.log('Sending email...');
  // const replServer = repl.start({
  //   prompt: '> ',
  // });
  // console.log('process.env.APP_ENDPOINT');
  // console.log(process.env.APP_ENDPOINT);

  // replServer.context.verifyEmail = verifyEmail;
  // replServer.context.resetPassword = resetPassword;
  // replServer.context.sendEmail = sendEmail;
  // const { html, subject } = await verifyEmail({ email: 'fitcal007@gmail.com', token: '1234567890' });
  // await sendEmail({ to: 'fitcal007@gmail.com', subject, html });
  // const { html, subject } = resetPassword({ email: 'fitcal007@gmail.com', token: '1234567890' });
  // await sendEmail({ to: 'fitcal007@gmail.com', subject, html });
  console.log('Email sent successfully');
}

main();
