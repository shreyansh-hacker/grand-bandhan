import './config/env';
import { prisma as databasePrisma, getPrismaClient as getSharedPrismaClient, checkDatabaseConnection as checkSharedDbConnection } from '@grand-bandhan/database';
import fs from 'fs';
import path from 'path';

let isPostgresAvailable = false;

export function getPrismaClient() {
  return databasePrisma;
}

export const prisma = databasePrisma;

// In-Memory / File-based Local Mock Store for Seamless Offline Hackathon Evaluation
const LOCAL_DB_PATH = path.resolve(process.cwd(), 'local-store.json');

export interface DatabaseStore {
  agencies: any[];
  users: any[];
  refreshTokens: any[];
  enquiries: any[];
  weddings: any[];
  staffAssignments: any[];
  agreements: any[];
  vendors: any[];
  quotationRequests: any[];
  quotations: any[];
  weddingVendors: any[];
  tasks: any[];
  events: any[];
  arrivals: any[];
  verifications: any[];
  payments: any[];
  settlements: any[];
  feedbacks: any[];
  auditLogs: any[];
}

const defaultStore: DatabaseStore = {
  agencies: [],
  users: [],
  refreshTokens: [],
  enquiries: [],
  weddings: [],
  staffAssignments: [],
  agreements: [],
  vendors: [],
  quotationRequests: [],
  quotations: [],
  weddingVendors: [],
  tasks: [],
  events: [],
  arrivals: [],
  verifications: [],
  payments: [],
  settlements: [],
  feedbacks: [],
  auditLogs: [],
};

class LocalDatabaseManager {
  private store: DatabaseStore;

  constructor() {
    this.store = this.load();
  }

  private load(): DatabaseStore {
    try {
      if (fs.existsSync(LOCAL_DB_PATH)) {
        const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read local store, starting fresh', e);
    }
    return { ...defaultStore };
  }

  public save(): void {
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist local store', e);
    }
  }

  public get<K extends keyof DatabaseStore>(key: K): DatabaseStore[K] {
    return this.store[key];
  }

  public set<K extends keyof DatabaseStore>(key: K, data: DatabaseStore[K]): void {
    this.store[key] = data;
    this.save();
  }

  public reset(): void {
    this.store = { ...defaultStore };
    this.save();
  }
}

export const localDb = new LocalDatabaseManager();

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const connected = await checkSharedDbConnection();
    isPostgresAvailable = connected;
    if (connected) {
      console.log('Successfully connected to Neon PostgreSQL.');
    } else {
      console.log('PostgreSQL database not directly reachable. Running in resilient local JSON storage mode with full persistence.');
    }
    return connected;
  } catch (error) {
    isPostgresAvailable = false;
    console.log('PostgreSQL database not directly reachable. Running in resilient local JSON storage mode with full persistence.');
    return false;
  }
}

export function isUsingPostgres(): boolean {
  return isPostgresAvailable;
}
