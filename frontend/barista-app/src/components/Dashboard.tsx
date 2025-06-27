'use client';

import { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { orderService, Order, OrderStatus } from '../services/orderService';
import { webSocketService } from '../services/webSocketService';
import { audioService } from '../services/audioService';
import OrderCard from './OrderCard';
import StatusFilter from './StatusFilter';
import LoadingSpinner from './LoadingSpinner';
import ConnectionStatus from './ConnectionStatus';

interface DashboardProps {
  branchId: string;
  onLogout: () => void;
  onError: (error: string) => void;
}

export default function Dashboard({ branchId, onLogout, onError }: DashboardProps) {
  const { state, actions } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  useEffect(() => {
    if (!initializationRef.current) {
      initializationRef.current = true;
      initializeDashboard();
    }
    return () => {
      console.log('🧹 Dashboard cleanup - disconnecting WebSocket...');
      webSocketService.disconnect();
      initializationRef.current = false;
    };
  }, [branchId]);

  const initializeDashboard = async () => {
    try {
      console.log('🚀 Starting dashboard initialization...');
      actions.setLoading(true);
      
      // Set user data
      console.log('👤 Setting user data...');
      const user = authService.getUser();
      if (user) {
        actions.setUser(user);
        console.log('✅ User data set:', user);
      } else {
        console.warn('⚠️ No user data found');
      }

      // Set branch data (you might want to fetch branch name from API)
      console.log('🏢 Setting branch data...');
      actions.setBranch(branchId, `Branch ${branchId}`);
      console.log('✅ Branch data set:', branchId);

      // Load initial orders
      console.log('📦 Loading initial orders...');
      await loadOrders();
      console.log('✅ Orders loaded successfully');

      // Setup WebSocket connection with fresh token
      console.log('🔌 Setting up WebSocket connection...');
      let token = authService.getToken();
      if (token) {
        console.log('🔑 Token found, validating...');
        // Validate and refresh token if needed
        const isValid = await authService.validateToken();
        if (!isValid) {
          console.error('❌ Token validation failed');
          throw new Error('Authentication failed - please log in again');
        }
        console.log('✅ Token validation successful');
        
        // Get the potentially refreshed token
        token = authService.getToken();
        
        // Only connect if not already connected
        if (!webSocketService.isConnected()) {
          console.log('🔌 Connecting to WebSocket...');
          webSocketService.connect(branchId, token!, {
            onNewOrder: handleNewOrder,
            onOrderStatusUpdate: handleOrderStatusUpdate,
            onConnectionChange: actions.setConnectionStatus,
            onError: onError,
          });
          console.log('✅ WebSocket connection initiated');
        } else {
          console.log('🔌 WebSocket already connected, skipping connection');
        }
      } else {
        console.error('❌ No authentication token found');
        throw new Error('No authentication token found');
      }

      setIsInitialized(true);
      console.log('🎉 Dashboard initialization completed successfully');
    } catch (error) {
      console.error('💥 Dashboard initialization error:', error);
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        branchId,
        hasToken: !!authService.getToken(),
        hasUser: !!authService.getUser()
      });
      onError(`Failed to initialize dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      actions.setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      console.log('📦 Fetching orders for branch:', branchId);
      const orders = await orderService.getOrders(branchId);
      console.log('📦 Orders fetched:', orders);
      actions.setOrders(orders);
    } catch (error) {
      console.error('💥 Error loading orders:', error);
      console.error('💥 Order loading error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        branchId,
        hasToken: !!authService.getToken()
      });
      throw error; // Re-throw to be caught by initializeDashboard
    }
  };

  const handleNewOrder = async (order: Order) => {
    actions.addOrder(order);
    await audioService.playNewOrderSound();
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Order Received!', {
        body: `Order #${order.id.slice(-6)} - ${orderService.formatPrice(order.total)}`,
        icon: '/favicon.ico',
        tag: `order-${order.id}`,
      });
    }
  };

  const handleOrderStatusUpdate = async (data: { orderId: string; status: string }) => {
    actions.updateOrder(data.orderId, { status: data.status as OrderStatus });
    await audioService.playStatusUpdateSound();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      actions.updateOrder(orderId, updatedOrder);
      
      if (newStatus === 'COMPLETED') {
        await audioService.playCompletionSound();
      } else {
        await audioService.playStatusUpdateSound();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      onError('Failed to update order status');
      await audioService.playErrorSound();
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const filteredOrders = state.orders.filter(order => {
    if (selectedStatus === 'ALL') return true;
    return order.status === selectedStatus;
  });

  const getOrdersByStatus = (status: OrderStatus) => {
    return state.orders.filter(order => order.status === status);
  };

  const orderCounts = {
    PENDING: getOrdersByStatus('PENDING').length,
    CONFIRMED: getOrdersByStatus('CONFIRMED').length,
    PREPARING: getOrdersByStatus('PREPARING').length,
    READY: getOrdersByStatus('READY').length,
    COMPLETED: getOrdersByStatus('COMPLETED').length,
    CANCELLED: getOrdersByStatus('CANCELLED').length,
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-coffee-brown rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Barista Dashboard</h1>
                <p className="text-sm text-gray-600">{state.branchName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ConnectionStatus isConnected={state.isConnected} />
              
              <button
                onClick={requestNotificationPermission}
                className="btn-secondary text-sm"
                title="Enable notifications"
              >
                🔔
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {state.user?.name || state.user?.phoneNumber}
                </span>
                <button
                  onClick={onLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Status Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{orderCounts.PENDING}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{orderCounts.CONFIRMED}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{orderCounts.PREPARING}</div>
            <div className="text-sm text-gray-600">Preparing</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{orderCounts.READY}</div>
            <div className="text-sm text-gray-600">Ready</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{orderCounts.COMPLETED}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Status Filter */}
        <StatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          orderCounts={orderCounts}
        />

        {/* Orders Grid */}
        {state.isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'ALL' 
                ? 'No orders available at the moment'
                : `No ${selectedStatus.toLowerCase()} orders`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateOrderStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
