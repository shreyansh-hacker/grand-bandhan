import { create } from 'zustand';
import { apiClient } from '../api/client';
import { AppNotificationItem, NotificationCategory } from '@grand-bandhan/shared';
import { offlineCacheService } from '../services/offlineCache';

interface InboxState {
  notifications: AppNotificationItem[];
  unreadCount: number;
  selectedCategory: string;
  isLoading: boolean;
  isOffline: boolean;
  lastSyncedAt: string | null;

  setCategory: (category: string) => void;
  fetchNotifications: (category?: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addRealtimeNotification: (item: AppNotificationItem) => void;
  clearInbox: () => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  selectedCategory: 'ALL',
  isLoading: false,
  isOffline: false,
  lastSyncedAt: null,

  setCategory: (category: string) => {
    set({ selectedCategory: category });
    get().fetchNotifications(category);
  },

  fetchNotifications: async (category?: string) => {
    set({ isLoading: true });
    const targetCat = category || get().selectedCategory;
    const catQuery = targetCat && targetCat !== 'ALL' ? `?category=${targetCat}` : '';

    try {
      const response = await apiClient.get<any>(`/api/notifications${catQuery}`);
      const data = response.data;
      if (data && data.success) {
        const notifs = data.data || [];
        set({
          notifications: notifs,
          unreadCount: data.unreadCount ?? get().unreadCount,
          isLoading: false,
          isOffline: false,
          lastSyncedAt: new Date().toISOString(),
        });
        offlineCacheService.saveNotifications(notifs);
        offlineCacheService.setOfflineMode(false);
      }
    } catch (err: any) {
      console.warn('[InboxStore] Network fetch failed, reading from offline cache:', err.message);
      // Fallback to offline cache
      const cached = offlineCacheService.getNotifications();
      const filtered = targetCat && targetCat !== 'ALL'
        ? cached.filter((n) => n.category === targetCat)
        : cached;

      set({
        notifications: filtered,
        isLoading: false,
        isOffline: true,
        lastSyncedAt: offlineCacheService.getLastSyncTime(),
      });
      offlineCacheService.setOfflineMode(true);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; count: number }>('/api/notifications/unread-count');
      if (response.data?.success) {
        set({ unreadCount: response.data.count });
      }
    } catch (err) {
      // Ignore count fetch errors offline
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic local update
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      );
      const unreadDiff = state.notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0;
      return {
        notifications: updated,
        unreadCount: Math.max(0, state.unreadCount - unreadDiff),
      };
    });

    try {
      await apiClient.patch(`/api/notifications/${id}/read`);
    } catch (err: any) {
      console.warn('[InboxStore] Mark as read failed:', err.message);
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      unreadCount: 0,
    }));

    try {
      await apiClient.post('/api/notifications/mark-all-read');
    } catch (err: any) {
      console.warn('[InboxStore] Mark all read failed:', err.message);
    }
  },

  addRealtimeNotification: (item: AppNotificationItem) => {
    set((state) => ({
      notifications: [item, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearInbox: () => {
    set({
      notifications: [],
      unreadCount: 0,
      selectedCategory: 'ALL',
      isOffline: false,
      lastSyncedAt: null,
    });
    offlineCacheService.clearAll();
  },
}));
