import mjml2html from 'mjml';

type VerifyEmailProps = {
  email: string;
  token: string;
};
export default function verifyEmail({ email, token }: VerifyEmailProps) {
  const appEndpoint = process.env.APP_ENDPOINT || 'https://www.react-node-aws.com';
  const logoUrl = `${appEndpoint}/images/RNA-white-2.998e9d2c1dfde8bdd9c1.png`;
  const link = `${appEndpoint}/api/auth/verify-email?email=${email}&token=${token}`;
  const subject = 'Verify your account';
  const mjmlText = `
    <mjml>
      <mj-head>
          <mj-title>Verify your account</mj-title>
          <mj-preview>Click the button below to verify your account.</mj-preview>
      </mj-head>
      <mj-body>
          <mj-raw>
            <!-- Header with logo -->
          </mj-raw>
          <mj-section background-color="#f5f5f5" border-bottom="solid black 3px">
            <mj-group>
                <mj-column width="60%" vertical-align="middle">
                  <mj-text font-size="20px" line-height="24px" align="center">Welcome to</mj-text>
                  <mj-text font-size="20px" line-height="24px" align="center" padding-top="0">React Node AWS</mj-text>
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
                <mj-text>Hey ${email}</mj-text>
                <mj-text>Thanks for joining React Node AWS.</mj-text>
                <mj-text>Click the button below to <a href="${link}">verify your account</a>.</mj-text>
            </mj-column>
          </mj-section>
          <mj-raw>
            <!-- CTA Buttion Section -->
          </mj-raw>
          <mj-section background-color="#f5f5f5" border-bottom="solid black 3px">
            <mj-column>
                <mj-button background-color="black" color="white" href="${link}">Verify Account</mj-button>
            </mj-column>
          </mj-section>
      </mj-body>
    </mjml>
  `;
  const { html } = mjml2html(mjmlText);
  return { subject, html };
}
