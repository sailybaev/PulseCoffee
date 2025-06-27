'use client';

import { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { useCacheInfo } from '../hooks/useCacheInfo';
import { Monitor, X, RefreshCw, Trash2 } from 'lucide-react';

interface PerformanceMonitorProps {
  className?: string;
}

export default function PerformanceMonitor({ className = '' }: PerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { products, allCustomizations, loading, refreshMenuData } = useMenu();
  const { cacheInfo, clearCache, formatCacheAge } = useCacheInfo();

  const totalCustomizations = Array.from(allCustomizations.values()).reduce(
    (total, customizations) => total + customizations.length,
    0
  );

  const handleRefresh = async () => {
    await refreshMenuData();
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50 ${className}`}
        title="Performance Monitor"
      >
        <Monitor size={20} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm z-50 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Monitor size={16} />
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Menu Data Stats */}
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Menu Data</h4>
          <div className="text-gray-600 space-y-1">
            <div>Products: {products.length}</div>
            <div>Customizations: {totalCustomizations}</div>
            <div className={`${loading ? 'text-orange-600' : 'text-green-600'}`}>
              Status: {loading ? 'Loading...' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Cache Status */}
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Cache Status</h4>
          <div className="text-gray-600 space-y-1">
            <div className={cacheInfo.hasCache ? 'text-green-600' : 'text-red-600'}>
              Cache: {cacheInfo.hasCache ? 'Active' : 'None'}
            </div>
            {cacheInfo.hasCache && (
              <>
                <div className={cacheInfo.isExpired ? 'text-orange-600' : 'text-green-600'}>
                  Age: {formatCacheAge(cacheInfo.cacheAge)}
                </div>
                <div className={cacheInfo.isExpired ? 'text-orange-600' : 'text-green-600'}>
                  {cacheInfo.isExpired ? 'Expired' : 'Fresh'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={clearCache}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 flex items-center justify-center gap-1"
            >
              <Trash2 size={12} />
              Clear Cache
            </button>
          </div>
        </div>

        {/* Network Info */}
        <div className="text-xs text-gray-500">
          <div>Last load: {cacheInfo.hasCache ? 'From cache' : 'From network'}</div>
        </div>
      </div>
    </div>
  );
}
