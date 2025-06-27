'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { useBranch } from '../hooks/useBranch';
import { Coffee, Clock, Heart, RefreshCw, Sparkles, Users, Star, AlertCircle } from 'lucide-react';
import { t } from '../locales';

export default function WelcomeScreen() {
  const { setStep } = useCart();
  const { refreshMenuData } = useMenu();
  const { branchId, branchInfo, isValidBranch, isLoading: branchLoading } = useBranch();
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartOrder = () => {
    // Prevent starting order if no valid branch is selected
    if (!branchId || !isValidBranch) {
      console.warn('Cannot start order: No valid branch selected');
      return;
    }
    setStep('menu');
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
    // Reset after 5 seconds of inactivity
    setTimeout(() => setLogoClickCount(0), 5000);
  };

  const handleForceReset = () => {
    if (confirm('Are you sure you want to reset the branch configuration? This will reload the page and show the branch selection screen.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleReconfigureBranch = () => {
    if (confirm('Do you want to reconfigure the branch? This will clear the current branch and show the selection screen.')) {
      localStorage.removeItem('TABLET_BRANCH_ID');
      localStorage.removeItem('BRANCH_LOCKED');
      localStorage.removeItem('DEVICE_REGISTERED');
      sessionStorage.removeItem('TABLET_BRANCH_ID');
      window.location.reload();
    }
  };

  const handleRefreshMenu = async () => {
    setIsRefreshing(true);
    try {
      await refreshMenuData();
      console.log('Menu refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh menu:', error);
    } finally {
      setIsRefreshing(false);
      setLogoClickCount(0);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Доброе утро!';
    if (hour < 17) return 'Добро пожаловать!';
    return 'Добрый вечер!';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 relative overflow-hidden tablet-compact">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-br from-amber-200/25 to-yellow-200/25 rounded-full blur-xl animate-pulse delay-2000"></div>
        
        {/* Floating coffee beans */}
        <div className="absolute top-1/4 left-1/4 animate-bounce delay-500">
          <Coffee size={24} className="text-amber-400/40" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-bounce delay-1000">
          <Coffee size={20} className="text-orange-400/40" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-bounce delay-1500">
          <Coffee size={28} className="text-red-400/40" />
        </div>
      </div>

      

      <div className="relative z-10 flex flex-col h-full overflow-y-auto screen-fit">
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="text-center max-w-4xl w-full">
            {/* Logo with enhanced styling */}
            <div className="mb-8 lg:mb-12">
              <div 
                className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-[#ED6F44] to-[#D5613D] rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8 shadow-2xl cursor-pointer transition-all duration-500 hover:scale-110 hover:shadow-3xl relative overflow-hidden group"
                onClick={handleLogoClick}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shine"></div>
                
                <Coffee size={60} className="text-white relative z-10 lg:w-20 lg:h-20" />
                
                {/* Sparkle effects */}
                <Sparkles className="absolute top-4 right-4 text-white/60 animate-pulse" size={20} />
                <Sparkles className="absolute bottom-6 left-6 text-white/40 animate-pulse delay-500" size={16} />
              </div>
              
              {/* Hidden admin refresh button */}
              {logoClickCount >= 5 && (
                <div className="mb-6 animate-fadeIn">
                  <div className="bg-gray-100 rounded-xl p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Debug Panel</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Branch ID: {branchId || 'None'}</div>
                      <div>Branch Valid: {isValidBranch ? 'Yes' : 'No'}</div>
                      <div>Branch Loading: {branchLoading ? 'Yes' : 'No'}</div>
                      <div>Branch Name: {branchInfo?.name || 'None'}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleRefreshMenu}
                        disabled={isRefreshing}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Menu'}
                      </button>
                      <button
                        onClick={handleReconfigureBranch}
                        className="px-3 py-2 bg-amber-600 text-white rounded-lg text-xs hover:bg-amber-700 transition-all"
                      >
                        Reconfigure Branch
                      </button>
                      <button
                        onClick={handleForceReset}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-all"
                      >
                        Force Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Greeting and main title */}
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-medium text-gray-600 mb-2 lg:mb-4 animate-fadeIn">
                  {getGreeting()}
                </h2>
                <h1 className="text-4xl lg:text-7xl font-bold bg-gradient-to-r from-[#ED6F44] to-[#D5613D] bg-clip-text text-transparent mb-4 lg:mb-6 animate-fadeIn delay-300">
                  {t('welcome.title')}
                </h1>
                
                {/* Branch indicator */}
                {branchInfo && (
                  <div className="mb-4 lg:mb-6">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm lg:text-base font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Филиал: {branchInfo.name}</span>
                    </div>
                  </div>
                )}
                
                <p className="text-xl lg:text-3xl text-gray-700 font-medium animate-fadeIn delay-500">
                  {t('welcome.subtitle')}
                </p>
              </div>
            </div>

            {/* Enhanced features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-16">
              <div className="group">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 lg:p-8 text-center shadow-xl border border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-[#ED6F44] to-[#D5613D] rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:rotate-6 transition-transform duration-300">
                    <Coffee className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-2xl font-bold mb-2 lg:mb-4 text-gray-800">{t('welcome.features.freshCoffee.title')}</h3>
                  <p className="text-gray-600 text-sm lg:text-lg leading-relaxed">{t('welcome.features.freshCoffee.description')}</p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 lg:p-8 text-center shadow-xl border border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:rotate-6 transition-transform duration-300">
                    <Clock className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-2xl font-bold mb-2 lg:mb-4 text-gray-800">{t('welcome.features.quickService.title')}</h3>
                  <p className="text-gray-600 text-sm lg:text-lg leading-relaxed">{t('welcome.features.quickService.description')}</p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 lg:p-8 text-center shadow-xl border border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:rotate-6 transition-transform duration-300">
                    <Heart className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-2xl font-bold mb-2 lg:mb-4 text-gray-800">{t('welcome.features.madeWithLove.title')}</h3>
                  <p className="text-gray-600 text-sm lg:text-lg leading-relaxed">{t('welcome.features.madeWithLove.description')}</p>
                </div>
              </div>
            </div>

            {/* Enhanced start order button */}
            <div className="mb-8 lg:mb-12">
              {!branchId || !isValidBranch ? (
                <div className="mb-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 lg:p-6 mb-4">
                    <div className="flex items-center justify-center gap-3 text-amber-700">
                      <AlertCircle size={24} />
                      <span className="text-lg lg:text-xl font-semibold">
                        {branchLoading ? 'Проверка филиала...' : 'Филиал не выбран'}
                      </span>
                    </div>
                    <p className="text-amber-600 text-center mt-2 text-sm lg:text-base">
                      {branchLoading 
                        ? 'Пожалуйста, подождите...'
                        : 'Для размещения заказа необходимо выбрать филиал'
                      }
                    </p>
                  </div>
                </div>
              ) : null}
              
              <button
                onClick={handleStartOrder}
                disabled={!branchId || !isValidBranch || branchLoading}
                className={`group relative text-white text-2xl lg:text-4xl font-bold py-6 lg:py-8 px-12 lg:px-16 rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden ${
                  (!branchId || !isValidBranch || branchLoading)
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-[#ED6F44] to-[#D5613D] hover:shadow-3xl hover:scale-105 active:scale-95'
                }`}
              >
                {/* Animated background effect */}
                {branchId && isValidBranch && !branchLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D5613D] to-[#ED6F44] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                
                {/* Button content */}
                <div className="relative z-10 flex items-center justify-center gap-3 lg:gap-4">
                  <Coffee size={36} className={`${branchId && isValidBranch && !branchLoading ? 'group-hover:animate-bounce' : ''} lg:w-12 lg:h-12`} />
                  <span>{t('welcome.startOrder')}</span>
                  {branchId && isValidBranch && !branchLoading && (
                    <div className="flex space-x-1">
                      <Star className="animate-pulse delay-100" size={20} />
                      <Star className="animate-pulse delay-300" size={20} />
                      <Star className="animate-pulse delay-500" size={20} />
                    </div>
                  )}
                </div>
                
                {/* Ripple effect */}
                {branchId && isValidBranch && !branchLoading && (
                  <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300 rounded-3xl"></div>
                  </div>
                )}
              </button>
            </div>

            {/* Enhanced instructions */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 lg:p-6 border border-white/30 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-3 lg:mb-4">
                <Users className="text-[#ED6F44]" size={24} />
                <span className="text-lg lg:text-xl font-semibold text-gray-800">Как заказать</span>
              </div>
              <p className="text-sm lg:text-lg text-gray-700 leading-relaxed">
                {t('welcome.instructions')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
