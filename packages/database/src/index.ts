import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from './generated/client';

// Load .env.local and .env from workspace roots
const cwd = process.cwd();
const rootDir = path.resolve(cwd, cwd.includes('packages') || cwd.includes('apps') ? '../../' : '.');
dotenv.config({ path: path.resolve(cwd, '.env.local') });
dotenv.config({ path: path.resolve(cwd, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

let prismaClient: PrismaClient | null = null;
let isConnectedToPostgres = false;

export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prismaClient;
}

export const prisma = getPrismaClient();

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    isConnectedToPostgres = true;
    return true;
  } catch (error) {
    isConnectedToPostgres = false;
    return false;
  }
}

export function isNeonConnected(): boolean {
  return isConnectedToPostgres;
}

export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  branch: string;
  database?: string;
  user?: string;
  postgresVersion?: string;
  metrics?: {
    agencies: number;
    weddings: number;
    vendors: number;
    users: number;
    storedFiles: number;
  };
  error?: string;
}> {
  try {
    const client = getPrismaClient();
    const result = await client.$queryRaw<any[]>`SELECT version(), current_database(), current_user`;
    const [agencies, weddings, vendors, users, storedFiles] = await Promise.all([
      client.agency.count(),
      client.wedding.count(),
      client.vendor.count(),
      client.user.count(),
      client.storedFile.count().catch(() => 0),
    ]);

    isConnectedToPostgres = true;
    return {
      connected: true,
      branch: process.env.NEON_BRANCH || 'production',
      database: result[0]?.current_database,
      user: result[0]?.current_user,
      postgresVersion: result[0]?.version,
      metrics: {
        agencies,
        weddings,
        vendors,
        users,
        storedFiles,
      },
    };
  } catch (err: any) {
    isConnectedToPostgres = false;
    return {
      connected: false,
      branch: process.env.NEON_BRANCH || 'production',
      error: err.message,
    };
  }
}

export * from './generated/client';
