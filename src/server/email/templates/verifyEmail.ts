// TODO: Add images served from production CDN.
import mjml2html from 'mjml';

type VerifyEmailProps = {
  email: string;
  token: string;
};
export default function verifyEmail({ email, token }: VerifyEmailProps) {
  const link = `${process.env.APP_ENDPOINT}/api/auth/verify-email?email=${email}&token=${token}`;
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
                <mj-column width="60%">
                  <mj-text font-size="20px" line-height="0" align="center">Welcome to</mj-text>
                  <mj-text font-size="20px" line-height="35px" align="center">React Node AWS</mj-text>
                </mj-column>
                <mj-column width="40%">
                  <mj-image padding="10px" width="50px" src="http://via.placeholder.com/200x200"></mj-image>
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
  return { html };
}
