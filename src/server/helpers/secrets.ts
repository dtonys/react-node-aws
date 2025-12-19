import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const secret_name = 'web-secrets';
const secretsManager = new SecretsManager();

export async function loadSecrets() {
  const res = await secretsManager.getSecretValue({ SecretId: secret_name });
  if (!res.SecretString) {
    throw new Error('Secret string not found');
  }
  const secret = JSON.parse(res.SecretString) as { SESSION_ENCRYPTION_KEY: string; RESEND_API_KEY: string };
  return {
    SESSION_ENCRYPTION_KEY: secret.SESSION_ENCRYPTION_KEY,
    RESEND_API_KEY: secret.RESEND_API_KEY,
  };
}
