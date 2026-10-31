import crypto from 'crypto';
import { env } from '../../config/env';

const ALGORITHM = 'aes-256-gcm';
export const DEFAULT_KEY_VERSION = 'v1';

/**
 * Returns the currently active encryption key version.
 * Controlled by GMAIL_TOKEN_KEY_VERSION in environment variables.
 */
export function getActiveKeyVersion(): string {
  return process.env.GMAIL_TOKEN_KEY_VERSION || DEFAULT_KEY_VERSION;
}

/**
 * Derives a consistent 32-byte (256-bit) Buffer key from the environment.
 * Supports multiple key versions for zero-downtime key rotation.
 */
function resolveEncryptionKey(version = DEFAULT_KEY_VERSION): Buffer {
  // Support versioned key rotation (e.g. GMAIL_TOKEN_ENCRYPTION_KEY_V2)
  const envKey =
    version === 'v2'
      ? process.env.GMAIL_TOKEN_ENCRYPTION_KEY_V2
      : process.env.GMAIL_TOKEN_ENCRYPTION_KEY || process.env.GMAIL_TOKEN_ENCRYPTION_KEY_V1;

  if (envKey) {
    if (envKey.length === 64 && /^[0-9a-fA-F]+$/.test(envKey)) {
      return Buffer.from(envKey, 'hex');
    }
    return crypto.createHash('sha256').update(envKey).digest();
  }

  // Fallback for dev / test environments when environment key is omitted
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '⚠️ [SECURITY WARNING] GMAIL_TOKEN_ENCRYPTION_KEY is not configured in Render environment. Deriving fallback key from JWT secret. Configure a dedicated 256-bit key for production security.'
    );
  }

  const fallbackSeed = env.JWT_REFRESH_SECRET || 'grand-bandhan-default-encryption-salt-2026';
  return crypto.createHash('sha256').update(fallbackSeed).digest();
}

/**
 * Encrypts a sensitive string (refresh token or access token) at rest
 * using AES-256-GCM authenticated encryption.
 * Format: enc:<version>:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 */
export function encryptToken(plainText: string, keyVersion = getActiveKeyVersion()): string {
  if (!plainText) return plainText;

  const key = resolveEncryptionKey(keyVersion);
  // 12-byte IV recommended for GCM mode
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `enc:${keyVersion}:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a token encrypted with AES-256-GCM.
 * Validates the authentication tag to ensure data integrity.
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  // Backward compatibility: If plain text, return directly
  if (!encryptedText.startsWith('enc:')) {
    return encryptedText;
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 5 || parts[0] !== 'enc') {
    throw new Error('Invalid token encryption envelope format');
  }

  const [, version, ivHex, authTagHex, cipherHex] = parts;
  const key = resolveEncryptionKey(version);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    throw new Error(`Token decryption failed: Tampered or invalid ciphertext (${err.message})`);
  }
}

/**
 * Checks if a string is encrypted with the envelope.
 */
export function isEncrypted(text: string): boolean {
  return typeof text === 'string' && text.startsWith('enc:');
}

/**
 * Re-encrypts an existing token under a new key version (for manual or scheduled key rotation).
 */
export function reencryptToken(token: string, newVersion = getActiveKeyVersion()): string {
  const plainText = decryptToken(token);
  return encryptToken(plainText, newVersion);
}
