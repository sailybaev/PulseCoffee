import axios from 'axios';
import { Order } from '../types';
import { BranchConfig } from './branchService';

// This should match your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  imageUrl?: string;
}

export interface ApiCustomization {
  id: string;
  type: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface CreateOrderRequest {
  customerName: string;
  branchId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    customizations: {
      productCustomizationId: string;
    }[];
  }[];
  total: number;
  paymentMethod: 'QR' | 'CARD';
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
  deviceId?: string; // Add device tracking
}

export interface ApiOrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

class ApiService {
  // Get all products (public endpoint)
  async getProducts(): Promise<ApiProduct[]> {
    try {
      const response = await api.get('/products/public');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  // Get products by category (public endpoint)
  async getProductsByCategory(category: string): Promise<ApiProduct[]> {
    try {
      const response = await api.get(`/products/public?category=${category}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      throw error;
    }
  }

  // Get product customizations (public endpoint)
  async getProductCustomizations(productId: string): Promise<ApiCustomization[]> {
    try {
      const response = await api.get(`/products/public/${productId}/customizations`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product customizations:', error);
      throw error;
    }
  }

  // Create a public order with automatic branch assignment
  async createPublicOrder(orderData: Omit<CreateOrderRequest, 'branchId' | 'deviceId'>): Promise<ApiOrderResponse> {
    try {
      const branchId = BranchConfig.getBranchId();
      console.log('Creating order - Branch ID:', branchId);
      
      if (!branchId) {
        console.error('No branch ID found in storage');
        throw new Error('Branch not configured');
      }

      const deviceId = BranchConfig.getDeviceId();
      console.log('Creating order - Device ID:', deviceId);
      
      const completeOrderData: CreateOrderRequest = {
        ...orderData,
        branchId,
        deviceId
      };

      console.log('Sending order data:', completeOrderData);
      console.log('API URL:', `${API_BASE_URL}/orders/public`);

      const response = await api.post('/orders/public', completeOrderData);
      console.log('Order creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Request config:', error.config);
      }
      throw error;
    }
  }

  // Get orders for current branch only
  async getOrdersForCurrentBranch(status?: string): Promise<ApiOrderResponse[]> {
    try {
      const branchId = BranchConfig.getBranchId();
      if (!branchId) {
        throw new Error('Branch not configured');
      }

      const params = new URLSearchParams();
      params.append('branch', branchId);
      if (status) {
        params.append('status', status);
      }

      const response = await api.get(`/orders/branch?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch branch orders:', error);
      throw error;
    }
  }

  // Get products for current branch (if branch-specific products exist)
  async getProductsForCurrentBranch(): Promise<ApiProduct[]> {
    try {
      const branchId = BranchConfig.getBranchId();
      if (!branchId) {
        return this.getProducts(); // Fallback to all products
      }

      const response = await api.get(`/products/branch/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch branch products, falling back to all products:', error);
      return this.getProducts(); // Fallback to all products
    }
  }

  // Validate branch access
  async validateBranchAccess(): Promise<boolean> {
    try {
      const branchId = BranchConfig.getBranchId();
      const deviceId = BranchConfig.getDeviceId();
      
      if (!branchId || !deviceId) {
        return false;
      }

      const response = await api.post('/devices/validate', {
        branchId,
        deviceId
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Branch access validation failed:', error);
      return false;
    }
  }

  // Get branches (you might need this for multi-location support)
  async getBranches() {
    try {
      const response = await api.get('/branches');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
