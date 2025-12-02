import { io } from 'socket.io-client';

const getSocketBase = () => {
  const apiBase = import.meta.env.VITE_API_URL;
  if (apiBase && apiBase.startsWith('http')) {
    return apiBase.replace(/\/api$/, '');
  }
  return window.location.origin;
};

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket) return;

    this.socket = io(getSocketBase(), {
      path: '/socket.io',
      query: { userId },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
