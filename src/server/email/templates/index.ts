import { sendEmail } from 'server/email/mailer';

type VerifyEmailProps = {
  email: string;
  token: string;
};
export function verifyEmail({ email, token }: VerifyEmailProps) {
  const link = `${process.env.WEB_APP_URL}/api/auth/verify-email?email=${email}&token=${token}`;
  const text = `To verify your email, click <a href="${link}">here</a>`;
  sendEmail({ to: email, subject: 'react-node-aws - Verify Email', text });
}

type ResetPasswordProps = {
  email: string;
  token: string;
};
export function forgotPassword({ email, token }: ResetPasswordProps) {
  const link = `${process.env.WEB_APP_URL}/api/auth/reset-password?email=${email}&token=${token}`;
  const text = `To reset your password, click <a href=${link}>here</a>`;
  sendEmail({ to: email, subject: 'react-node-aws - Reset Password', text });
}
