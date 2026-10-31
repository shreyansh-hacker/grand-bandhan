import { apiClient } from '../api/client';
import { nativeNotification } from './nativeNotification';
import { ScheduleSyncResponse, SynchronizedScheduleItem } from '@grand-bandhan/shared';

const LAST_SYNC_KEY = 'gb_last_schedule_sync';

let inMemoryLastSync: string | null = null;
let isSyncing = false;

export const scheduleSyncService = {
  /**
   * Synchronize authoritative schedules from Render backend with local AlarmManager
   */
  async syncSchedules(): Promise<{
    success: boolean;
    scheduledCount: number;
    canceledCount: number;
    serverTime?: string;
    error?: string;
  }> {
    if (isSyncing) {
      return { success: true, scheduledCount: 0, canceledCount: 0 };
    }

    isSyncing = true;
    try {
      // 1. Fetch schedules from authoritative backend
      const queryParams = inMemoryLastSync ? `?since=${encodeURIComponent(inMemoryLastSync)}` : '';
      const response = await apiClient.get<ScheduleSyncResponse>(`/api/notifications/schedules${queryParams}`);
      const data = response.data;

      if (!data || !data.schedules) {
        return { success: false, scheduledCount: 0, canceledCount: 0, error: 'Invalid server response' };
      }

      const { schedules, canceledIds, serverTime } = data;
      let scheduledCount = 0;
      let canceledCount = 0;

      // 2. Cancel obsolete or completed schedules
      if (canceledIds && canceledIds.length > 0) {
        for (const cancelId of canceledIds) {
          await nativeNotification.cancelNotification(cancelId);
          canceledCount++;
        }
      }

      // 3. Inspect existing local alarms
      const existingAlarms = await nativeNotification.getScheduledNotifications();
      const existingMap = new Map<string, number>();
      existingAlarms.forEach((item) => {
        existingMap.set(item.id, item.timestampMs);
      });

      // 4. Register or update upcoming schedules
      const now = Date.now();
      for (const item of schedules) {
        const itemTimeMs = item.timestampMs || new Date(item.scheduledFor).getTime();

        // Skip events in the past
        if (itemTimeMs <= now) {
          continue;
        }

        // Avoid re-scheduling if unchanged timestamp is already armed
        const currentArmedTime = existingMap.get(item.id);
        if (currentArmedTime && Math.abs(currentArmedTime - itemTimeMs) < 1000) {
          continue;
        }

        await nativeNotification.scheduleNotification({
          id: item.id,
          title: item.title,
          message: item.message,
          timestampMs: itemTimeMs,
          channelId: item.channelId,
          deepLinkUri: item.deepLinkUri,
          dataJson: JSON.stringify({
            entityType: item.entityType,
            entityId: item.entityId,
            weddingId: item.weddingId,
            status: item.status,
          }),
        });
        scheduledCount++;
      }

      inMemoryLastSync = serverTime;
      return {
        success: true,
        scheduledCount,
        canceledCount,
        serverTime,
      };
    } catch (err: any) {
      console.warn('[ScheduleSync] Synchronization error:', err.message);
      return {
        success: false,
        scheduledCount: 0,
        canceledCount: 0,
        error: err.message,
      };
    } finally {
      isSyncing = false;
    }
  },

  /**
   * Reset sync state (e.g., upon user logout or account switch)
   */
  async clearSyncState(): Promise<void> {
    inMemoryLastSync = null;
    await nativeNotification.cancelAllNotifications();
  },
};
