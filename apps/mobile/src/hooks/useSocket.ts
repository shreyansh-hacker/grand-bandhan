import { useState, useEffect, useCallback } from 'react';
import {
  initSocket,
  disconnectSocket,
  onSocketStatusChange,
  joinWedding as joinWeddingRoom,
  leaveWedding as leaveWeddingRoom,
  SocketStatus,
  getSocketStatus,
} from '../api/socket';
import { useAuthStore } from '../store/authStore';

export function useSocket() {
  const [status, setStatus] = useState<SocketStatus>(getSocketStatus());
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onSocketStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    if (isAuthenticated) {
      initSocket(accessToken || undefined);
    } else {
      disconnectSocket();
    }

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, accessToken]);

  const joinWedding = useCallback((weddingId: string) => {
    joinWeddingRoom(weddingId);
  }, []);

  const leaveWedding = useCallback((weddingId: string) => {
    leaveWeddingRoom(weddingId);
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    joinWedding,
    leaveWedding,
  };
}
