import './config/env';
import {
  prisma as databasePrisma,
  getPrismaClient as getSharedPrismaClient,
  checkDatabaseConnection as checkSharedDbConnection,
} from '@grand-bandhan/database';

let isPostgresAvailable = false;

export function getPrismaClient() {
  return databasePrisma;
}

export const prisma = databasePrisma;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const connected = await checkSharedDbConnection();
    isPostgresAvailable = connected;
    if (connected) {
      console.log('Successfully connected to Neon PostgreSQL.');
    } else {
      console.warn('⚠️ Neon PostgreSQL database is not reachable. Verify DATABASE_URL.');
    }
    return connected;
  } catch (error: any) {
    isPostgresAvailable = false;
    console.error('❌ Failed to connect to Neon PostgreSQL:', error.message);
    return false;
  }
}

export function isUsingPostgres(): boolean {
  return isPostgresAvailable;
}
