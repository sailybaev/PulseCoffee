'use client';

import { CartProvider } from '../context/CartContext';
import { MenuProvider, useMenu } from '../context/MenuContext';
import MainKioskScreen from '../components/MainKioskScreenFixed';
import PerformanceMonitor from '../components/PerformanceMonitor';
import { Loader2 } from 'lucide-react';
import config from '../config';

function TabletOrderingApp() {
  const { loading, error } = useMenu();

  // Show loading screen while menu data is being fetched
  if (loading) {
    return (
      <div className="tablet-app flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 size={48} className="text-[#ED6F44] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading Menu...</h2>
          <p className="text-gray-600">Please wait while we prepare your menu</p>
        </div>
      </div>
    );
  }

  // Show error screen if menu data failed to load
  if (error) {
    return (
      <div className="tablet-app flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Menu Unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-[#ED6F44] text-white rounded-lg hover:bg-[#D5613D] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tablet-app">
      <MainKioskScreen />
      {/* Show performance monitor in development */}
      {config.DEVELOPMENT.DEBUG && <PerformanceMonitor />}
    </div>
  );
}

export default function Home() {
  return (
    <MenuProvider>
      <CartProvider>
        <TabletOrderingApp />
      </CartProvider>
    </MenuProvider>
  );
}
