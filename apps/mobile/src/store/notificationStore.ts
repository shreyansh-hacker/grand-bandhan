import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'VERIFICATION' | 'TASK' | 'PAYMENT' | 'ARRIVAL' | 'INFO';
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'init-1',
      title: 'Real-Time Radar Online',
      message: 'Mobile link established with Grand Bandhan Cloud & Neon PostgreSQL.',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'INFO',
    },
  ],
  unreadCount: 1,

  addNotification: (data) =>
    set((state) => {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
        type: data.type,
      };
      return {
        notifications: [newNotif, ...state.notifications].slice(0, 30),
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      let unreadDiff = 0;
      const updated = state.notifications.map((n) => {
        if (n.id === id && !n.read) {
          unreadDiff = 1;
          return { ...n, read: true };
        }
        return n;
      });
      return {
        notifications: updated,
        unreadCount: Math.max(0, state.unreadCount - unreadDiff),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
