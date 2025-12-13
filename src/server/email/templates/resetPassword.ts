import mjml2html from 'mjml';

// TODO: Add images served from production CDN.
type ResetPasswordProps = {
  email: string;
  token: string;
};
export default function resetPassword({ email, token }: ResetPasswordProps) {
  const link = `${process.env.APP_ENDPOINT}/api/auth/reset-password?email=${email}&token=${token}`;
  const text = `
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
                <mj-column width="60%">
                  <mj-text font-size="20px" line-height="0" align="center">Reset</mj-text>
                  <mj-text font-size="20px" line-height="35px" align="center">Password</mj-text>
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
  return mjml2html(text);
}
