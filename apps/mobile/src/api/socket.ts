import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './endpoints';
import { SOCKET_EVENTS } from '@grand-bandhan/shared';
import { queryClient } from './queryClient';
import { getStoredAccessToken } from '../utils/storage';
import { useNotificationStore } from '../store/notificationStore';

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

    useNotificationStore.getState().addNotification({
      title: 'Task Status Updated',
      message: payload?.task?.title
        ? `Task "${payload.task.title}" has been updated.`
        : 'Wedding task progress was recorded.',
      type: 'TASK',
    });
  });

  socket.on(SOCKET_EVENTS.PAYMENT_RECORDED, (payload) => {
    console.log('[Socket] PAYMENT_RECORDED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['settlements'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });

    useNotificationStore.getState().addNotification({
      title: 'Payment Recorded ⚜️',
      message: payload?.payment?.amount
        ? `Escrow milestone payment of ₹${payload.payment.amount.toLocaleString('en-IN')} confirmed.`
        : 'New wedding milestone payment recorded.',
      type: 'PAYMENT',
    });
  });

  socket.on(SOCKET_EVENTS.EVENT_STATUS_CHANGED, (payload) => {
    console.log('[Socket] EVENT_STATUS_CHANGED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['timeline'] });

    useNotificationStore.getState().addNotification({
      title: 'Ceremony Radar Update',
      message: payload?.event?.name || payload?.event?.title
        ? `Ceremony "${payload.event.name || payload.event.title}" status changed.`
        : 'Day-of ceremony status updated.',
      type: 'INFO',
    });
  });

  socket.on(SOCKET_EVENTS.VENDOR_ARRIVAL_UPDATED, (payload) => {
    console.log('[Socket] VENDOR_ARRIVAL_UPDATED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['arrivals'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });

    useNotificationStore.getState().addNotification({
      title: 'Vendor Check-In Logged',
      message: payload?.vendorName
        ? `${payload.vendorName} has checked in on venue.`
        : 'Vendor arrival status updated on venue radar.',
      type: 'ARRIVAL',
    });
  });

  socket.on(SOCKET_EVENTS.SERVICE_VERIFICATION_TRIGGERED, (payload) => {
    console.log('[Socket] SERVICE_VERIFICATION_TRIGGERED received:', payload);
    queryClient.invalidateQueries({ queryKey: ['verifications'] });

    const verification = payload.verification || payload;
    useNotificationStore.getState().addNotification({
      title: 'Service Verification Triggered ⚠️',
      message: verification?.serviceName
        ? `Scheduled milestone "${verification.serviceName}" is awaiting confirmation.`
        : 'Service deliverable requires on-ground verification.',
      type: 'VERIFICATION',
    });

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
