'use client';

import { Order, OrderStatus, orderService } from '../services/orderService';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const handleAdvanceStatus = () => {
    const nextStatus = orderService.getNextStatus(order.status);
    if (nextStatus) {
      onUpdateStatus(order.id, nextStatus);
    }
  };

  const handleCancelOrder = () => {
    onUpdateStatus(order.id, 'CANCELLED');
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'CONFIRMED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'PREPARING':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'READY':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h11z" />
          </svg>
        );
      case 'COMPLETED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'CANCELLED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTimeElapsed = () => {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ${diffInMinutes % 60}m ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-lg">#{order.id.slice(-6)}</span>
            <span className={`status-badge ${orderService.getStatusColor(order.status)}`}>
              <span className="flex items-center space-x-1">
                {getStatusIcon(order.status)}
                <span>{orderService.getStatusDisplayName(order.status)}</span>
              </span>
            </span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-lg">{orderService.formatPrice(order.total)}</div>
            <div className="text-sm text-gray-500">{getTimeElapsed()}</div>
          </div>
        </div>
        
        {(order.user || order.customerName) && (
          <div className="text-sm text-gray-600">
            {order.user ? (
              <>
                {order.user.name && <span>{order.user.name} • </span>}
                <span>{order.user.phoneNumber}</span>
              </>
            ) : (
              <span>{order.customerName || 'Guest'}</span>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-4">
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">{item.product?.name || item.productId}</div>
                {item.customizations && item.customizations.length > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    {item.customizations.map((custom, i) => (
                      <span key={i} className="mr-2">
                        {custom.productCustomization.name}
                        {custom.productCustomization.price > 0 && ` (+${orderService.formatPrice(custom.productCustomization.price)})`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right ml-4">
                <div className="font-medium">×{item.quantity}</div>
                <div className="text-sm text-gray-500">{orderService.formatPrice(item.price)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          {orderService.canAdvanceStatus(order.status) && (
            <button
              onClick={handleAdvanceStatus}
              className="flex-1 btn-primary text-sm"
            >
              {orderService.getStatusDisplayName(orderService.getNextStatus(order.status)!)}
            </button>
          )}
          
          {orderService.canCancelOrder(order.status) && (
            <button
              onClick={handleCancelOrder}
              className="btn-danger text-sm px-4"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Created: {orderService.formatDateTime(order.createdAt)}
        </div>
      </div>
    </div>
  );
}
