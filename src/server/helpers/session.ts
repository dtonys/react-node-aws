import { randomBytes, scrypt, createCipheriv, createDecipheriv } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return hash === derivedKey.toString('hex');
}

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
let encryptionKey: string | null = null;
export function setEncryptionKey(key: string) {
  encryptionKey = key;
}
export function encrypt(email: string) {
  if (!encryptionKey) throw new Error('Encryption key not set');
  const key = Buffer.from(encryptionKey, 'base64');
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(email, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const packed = Buffer.concat([iv, authTag, ciphertext]);
  return packed.toString('base64url');
}

export function decrypt(token: string) {
  if (!encryptionKey) throw new Error('Encryption key not set');
  const key = Buffer.from(encryptionKey, 'base64');
  const packed = Buffer.from(token, 'base64url');
  if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid token format');
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  const email = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');

  return email;
}

// const result = await dynamoDocClient.batchGet({
//   RequestItems: {
//     [tableName]: {
//       Keys: [
//         { PK: email, SK: "USER" },
//         { PK: email, SK: `SESSION#${token}` },
//       ],
//     },
//   },
// });
