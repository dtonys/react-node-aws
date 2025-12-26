import mjml2html from 'mjml';

type ResetPasswordProps = {
  email: string;
  token: string;
};
export default function resetPassword({ email, token }: ResetPasswordProps) {
  const appEndpoint = process.env.APP_ENDPOINT || 'https://www.react-node-aws.com';
  const logoUrl = `${appEndpoint}/images/RNA-white-2.998e9d2c1dfde8bdd9c1.png`;
  const link = `${appEndpoint}/api/auth/reset-password?email=${email}&token=${token}`;
  const subject = 'Reset your password';
  const mjmlText = `
    <mjml>
      <mj-head>
          <mj-title>Reset Password</mj-title>
          <mj-preview>Click the button below to reset your password.</mj-preview>
      </mj-head>
      <mj-body>
          <mj-raw>
            <!-- Header with logo -->
          </mj-raw>
          <mj-section background-color="#f5f5f5" border-bottom="solid black 3px">
            <mj-group>
                <mj-column width="60%" vertical-align="middle">
                  <mj-text font-size="20px" line-height="24px" align="center">Reset</mj-text>
                  <mj-text font-size="20px" line-height="24px" align="center" padding-top="0">Password</mj-text>
                </mj-column>
                <mj-column width="40%" vertical-align="middle">
                  <mj-image padding="10px" width="100px" src="${logoUrl}"></mj-image>
                </mj-column>
            </mj-group>
          </mj-section>
          <mj-raw>
            <!-- Text Content -->
          </mj-raw>
          <mj-section background-color="#ffffff" border-bottom="solid black 3px">
            <mj-column>
                <mj-text>Hey ${email},</mj-text>
                <mj-text>We received a request to reset your password.</mj-text>
                <mj-text>Click the button below to <a href="${link}">reset your password.</a>.</mj-text>
            </mj-column>
          </mj-section>
          <mj-section background-color="#f5f5f5" border-bottom="solid black 3px">
            <mj-column>
                <mj-button background-color="black" color="white" href="${link}">Reset Password</mj-button>
            </mj-column>
          </mj-section>
      </mj-body>
    </mjml>
  `;
  const { html } = mjml2html(mjmlText);
  return { subject, html };
}
