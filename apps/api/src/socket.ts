import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { SOCKET_EVENTS } from '@grand-bandhan/shared';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer, allowedOrigins: string[]): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join wedding room for real-time updates
    socket.on(SOCKET_EVENTS.JOIN_WEDDING, (weddingId: string) => {
      socket.join(`wedding:${weddingId}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_WEDDING, (weddingId: string) => {
      socket.leave(`wedding:${weddingId}`);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastWeddingUpdate(weddingId: string, event: string, payload: any): void {
  if (io) {
    io.to(`wedding:${weddingId}`).emit(event, payload);
    io.emit(event, { weddingId, ...payload });
  }
}
