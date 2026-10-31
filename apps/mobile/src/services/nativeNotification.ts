import { NativeModules, Platform } from 'react-native';

const { GrandBandhanNotification } = NativeModules;

export interface ScheduleNotificationOptions {
  id: string;
  title: string;
  message: string;
  timestampMs: number;
  channelId?: 'gb_verifications' | 'gb_milestones' | 'gb_payments' | 'gb_general';
  deepLinkUri?: string;
  dataJson?: string;
}

export interface DisplayNotificationOptions {
  id?: string;
  title: string;
  message: string;
  channelId?: 'gb_verifications' | 'gb_milestones' | 'gb_payments' | 'gb_general';
  deepLinkUri?: string;
  dataJson?: string;
}

export interface ScheduledNotificationRecord {
  id: string;
  title: string;
  message: string;
  timestampMs: number;
  channelId: string;
  deepLinkUri?: string;
  dataJson?: string;
}

export interface PermissionStatus {
  notificationsEnabled: boolean;
  exactAlarmGranted: boolean;
  sdkInt: number;
}

export const nativeNotification = {
  isAvailable(): boolean {
    return Platform.OS === 'android' && !!GrandBandhanNotification;
  },

  async checkPermissions(): Promise<PermissionStatus> {
    if (!this.isAvailable()) {
      return { notificationsEnabled: true, exactAlarmGranted: true, sdkInt: 0 };
    }
    return GrandBandhanNotification.checkPermissions();
  },

  async requestExactAlarmPermission(): Promise<boolean> {
    if (!this.isAvailable()) return true;
    return GrandBandhanNotification.requestExactAlarmPermission();
  },

  async scheduleNotification(
    options: ScheduleNotificationOptions
  ): Promise<{ success: boolean; exact: boolean; id: string }> {
    if (!this.isAvailable()) {
      return { success: false, exact: false, id: options.id };
    }
    return GrandBandhanNotification.scheduleNotification(options);
  },

  async cancelNotification(id: string): Promise<boolean> {
    if (!this.isAvailable()) return true;
    return GrandBandhanNotification.cancelNotification(id);
  },

  async cancelAllNotifications(): Promise<boolean> {
    if (!this.isAvailable()) return true;
    return GrandBandhanNotification.cancelAllNotifications();
  },

  async getScheduledNotifications(): Promise<ScheduledNotificationRecord[]> {
    if (!this.isAvailable()) return [];
    return GrandBandhanNotification.getScheduledNotifications();
  },

  async displayNotification(options: DisplayNotificationOptions): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return GrandBandhanNotification.displayNotification(options);
  },

  async getInitialNotification(): Promise<{
    deepLinkUri?: string;
    notificationData?: string;
    notificationId?: number;
  } | null> {
    if (!this.isAvailable()) return null;
    return GrandBandhanNotification.getInitialNotification();
  },
};
