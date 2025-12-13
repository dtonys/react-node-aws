import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  secure: false,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

type SendEmailOptions = {
  to: string;
  subject: string;
  from?: string;
  html?: string;
  text?: string;
};

export async function sendEmail({
  from = 'noreply@react-node-aws.com',
  to,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<void> {
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    ...(html ? { html } : {}),
    ...(text ? { text } : {}),
  });
  console.log('Email sent successfully:', info.messageId);
}
