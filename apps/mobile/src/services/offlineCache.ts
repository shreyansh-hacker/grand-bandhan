import { AppNotificationItem } from '@grand-bandhan/shared';

// In-memory memory-backed cache with persistent fallback structure
interface CacheStore {
  weddings: any[];
  timelines: Record<string, any[]>;
  tasks: Record<string, any[]>;
  vendors: any[];
  notifications: AppNotificationItem[];
  lastSyncTimestamp: string | null;
  isOfflineMode: boolean;
}

const memoryStore: CacheStore = {
  weddings: [],
  timelines: {},
  tasks: {},
  vendors: [],
  notifications: [],
  lastSyncTimestamp: null,
  isOfflineMode: false,
};

export const offlineCacheService = {
  setOfflineMode(isOffline: boolean) {
    memoryStore.isOfflineMode = isOffline;
  },

  isOffline(): boolean {
    return memoryStore.isOfflineMode;
  },

  setLastSyncTime(timestamp = new Date().toISOString()) {
    memoryStore.lastSyncTimestamp = timestamp;
  },

  getLastSyncTime(): string | null {
    return memoryStore.lastSyncTimestamp;
  },

  saveWeddings(weddings: any[]) {
    memoryStore.weddings = weddings || [];
    this.setLastSyncTime();
  },

  getWeddings(): any[] {
    return memoryStore.weddings;
  },

  saveTimeline(weddingId: string, timeline: any[]) {
    memoryStore.timelines[weddingId] = timeline || [];
    this.setLastSyncTime();
  },

  getTimeline(weddingId: string): any[] {
    return memoryStore.timelines[weddingId] || [];
  },

  saveTasks(weddingId: string, tasks: any[]) {
    memoryStore.tasks[weddingId] = tasks || [];
    this.setLastSyncTime();
  },

  getTasks(weddingId: string): any[] {
    return memoryStore.tasks[weddingId] || [];
  },

  saveVendors(vendors: any[]) {
    memoryStore.vendors = vendors || [];
    this.setLastSyncTime();
  },

  getVendors(): any[] {
    return memoryStore.vendors;
  },

  saveNotifications(notifications: AppNotificationItem[]) {
    memoryStore.notifications = notifications || [];
    this.setLastSyncTime();
  },

  getNotifications(): AppNotificationItem[] {
    return memoryStore.notifications;
  },

  /**
   * CRITICAL SECURITY REQUIREMENT:
   * Purge all sensitive cached records on user logout or account switch.
   */
  clearAll() {
    memoryStore.weddings = [];
    memoryStore.timelines = {};
    memoryStore.tasks = {};
    memoryStore.vendors = [];
    memoryStore.notifications = [];
    memoryStore.lastSyncTimestamp = null;
    memoryStore.isOfflineMode = false;
  },
};
