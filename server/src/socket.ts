import { Server } from 'socket.io';
import { prisma } from './utils/prisma';
import { logger } from './utils/logger';
import { config } from './config';

let io: Server;

export const setupSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: config.frontendUrl, credentials: true }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(`user:${userId}`);
      socket.broadcast.emit('user:online', userId);
    }

    socket.on('join', (room: string) => {
      socket.join(room);
    });

    socket.on('typing:start', (data: { conversationId: string; userId: string; recipientId: string }) => {
      io.to(`user:${data.recipientId}`).emit('typing:start', data);
    });

    socket.on('typing:stop', (data: { conversationId: string; userId: string; recipientId: string }) => {
      io.to(`user:${data.recipientId}`).emit('typing:stop', data);
    });



    socket.on('disconnect', () => {
      if (userId) {
        socket.broadcast.emit('user:offline', userId);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
