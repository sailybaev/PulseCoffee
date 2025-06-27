'use client';

import { OrderStatus } from '../services/orderService';

interface StatusFilterProps {
  selectedStatus: OrderStatus | 'ALL';
  onStatusChange: (status: OrderStatus | 'ALL') => void;
  orderCounts: Record<OrderStatus, number>;
}

export default function StatusFilter({ selectedStatus, onStatusChange, orderCounts }: StatusFilterProps) {
  const statuses: Array<{ key: OrderStatus | 'ALL'; label: string; color: string }> = [
    { key: 'ALL', label: 'All Orders', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
    { key: 'PENDING', label: 'Pending', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
    { key: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    { key: 'PREPARING', label: 'Preparing', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { key: 'READY', label: 'Ready', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { key: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
  ];

  const getCount = (status: OrderStatus | 'ALL') => {
    if (status === 'ALL') {
      return orderCounts.PENDING + orderCounts.CONFIRMED + orderCounts.PREPARING + orderCounts.READY + orderCounts.COMPLETED;
    }
    return orderCounts[status as OrderStatus];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status</h3>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const count = getCount(status.key);
          const isSelected = selectedStatus === status.key;
          
          return (
            <button
              key={status.key}
              onClick={() => onStatusChange(status.key)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${isSelected 
                  ? `${status.color} ring-2 ring-offset-2 ring-coffee-brown` 
                  : `${status.color.replace('hover:', '')} opacity-70 hover:opacity-100`
                }
              `}
            >
              {status.label} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
