import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './endpoints';
import { SOCKET_EVENTS } from '@grand-bandhan/shared';
import { queryClient } from './queryClient';
import { getStoredAccessToken } from '../utils/storage';
import { useNotificationStore } from '../store/notificationStore';
import { useInboxStore } from '../store/inboxStore';
import { useBannerStore } from '../store/bannerStore';
import { scheduleSyncService } from '../services/scheduleSync';
import { nativeNotification } from '../services/nativeNotification';

export type SocketStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

type StatusListener = (status: SocketStatus) => void;
type VerificationListener = (data: any) => void;

let socket: Socket | null = null;
let currentStatus: SocketStatus = 'disconnected';
const statusListeners = new Set<StatusListener>();
const verificationListeners = new Set<VerificationListener>();
let activeWeddingId: string | null = null;

function notifyStatus(status: SocketStatus) {
  currentStatus = status;
  statusListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (err) {
      console.warn('[Socket] Error in status listener:', err);
    }
  });
}

/**
 * Initialize Socket.IO connection with Render backend
 */
export async function initSocket(explicitToken?: string): Promise<Socket> {
  if (socket?.connected) {
    return socket;
  }

  const token = explicitToken || (await getStoredAccessToken());

  notifyStatus('connecting');

  socket = io(API_BASE_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: {
      token: token ? `Bearer ${token}` : undefined,
    },
    extraHeaders: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  socket.on('connect', () => {
    notifyStatus('connected');
    console.log('[Socket] Connected to Grand Bandhan live server:', socket?.id);

    // Rejoin active wedding room if previously set
    if (activeWeddingId) {
      socket?.emit(SOCKET_EVENTS.JOIN_WEDDING, activeWeddingId);
    }

    // Phase 3 & 4: Reconcile authoritative schedules and refresh inbox upon connection
    scheduleSyncService.syncSchedules().catch((e) =>
      console.warn('[Socket] Schedule sync on connect error:', e.message)
    );
    useInboxStore.getState().fetchUnreadCount().catch(() => {});
  });

  socket.on('disconnect', (reason) => {
    notifyStatus('disconnected');
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    notifyStatus('error');
    console.warn('[Socket] Connection error:', error.message);
  });

  // Bind Real-Time Cache Invalidations and Notification Dispatch
  socket.on(SOCKET_EVENTS.TASK_STATUS_UPDATED, (payload) => {
    console.log('[Socket] TASK_STATUS_UPDATED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['weddings'] });

    const title = 'Task Status Updated';
    const message = payload?.task?.title
      ? `Task "${payload.task.title}" has been updated.`
      : 'Wedding task progress was recorded.';

    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'TASK',
    });

    useBannerStore.getState().showBanner({
      title,
      message,
      type: 'TASK',
      data: payload?.task,
    });

    nativeNotification.displayNotification({
      id: `task_${payload?.task?.id || Date.now()}`,
      title,
      message,
      channelId: 'gb_general',
      deepLinkUri: 'grandbandhan://tasks',
      dataJson: JSON.stringify(payload?.task),
    }).catch(() => {});
  });

  socket.on(SOCKET_EVENTS.PAYMENT_RECORDED, (payload) => {
    console.log('[Socket] PAYMENT_RECORDED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['settlements'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });

    const title = 'Payment Recorded ⚜️';
    const message = payload?.payment?.amount
      ? `Escrow milestone payment of ₹${payload.payment.amount.toLocaleString('en-IN')} confirmed.`
      : 'New wedding milestone payment recorded.';

    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'PAYMENT',
    });

    useBannerStore.getState().showBanner({
      title,
      message,
      type: 'PAYMENT',
      data: payload?.payment,
    });

    nativeNotification.displayNotification({
      id: `payment_${payload?.payment?.id || Date.now()}`,
      title,
      message,
      channelId: 'gb_payments',
      deepLinkUri: 'grandbandhan://payments',
      dataJson: JSON.stringify(payload?.payment),
    }).catch(() => {});
  });

  socket.on(SOCKET_EVENTS.EVENT_STATUS_CHANGED, (payload) => {
    console.log('[Socket] EVENT_STATUS_CHANGED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['timeline'] });

    const title = 'Ceremony Radar Update';
    const message = payload?.event?.name || payload?.event?.title
      ? `Ceremony "${payload.event.name || payload.event.title}" status changed.`
      : 'Day-of ceremony status updated.';

    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'INFO',
    });

    useBannerStore.getState().showBanner({
      title,
      message,
      type: 'INFO',
      data: payload?.event,
    });

    nativeNotification.displayNotification({
      id: `event_${payload?.event?.id || Date.now()}`,
      title,
      message,
      channelId: 'gb_milestones',
      deepLinkUri: 'grandbandhan://timeline',
      dataJson: JSON.stringify(payload?.event),
    }).catch(() => {});
  });

  socket.on(SOCKET_EVENTS.VENDOR_ARRIVAL_UPDATED, (payload) => {
    console.log('[Socket] VENDOR_ARRIVAL_UPDATED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['arrivals'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });

    const title = 'Vendor Check-In Logged';
    const message = payload?.vendorName
      ? `${payload.vendorName} has checked in on venue.`
      : 'Vendor arrival status updated on venue radar.';

    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'ARRIVAL',
    });

    useBannerStore.getState().showBanner({
      title,
      message,
      type: 'ARRIVAL',
      data: payload,
    });

    nativeNotification.displayNotification({
      id: `arrival_${payload?.vendorId || Date.now()}`,
      title,
      message,
      channelId: 'gb_milestones',
      deepLinkUri: 'grandbandhan://timeline',
      dataJson: JSON.stringify(payload),
    }).catch(() => {});
  });

  socket.on(SOCKET_EVENTS.SERVICE_VERIFICATION_TRIGGERED, (payload) => {
    console.log('[Socket] SERVICE_VERIFICATION_TRIGGERED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['verifications'] });

    const verification = payload.verification || payload;
    const title = 'Service Verification Triggered ⚠️';
    const message = verification?.serviceName
      ? `Scheduled milestone "${verification.serviceName}" is awaiting confirmation.`
      : 'Service deliverable requires on-ground verification.';

    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'VERIFICATION',
    });

    useBannerStore.getState().showBanner({
      title,
      message,
      type: 'VERIFICATION',
      data: verification,
    });

    // Pinned Android system notification in notification center
    nativeNotification.displayNotification({
      id: `verif_${verification?.id || Date.now()}`,
      title,
      message,
      channelId: 'gb_verifications',
      deepLinkUri: 'grandbandhan://verifications',
      dataJson: JSON.stringify(verification),
    }).catch(() => {});

    verificationListeners.forEach((listener) => {
      try {
        listener(verification);
      } catch (err) {
        console.warn('[Socket] Error in verification listener:', err);
      }
    });
  });

  socket.on(SOCKET_EVENTS.SERVICE_VERIFICATION_UPDATED, (payload) => {
    console.log('[Socket] SERVICE_VERIFICATION_UPDATED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['verifications'] });
  });

  socket.on(SOCKET_EVENTS.NOTIFICATION_RECEIVED, (payload) => {
    console.log('[Socket] NOTIFICATION_RECEIVED:', payload);
    if (payload?.notification) {
      useInboxStore.getState().addRealtimeNotification(payload.notification);
      useBannerStore.getState().showBanner({
        title: payload.notification.title || 'Grand Bandhan Alert',
        message: payload.notification.message || 'New notification received.',
        type: 'INFO',
        data: payload.notification,
      });

      nativeNotification.displayNotification({
        id: `notif_${payload.notification.id || Date.now()}`,
        title: payload.notification.title || 'Grand Bandhan Alert',
        message: payload.notification.message || 'New notification received.',
        channelId: 'gb_general',
        deepLinkUri: payload.notification.deepLinkUri || 'grandbandhan://notifications',
        dataJson: JSON.stringify(payload.notification),
      }).catch(() => {});
    }
  });

  return socket;
}

/**
 * Disconnect Socket.IO cleanly
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    notifyStatus('disconnected');
    activeWeddingId = null;
  }
}

/**
 * Join wedding room for targeted wedding broadcasts
 */
export function joinWedding(weddingId: string): void {
  activeWeddingId = weddingId;
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.JOIN_WEDDING, weddingId);
    console.log('[Socket] Joined wedding room:', weddingId);
  }
}

/**
 * Leave wedding room
 */
export function leaveWedding(weddingId: string): void {
  if (activeWeddingId === weddingId) {
    activeWeddingId = null;
  }
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.LEAVE_WEDDING, weddingId);
    console.log('[Socket] Left wedding room:', weddingId);
  }
}

/**
 * Subscribe to Socket connection status changes
 */
export function onSocketStatusChange(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(currentStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

/**
 * Subscribe to incoming Service Verification popups
 */
export function onServiceVerificationTrigger(listener: VerificationListener): () => void {
  verificationListeners.add(listener);
  return () => {
    verificationListeners.delete(listener);
  };
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Get current socket status
 */
export function getSocketStatus(): SocketStatus {
  return currentStatus;
}
