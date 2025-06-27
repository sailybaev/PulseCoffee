import { io, Socket } from 'socket.io-client';
import { Order } from './orderService';
import { authService } from './authService';

export interface WebSocketEventHandlers {
  onNewOrder?: (order: Order) => void;
  onOrderStatusUpdate?: (data: { orderId: string; status: string }) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private branchId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: WebSocketEventHandlers = {};
  private tokenRefreshInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  connect(branchId: string, token: string, handlers: WebSocketEventHandlers = {}): void {
    console.log('🔌 WebSocket connecting...', { branchId, hasToken: !!token });
    
    // If already connected to the same branch, just update handlers
    if (this.socket && this.socket.connected && this.branchId === branchId) {
      console.log('🔌 Already connected to same branch, updating handlers only');
      this.eventHandlers = { ...this.eventHandlers, ...handlers };
      return;
    }
    
    this.branchId = branchId;
    this.eventHandlers = handlers;

    if (this.socket) {
      console.log('🔌 Disconnecting existing connection...');
      this.disconnect();
    }

    const apiUrl = typeof window !== 'undefined' 
      ? (window as any).__NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      : 'http://localhost:3000';

    console.log('🔌 WebSocket URL:', apiUrl);
    console.log('🔑 WebSocket token (first 20 chars):', token?.substring(0, 20) + '...');

    this.socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      forceNew: true,
      timeout: 5000,
    });

    this.setupEventListeners();
    this.setupReconnection();
    this.setupPageVisibilityHandling();
    this.setupTokenRefresh();
  }

  private setupTokenRefresh(): void {
    // Refresh token every 10 minutes (tokens expire in 15 minutes)
    this.tokenRefreshInterval = setInterval(async () => {
      if (this.socket && this.socket.connected) {
        console.log('🔄 Refreshing WebSocket token...');
        try {
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            console.log('✅ Token refreshed successfully');
            // Reconnect with new token
            const newToken = authService.getToken();
            if (newToken && this.branchId) {
              this.connect(this.branchId, newToken, this.eventHandlers);
            }
          } else {
            console.error('❌ Failed to refresh token');
            this.eventHandlers.onError?.('Session expired - please log in again');
          }
        } catch (error) {
          console.error('❌ Token refresh error:', error);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.eventHandlers.onConnectionChange?.(true);
      
      if (this.branchId) {
        this.joinBaristaRoom(this.branchId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.eventHandlers.onConnectionChange?.(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 WebSocket connection error:', error);
      console.error('🚨 Error details:', {
        message: error.message,
        stack: error.stack
      });
      this.eventHandlers.onError?.(`Connection error: ${error.message}`);
    });

    this.socket.on('newOrder', (order: Order) => {
      console.log('New order received:', order);
      this.eventHandlers.onNewOrder?.(order);
    });

    this.socket.on('orderStatusUpdate', (data: { orderId: string; status: string }) => {
      console.log('Order status update received:', data);
      this.eventHandlers.onOrderStatusUpdate?.(data);
    });

    this.socket.on('joinedBaristaRoom', (data: { branchId: string; success: boolean }) => {
      console.log('🏠 Joined barista room result:', data);
      if (!data.success) {
        this.eventHandlers.onError?.('Failed to join barista room');
      }
    });
  }

  private setupReconnection(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.socket?.connect();
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
      } else {
        this.eventHandlers.onError?.('Maximum reconnection attempts reached');
      }
    });
  }

  private setupPageVisibilityHandling(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible' && this.socket && !this.socket.connected) {
      console.log('Page became visible, reconnecting...');
      this.socket.connect();
    }
  }

  private joinBaristaRoom(branchId: string): void {
    if (this.socket && this.socket.connected) {
      console.log('🏠 Joining barista room for branch:', branchId);
      this.socket.emit('joinBaristaRoom', branchId);
    } else {
      console.warn('⚠️ Cannot join barista room - socket not connected');
    }
  }

  disconnect(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }

    if (this.socket) {
      if (this.branchId) {
        this.socket.emit('leaveBaristaRoom', this.branchId);
      }
      this.socket.disconnect();
      this.socket = null;
    }

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.branchId = null;
    this.eventHandlers = {};
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  updateHandlers(handlers: WebSocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }
}

export const webSocketService = new WebSocketService();
