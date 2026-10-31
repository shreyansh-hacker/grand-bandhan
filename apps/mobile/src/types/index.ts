export * from '@grand-bandhan/shared';
export * from './navigation';

export interface ApiStatusResponse {
  status: string;
  service: string;
  neon: {
    connected: boolean;
    branch?: string;
    driver: string;
  };
  timestamp: string;
  uptime?: number;
}

export interface NeonDbStatusResponse {
  success: boolean;
  neon: {
    status: string;
    branch: string;
    database: string;
    user: string;
    postgresVersion: string;
    metrics: {
      agencies: number;
      users: number;
    };
  };
}
