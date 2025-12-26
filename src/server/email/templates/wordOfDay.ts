import mjml2html from 'mjml';

type WordOfDayEmailProps = {
  email: string;
  word: string;
  definition: string;
  wordType?: string;
  dayNumber: number;
};

export default function wordOfDay({
  email,
  word,
  definition,
  wordType,
  dayNumber,
}: WordOfDayEmailProps) {
  const appEndpoint = process.env.APP_ENDPOINT || 'https://www.react-node-aws.com';
  const searchLink = `${appEndpoint}/search?q=${encodeURIComponent(word)}`;

  const subject = `📚 Word of the Day (Day ${dayNumber}/3): ${word}`;

  const mjmlText = `
    <mjml>
      <mj-head>
        <mj-title>Word of the Day</mj-title>
        <mj-preview>Today's word: ${word} - ${definition.substring(0, 50)}...</mj-preview>
        <mj-attributes>
          <mj-all font-family="Georgia, serif" />
          <mj-text font-size="16px" line-height="1.6" color="#333333" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        <!-- Header -->
        <mj-section background-color="#1a1a2e" padding="30px 20px">
          <mj-column>
            <mj-text align="center" color="#ffffff" font-size="12px" letter-spacing="2px">
              WORD OF THE DAY
            </mj-text>
            <mj-text align="center" color="#e94560" font-size="14px" padding-top="5px">
              Day ${dayNumber} of 3
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Word Display -->
        <mj-section background-color="#ffffff" padding="40px 20px 20px">
          <mj-column>
            <mj-text align="center" font-size="42px" font-weight="bold" color="#1a1a2e" padding-bottom="10px">
              ${word}
            </mj-text>
            ${wordType ? `
            <mj-text align="center" font-size="14px" color="#888888" font-style="italic" padding-bottom="20px">
              ${wordType}
            </mj-text>
            ` : ''}
          </mj-column>
        </mj-section>

        <!-- Definition -->
        <mj-section background-color="#ffffff" padding="0 20px 30px">
          <mj-column>
            <mj-divider border-color="#e94560" border-width="2px" width="60px" padding-bottom="20px" />
            <mj-text align="center" font-size="18px" line-height="1.8" color="#444444">
              ${definition}
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- CTA Button -->
        <mj-section background-color="#ffffff" padding="0 20px 40px">
          <mj-column>
            <mj-button background-color="#1a1a2e" color="#ffffff" font-size="14px" padding="15px 30px" border-radius="25px" href="${searchLink}">
              Explore More Words
            </mj-button>
          </mj-column>
        </mj-section>

        <!-- Footer -->
        <mj-section background-color="#1a1a2e" padding="30px 20px">
          <mj-column>
            <mj-text align="center" color="#888888" font-size="12px">
              You're receiving this because you subscribed to Word of the Day.
            </mj-text>
            <mj-text align="center" color="#888888" font-size="12px" padding-top="10px">
              ${email}
            </mj-text>
            <mj-text align="center" color="#666666" font-size="11px" padding-top="20px">
              © React Node AWS
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjmlText);
  return { subject, html };
}

