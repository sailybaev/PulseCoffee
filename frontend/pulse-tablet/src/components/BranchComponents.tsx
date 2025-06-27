'use client';

import React, { useState } from 'react';
import { useBranch } from '../hooks/useBranch';

// Example component showing how to integrate branch info into your order flow
export function BranchOrderHeader() {
  const { branchInfo, isLoading } = useBranch();

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm p-4 mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!branchInfo) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 mb-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-800">
            {branchInfo.name}
          </h2>
          <p className="text-sm text-amber-600">{branchInfo.address}</p>
        </div>
        <div className="flex items-center text-amber-700">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">Активный филиал</span>
        </div>
      </div>
    </div>
  );
}

// Example of how to modify your existing order form to use branch-aware API
export function BranchAwareOrderForm() {
  const { branchId, isValidBranch } = useBranch();

  const handleSubmitOrder = async (orderData: any) => {
    if (!isValidBranch || !branchId) {
      throw new Error('Branch not configured');
    }

    try {
      // Import API service dynamically to avoid SSR issues
      const { apiService } = await import('../services/api');
      
      // The API service will automatically add branchId and deviceId
      const result = await apiService.createPublicOrder(orderData);
      
      console.log('Order created for branch:', branchId, result);
      return result;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Your existing order form components */}
      <div className="text-sm text-gray-600">
        Заказ будет оформлен для филиала: {branchId}
      </div>
      
      {/* Form submission should use handleSubmitOrder */}
    </div>
  );
}

// Example admin component for emergency branch unlock
export function EmergencyBranchUnlock() {
  const [showUnlock, setShowUnlock] = useState(false);
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      const { BranchInitializer } = await import('../services/branchService');
      const success = await BranchInitializer.adminUnlock(password);
      
      if (success) {
        alert('Планшет разблокирован. Страница будет перезагружена.');
        window.location.reload();
      } else {
        alert('Неверный пароль');
      }
    } catch (error) {
      alert('Ошибка разблокировки');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Hidden trigger - click 10 times in top-left corner
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 9) {
      setShowUnlock(true);
      setClickCount(0);
    }
    
    // Reset counter after 5 seconds
    setTimeout(() => setClickCount(0), 5000);
  };

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-16 h-16 z-50"
        onClick={handleSecretClick}
      />
      
      {showUnlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Аварийная разблокировка</h3>
            <input
              type="password"
              placeholder="Пароль администратора"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleUnlock}
                disabled={isUnlocking || !password}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {isUnlocking ? 'Разблокировка...' : 'Разблокировать'}
              </button>
              <button
                onClick={() => setShowUnlock(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
