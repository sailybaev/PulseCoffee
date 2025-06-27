'use client';

import React, { useState, useEffect } from 'react';
import { BranchInitializer, BranchConfig, BranchValidator } from '../services/branchService';
import type { Branch } from '../services/branchService';

interface BranchGuardProps {
  children: React.ReactNode;
}

interface BranchSetupProps {
  onBranchConfigured: () => void;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Инициализация планшета...</p>
      </div>
    </div>
  );
}

function BranchSetupError({ error, onRetry }: { error: string; onRetry: () => void }) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleAdminUnlock = async () => {
    if (!adminPassword) return;
    
    setIsUnlocking(true);
    setAdminError('');
    
    try {
      const success = await BranchInitializer.adminUnlock(adminPassword);
      if (success) {
        onRetry();
      } else {
        setAdminError('Неверный пароль');
      }
    } catch (error) {
      setAdminError('Ошибка разблокировки');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ошибка конфигурации
            </h2>
            <p className="text-gray-600 mb-4">
              {error === 'BRANCH_NOT_CONFIGURED' 
                ? 'Планшет не настроен для работы с филиалом'
                : error === 'INVALID_BRANCH'
                ? 'Указанный филиал недействителен'
                : 'Произошла ошибка инициализации'
              }
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onRetry}
              className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Повторить попытку
            </button>

            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="w-full text-gray-600 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Панель администратора
            </button>

            {showAdminPanel && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">Разблокировка администратора</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Пароль администратора"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminUnlock()}
                  />
                  {adminError && (
                    <p className="text-red-600 text-sm">{adminError}</p>
                  )}
                  <button
                    onClick={handleAdminUnlock}
                    disabled={isUnlocking || !adminPassword}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isUnlocking ? 'Разблокировка...' : 'Разблокировать'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BranchSetup({ onBranchConfigured }: BranchSetupProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      setError('');
      const branchList = await BranchValidator.getBranches();
      setBranches(branchList);
      
      // If there's only one branch, auto-select it
      if (branchList.length === 1) {
        setSelectedBranch(branchList[0].id);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
      setError('Не удалось загрузить список филиалов. Проверьте подключение к серверу.');
    } finally {
      setIsLoading(false);
    }
  };

  const configureBranch = async () => {
    if (!selectedBranch) return;
    
    setIsConfiguring(true);
    setError('');
    
    try {
      // Use the manual setup method
      await BranchInitializer.setupBranchManually(selectedBranch);
      onBranchConfigured();
    } catch (error) {
      console.error('Branch configuration error:', error);
      setError('Ошибка настройки филиала. Проверьте подключение к серверу и попробуйте снова.');
    } finally {
      setIsConfiguring(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m5 0v-4a1 1 0 011-1h2a1 1 0 011 1v4M7 7h10M7 11h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Настройка планшета
            </h2>
            <p className="text-gray-600 text-lg">
              Выберите филиал для этого планшета
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Доступные филиалы
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-lg"
                disabled={isConfiguring}
              >
                <option value="">
                  {branches.length === 0 
                    ? 'Нет доступных филиалов' 
                    : `Выберите филиал (${branches.length} доступно)`}
                </option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.address}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={loadBranches}
                disabled={isLoading || isConfiguring}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors font-medium"
              >
                {isLoading ? 'Загрузка...' : 'Обновить список'}
              </button>
              
              <button
                onClick={configureBranch}
                disabled={!selectedBranch || isConfiguring || branches.length === 0}
                className="flex-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 transition-all font-bold shadow-lg hover:shadow-xl"
              >
                {isConfiguring ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Настройка...
                  </div>
                ) : (
                  'Настроить планшет'
                )}
              </button>
            </div>

            {branches.length > 0 && (
              <div className="text-center text-sm text-gray-500">
                После настройки планшет будет работать только с выбранным филиалом
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BranchIndicator() {
  const [branchInfo, setBranchInfo] = useState<{ id: string; name?: string }>({ id: '' });

  useEffect(() => {
    const loadBranchInfo = async () => {
      const branchId = BranchConfig.getBranchId();
      if (branchId) {
        try {
          const branches = await BranchValidator.getBranches();
          const branch = branches.find(b => b.id === branchId);
          setBranchInfo({ id: branchId, name: branch?.name });
        } catch (error) {
          setBranchInfo({ id: branchId });
        }
      }
    };

    loadBranchInfo();
  }, []);

  if (!branchInfo.id) return null;

  return (
    <div className="fixed top-4 right-4 bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-sm font-medium">
      {branchInfo.name || branchInfo.id}
    </div>
  );
}

export default function BranchGuard({ children }: BranchGuardProps) {
  const [branchStatus, setBranchStatus] = useState<'loading' | 'configured' | 'error' | 'setup'>('loading');
  const [error, setError] = useState<string>('');

  const initializeBranch = async () => {
    setBranchStatus('loading');
    setError('');

    try {
      await BranchInitializer.initialize();
      setBranchStatus('configured');
    } catch (err: any) {
      setError(err.message);
      if (err.message === 'BRANCH_NOT_CONFIGURED') {
        setBranchStatus('setup');
      } else {
        setBranchStatus('error');
      }
    }
  };

  useEffect(() => {
    initializeBranch();
  }, []);

  if (branchStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (branchStatus === 'error') {
    return <BranchSetupError error={error} onRetry={initializeBranch} />;
  }

  if (branchStatus === 'setup') {
    return <BranchSetup onBranchConfigured={initializeBranch} />;
  }

  return (
    <>
      <BranchIndicator />
      {children}
    </>
  );
}

export { BranchIndicator };
