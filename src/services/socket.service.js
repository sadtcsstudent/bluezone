import { io } from 'socket.io-client';

const getSocketBase = () => {
  const apiBase = import.meta.env.VITE_API_URL;
  if (apiBase && apiBase.startsWith('http')) {
    return apiBase.replace(/\/api\/?$/, '');
  }

  // Development fallback: if running on standard local port, connect directly to API port
  // This bypasses the Vite proxy which can sometimes cause WebSocket issues
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    return 'http://localhost:4000';
  }

  return window.location.origin;
};

class SocketService {
  constructor() {
    this.socket = null;
    this.pendingListeners = [];
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

    // Attach pending listeners
    this.pendingListeners.forEach(({ event, callback }) => {
      this.socket.on(event, callback);
    });
    this.pendingListeners = [];
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
    } else {
      // Optional: queue emits if needed, but for now we prioritize listeners
      console.warn('Socket not connected, cannot emit', event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      this.pendingListeners.push({ event, callback });
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
    // Also remove from pending if present
    this.pendingListeners = this.pendingListeners.filter(l => l.event !== event);
  }
}

export const socketService = new SocketService();
