import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { setEncryptionKey } from 'server/helpers/session';
import AuthController from 'server/controllers/auth';
import { init as initMailer, sendEmail } from 'server/email/mailer';
import wordOfDayTemplate from 'server/email/templates/wordOfDay';

const TABLE_NAME = 'email-type';
const SUBSCRIPTION_TYPE = 'wotd-subscription';
const SESSION_TTL_SECONDS = 10 * 60; // 10 minutes

type Subscription = {
  email: string;
  type: string;
  daysRemaining: number;
  subscribedAt: string;
};

type RandomWordResponse = {
  word: string;
  definition: string;
  wordType?: string;
};

type Secrets = {
  RESEND_API_KEY: string;
  SESSION_ENCRYPTION_KEY: string;
};

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(dynamoClient);
const secretsClient = new SecretsManagerClient({});

// Cache for secrets
let cachedSecrets: Secrets | null = null;

async function getSecrets(): Promise<Secrets> {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  console.log('Fetching secrets from Secrets Manager');
  const command = new GetSecretValueCommand({
    SecretId: 'web-secrets',
  });

  const response = await secretsClient.send(command);
  if (!response.SecretString) {
    throw new Error('Secret string is empty');
  }

  const secrets = JSON.parse(response.SecretString);
  if (!secrets.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not found in secrets');
  }
  if (!secrets.SESSION_ENCRYPTION_KEY) {
    throw new Error('SESSION_ENCRYPTION_KEY not found in secrets');
  }

  cachedSecrets = {
    RESEND_API_KEY: secrets.RESEND_API_KEY,
    SESSION_ENCRYPTION_KEY: secrets.SESSION_ENCRYPTION_KEY,
  };

  // Set the encryption key for session token generation
  setEncryptionKey(cachedSecrets.SESSION_ENCRYPTION_KEY);

  // Initialize the mailer with the Resend API key
  initMailer(cachedSecrets.RESEND_API_KEY);

  return cachedSecrets;
}

async function getRandomWord(sessionToken: string): Promise<RandomWordResponse | null> {
  const apiEndpoint = process.env.API_ENDPOINT;
  const url = `${apiEndpoint}/api/v2/dictionary/random`;

  console.log(`Fetching random word from ${url}`);
  const response = await fetch(url, {
    headers: {
      Cookie: `web.session=${sessionToken}`,
    },
  });

  if (!response.ok) {
    console.error(`API request failed: ${response.status} ${response.statusText}`);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as RandomWordResponse;
  if (!data) {
    console.error('No word found');
    throw new Error('No word found');
  }
  return data;
}

async function getActiveSubscriptions(): Promise<Subscription[]> {
  const result = await docClient.scan({
    TableName: TABLE_NAME,
    FilterExpression: '#type = :type AND daysRemaining > :zero',
    ExpressionAttributeNames: {
      '#type': 'type',
    },
    ExpressionAttributeValues: {
      ':type': SUBSCRIPTION_TYPE,
      ':zero': 0,
    },
  });

  return (result.Items || []) as Subscription[];
}

async function updateSubscription(email: string, daysRemaining: number): Promise<void> {
  if (daysRemaining <= 0) {
    // Delete the subscription when complete
    await docClient.delete({
      TableName: TABLE_NAME,
      Key: {
        email,
        type: SUBSCRIPTION_TYPE,
      },
    });
    console.log(`Subscription completed and removed for ${email}`);
  } else {
    // Decrement daysRemaining
    await docClient.update({
      TableName: TABLE_NAME,
      Key: {
        email,
        type: SUBSCRIPTION_TYPE,
      },
      UpdateExpression: 'SET daysRemaining = :days',
      ExpressionAttributeValues: {
        ':days': daysRemaining,
      },
    });
    console.log(`Updated subscription for ${email}, ${daysRemaining} days remaining`);
  }
}

export const handler = async (): Promise<unknown> => {
  console.log('Word of Day Lambda started');

  // Get secrets from Secrets Manager (includes encryption key + mailer setup)
  await getSecrets();

  // Initialize AuthController to use its session methods
  AuthController.init({ dynamoDocClient: docClient });

  // Get active subscriptions
  console.log('Get active subscriptions');
  const subscriptions = await getActiveSubscriptions();
  console.log(`Found ${subscriptions.length} active subscriptions`);

  if (subscriptions.length === 0) {
    console.log('No active subscriptions');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'No active subscriptions' }),
    };
  }

  // Process each subscription
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const subscription of subscriptions) {
    let sessionToken: string | null = null;
    try {
      // Create a temporary session for this user (10 minute TTL)
      sessionToken = await AuthController.createSession(subscription.email, SESSION_TTL_SECONDS);
      console.log(`Created temporary session for ${subscription.email}`);

      // Get a random word via authenticated API
      console.log(`Get a random word for ${subscription.email}`);
      const word = (await getRandomWord(sessionToken)) as RandomWordResponse;

      console.log('Word found:', word);

      // Generate email content
      const { subject, html } = wordOfDayTemplate({
        email: subscription.email,
        word: word.word,
        definition: word.definition,
        wordType: word.wordType,
        dayNumber: 4 - subscription.daysRemaining, // Day 1, 2, or 3
      });

      // Send email
      console.log(`Sending email to ${subscription.email}`);
      await sendEmail({ to: subscription.email, subject, html });

      // Update subscription (decrement days or delete)
      await updateSubscription(subscription.email, subscription.daysRemaining - 1);

      results.success++;
      // Clean up temporary session
      AuthController.deleteSession(sessionToken!);
      console.log(`Deleted temporary session for ${subscription.email}`);
    } catch (error) {
      console.error(`Failed to process subscription for ${subscription.email}:`, error);
      results.failed++;
      results.errors.push(
        `${subscription.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
  console.log('Word of Day Lambda completed:', results);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Word of Day emails processed',
      ...results,
    }),
  };
};
