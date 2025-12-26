const { SecretsManager } = require('@aws-sdk/client-secrets-manager');

const secret_name = 'web-secrets';
const secretsManager = new SecretsManager();
const getSecret = async () => {
  const res = await secretsManager.getSecretValue({ SecretId: secret_name });
  const secret = JSON.parse(res.SecretString);
  console.log(secret);
  console.log(secret.SESSION_ENCRYPTION_KEY.length);
  console.log(secret.SESSION_ENCRYPTION_KEY);
};
getSecret();
