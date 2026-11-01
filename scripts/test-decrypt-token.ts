import crypto from 'crypto';
import { prisma } from '@grand-bandhan/database';
import dotenv from 'dotenv';
dotenv.config();

const ALGORITHM = 'aes-256-gcm';

function tryDecrypt(encryptedText: string, keyBuffer: Buffer): string | null {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 5 || parts[0] !== 'enc') return null;
    const [, , ivHex, authTagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    let dec = decipher.update(cipherHex, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  } catch {
    return null;
  }
}

async function testDecryption() {
  const token = await prisma.gmailOAuthToken.findUnique({ where: { id: 'default' } });
  if (!token?.refreshToken) {
    console.log('No default token found');
    return;
  }

  console.log('Testing decryption of default token...');

  // Try candidate keys
  const candidates: { name: string; key: Buffer }[] = [
    {
      name: 'local JWT_REFRESH_SECRET',
      key: crypto.createHash('sha256').update(process.env.JWT_REFRESH_SECRET || '').digest(),
    },
    {
      name: 'fallback salt string',
      key: crypto.createHash('sha256').update('grand-bandhan-default-encryption-salt-2026').digest(),
    },
    {
      name: 'JWT_ACCESS_SECRET',
      key: crypto.createHash('sha256').update(process.env.JWT_ACCESS_SECRET || '').digest(),
    },
  ];

  for (const c of candidates) {
    const res = tryDecrypt(token.refreshToken, c.key);
    if (res) {
      console.log(`SUCCESS with key: ${c.name}! Decrypted token starts with: ${res.slice(0, 10)}...`);
      return;
    } else {
      console.log(`Failed with key: ${c.name}`);
    }
  }

  console.log('None of the local keys matched.');
}

testDecryption().catch(console.error);
