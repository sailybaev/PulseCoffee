'use client';

import { useState, useEffect } from 'react';

interface CacheInfo {
  hasCache: boolean;
  cacheTimestamp: number | null;
  cacheAge: number;
  isExpired: boolean;
}

export const useCacheInfo = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    hasCache: false,
    cacheTimestamp: null,
    cacheAge: 0,
    isExpired: true,
  });

  const updateCacheInfo = () => {
    const timestamp = localStorage.getItem('pulse_tablet_cache_timestamp');
    const hasProducts = localStorage.getItem('pulse_tablet_products');
    const hasCustomizations = localStorage.getItem('pulse_tablet_customizations');
    
    const hasCache = !!(timestamp && hasProducts && hasCustomizations);
    const cacheTimestamp = timestamp ? parseInt(timestamp, 10) : null;
    const cacheAge = cacheTimestamp ? Date.now() - cacheTimestamp : 0;
    const isExpired = cacheAge > 5 * 60 * 1000; // 5 minutes

    setCacheInfo({
      hasCache,
      cacheTimestamp,
      cacheAge,
      isExpired,
    });
  };

  useEffect(() => {
    updateCacheInfo();
    
    // Update cache info every 30 seconds
    const interval = setInterval(updateCacheInfo, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const clearCache = () => {
    localStorage.removeItem('pulse_tablet_products');
    localStorage.removeItem('pulse_tablet_customizations');
    localStorage.removeItem('pulse_tablet_cache_timestamp');
    updateCacheInfo();
  };

  const formatCacheAge = (ageMs: number): string => {
    const minutes = Math.floor(ageMs / 60000);
    const seconds = Math.floor((ageMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  return {
    cacheInfo,
    clearCache,
    formatCacheAge,
    updateCacheInfo,
  };
};
