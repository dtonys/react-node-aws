import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const secret_name = 'web-secrets';
const secretsManager = new SecretsManager({ region: 'us-west-1' });

export async function loadSecrets() {
  const res = await secretsManager.getSecretValue({ SecretId: secret_name });
  if (!res.SecretString) {
    throw new Error('Secret string not found');
  }
  const secret = JSON.parse(res.SecretString) as { SESSION_ENCRYPTION_KEY: string };
  return secret.SESSION_ENCRYPTION_KEY;
}
