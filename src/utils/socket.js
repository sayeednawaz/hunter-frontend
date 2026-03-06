import { io } from 'socket.io-client';

// Custom hook for using socket in components
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      if (userId) {
        this.joinRoom(userId);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect if server disconnected
        this.socket.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      if (userId) {
        this.joinRoom(userId);
      }
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Join user room
  joinRoom(userId) {
    if (this.socket) {
      this.socket.emit('join-room', userId);
    }
  }

  // Send message
  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send-message', messageData);
    }
  }

  // Typing indicator
  sendTyping(data) {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  // Mark messages as read
  markAsRead(data) {
    if (this.socket) {
      this.socket.emit('mark-read', data);
    }
  }

  // Add event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  // Remove event listener
  off(event) {
    if (this.socket) {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get socket id
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      socketRef.current = socketService;
      socketService.connect(user.id);

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [user]);

  return socketRef.current;
};

// Socket event constants
export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  SEND_MESSAGE: 'send-message',
  RECEIVE_MESSAGE: 'receive-message',
  TYPING: 'typing',
  USER_TYPING: 'user-typing',
  MARK_READ: 'mark-read',
  MESSAGES_READ: 'messages-read',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect'
};

// Helper functions for socket events
export const emitJoinRoom = (userId) => {
  socketService.joinRoom(userId);
};

export const emitSendMessage = (messageData) => {
  socketService.sendMessage(messageData);
};

export const emitTyping = (data) => {
  socketService.sendTyping(data);
};

export const emitMarkRead = (data) => {
  socketService.markAsRead(data);
};

export const onReceiveMessage = (callback) => {
  socketService.on(SOCKET_EVENTS.RECEIVE_MESSAGE, callback);
  return () => socketService.off(SOCKET_EVENTS.RECEIVE_MESSAGE);
};

export const onUserTyping = (callback) => {
  socketService.on(SOCKET_EVENTS.USER_TYPING, callback);
  return () => socketService.off(SOCKET_EVENTS.USER_TYPING);
};

export const onMessagesRead = (callback) => {
  socketService.on(SOCKET_EVENTS.MESSAGES_READ, callback);
  return () => socketService.off(SOCKET_EVENTS.MESSAGES_READ);
};