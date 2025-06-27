export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
  };
  customizations?: Array<{
    id: string;
    productCustomizationId: string;
    productCustomization: {
      id: string;
      name: string;
      type: string;
      price: number;
    };
  }>;
}

export interface Order {
  id: string;
  branchId: string;
  userId?: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  customerName?: string; // For guest orders from tablets
  user?: {
    id: string;
    phoneNumber?: string;
    name?: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

class OrderService {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = typeof window !== 'undefined' 
      ? (window as any).__NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      : 'http://localhost:3000/api';
  }

  async getOrders(branchId: string, status?: OrderStatus): Promise<Order[]> {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔐 Auth token present:', !!token);
      console.log('🔐 Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Use the path parameter endpoint for authenticated requests
      let url = `${this.apiUrl}/orders/branch/${branchId}`;
      if (status) {
        url += `?status=${status}`;
      }

      console.log('📡 Making request to:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // If unauthorized, try to refresh token
        if (response.status === 401) {
          console.log('🔐 401 Unauthorized - attempting token refresh');
          const refreshed = await this.refreshTokenAndRetry();
          if (refreshed) {
            return this.getOrders(branchId, status); // Retry with new token
          }
          throw new Error('Authentication failed. Please log in again.');
        }
        
        // If the specific endpoint fails, try the query parameter version
        if (response.status === 404) {
          console.warn('📡 Path parameter endpoint not found, trying query parameter endpoint');
          let fallbackUrl = `${this.apiUrl}/orders/branch?branch=${branchId}`;
          if (status) {
            fallbackUrl += `&status=${status}`;
          }
          
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!fallbackResponse.ok) {
            throw new Error(`Failed to fetch orders: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
          }
          
          return await fallbackResponse.json();
        }
        
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.apiUrl}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.apiUrl}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  private async refreshTokenAndRetry(): Promise<boolean> {
    try {
      const currentToken = localStorage.getItem('auth_token');
      if (!currentToken) return false;

      const response = await fetch(`${this.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { access_token } = await response.json();
        localStorage.setItem('auth_token', access_token);
        console.log('🔐 Token refreshed successfully');
        return true;
      }
      
      console.log('🔐 Token refresh failed:', response.status);
      return false;
    } catch (error) {
      console.error('🔐 Token refresh error:', error);
      return false;
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDisplayName(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PREPARING':
        return 'Preparing';
      case 'READY':
        return 'Ready';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    switch (currentStatus) {
      case 'PENDING':
        return 'CONFIRMED';
      case 'CONFIRMED':
        return 'PREPARING';
      case 'PREPARING':
        return 'READY';
      case 'READY':
        return 'COMPLETED';
      default:
        return null;
    }
  }

  canAdvanceStatus(status: OrderStatus): boolean {
    return this.getNextStatus(status) !== null;
  }

  canCancelOrder(status: OrderStatus): boolean {
    const cancellableStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING'];
    return cancellableStatuses.indexOf(status) !== -1;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  }
}

export const orderService = new OrderService();
