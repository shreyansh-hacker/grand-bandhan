import dotenv from 'dotenv';
import path from 'path';

// Load .env.local and .env from root or local
const rootDir = path.resolve(process.cwd(), process.cwd().includes('apps') ? '../../' : '.');
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || '',
  NEON_BRANCH: process.env.NEON_BRANCH || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'grand-bandhan-jwt-access-secret-production-grade-2025',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'grand-bandhan-jwt-refresh-secret-production-grade-2025',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:4000',
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024, // 15MB binary storage limit in PostgreSQL BYTEA

  // Google OAuth 2.0 & Gmail API Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'https://grand-bandhan.onrender.com/api/email/oauth2/callback',
  GMAIL_SENDER_EMAIL: process.env.GMAIL_SENDER_EMAIL || 'shreyanshsharma049@gmail.com',
  GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN || '',
  GMAIL_TOKEN_ENCRYPTION_KEY: process.env.GMAIL_TOKEN_ENCRYPTION_KEY || '',
};

/**
 * Validates whether required Google OAuth environment variables are present.
 */
export function validateGmailEnv(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!env.GOOGLE_REDIRECT_URI) missing.push('GOOGLE_REDIRECT_URI');
  if (!env.GMAIL_SENDER_EMAIL) missing.push('GMAIL_SENDER_EMAIL');

  return {
    isValid: missing.length === 0,
    missing,
  };
}
