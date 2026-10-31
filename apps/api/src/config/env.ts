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
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:4000',
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024, // 15MB binary storage limit in PostgreSQL BYTEA
};
