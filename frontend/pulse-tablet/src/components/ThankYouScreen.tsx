'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle, Coffee, Clock, Home, Sparkles, Star, Gift, Heart } from 'lucide-react';
import { t, formatTime, formatCountdown } from '../locales';

export default function ThankYouScreen() {
  const { setStep } = useCart();
  const [orderNumber] = useState(() => Math.floor(Math.random() * 1000) + 1);
  const [estimatedTime] = useState(() => Math.floor(Math.random() * 10) + 5); // 5-15 minutes
  const [countdown, setCountdown] = useState(30);
  const [showConfetti, setShowConfetti] = useState(true);

  // Auto redirect to welcome screen after 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setStep('welcome');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setStep]);

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearInterval(timer);
  }, []);

  const handleStartNewOrder = () => {
    setStep('welcome');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden tablet-compact">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-teal-200/20 to-emerald-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-br from-green-200/25 to-lime-200/25 rounded-full blur-xl animate-pulse delay-2000"></div>
        
        {/* Floating success elements */}
        <div className="absolute top-1/4 left-1/4 animate-bounce delay-500">
          <CheckCircle size={24} className="text-emerald-400/40" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-bounce delay-1000">
          <Star size={20} className="text-green-400/40" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-bounce delay-1500">
          <Heart size={28} className="text-teal-400/40" />
        </div>
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div className={`w-2 h-2 ${['bg-emerald-400', 'bg-green-400', 'bg-teal-400', 'bg-yellow-400'][i % 4]} rotate-45`}></div>
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full overflow-y-auto screen-fit">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-5xl mx-auto text-center w-full">
            {/* Enhanced success icon */}
            <div className="mb-6 lg:mb-8">
              <div className="relative">
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-3xl relative overflow-hidden group animate-bounceIn">
                  {/* Sparkle effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
                  
                  <CheckCircle size={48} className="text-white relative z-10 lg:w-16 lg:h-16" />
                  
                  {/* Floating sparkles */}
                  <Sparkles className="absolute top-4 right-4 lg:top-6 lg:right-6 text-white/60 animate-pulse" size={16} />
                  <Sparkles className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 text-white/40 animate-pulse delay-500" size={14} />
                </div>
                
                {/* Success rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 lg:w-48 lg:h-48 border-4 border-emerald-300/30 rounded-full animate-ping"></div>
                  <div className="absolute w-48 h-48 lg:w-56 lg:h-56 border-4 border-green-300/20 rounded-full animate-ping delay-1000"></div>
                </div>
              </div>
            </div>

            {/* Enhanced thank you message */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3 lg:mb-4 animate-fadeIn">
                {t('thankYou.title')}
              </h1>
              <h2 className="text-xl lg:text-3xl font-bold text-emerald-700 mb-4 lg:mb-6 animate-fadeIn delay-300">
                {t('thankYou.subtitle')}
              </h2>
              <div className="flex items-center justify-center gap-2 text-lg lg:text-2xl font-medium text-gray-700 animate-fadeIn delay-500">
                <Gift className="text-emerald-500" size={24} />
                <span>Ваш заказ принят!</span>
                <Gift className="text-emerald-500" size={24} />
              </div>
            </div>

            {/* Enhanced order details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-6 mb-6 lg:mb-8">
              <div className="group">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-4 lg:p-6 shadow-xl border border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-center justify-center mb-3 lg:mb-4">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#ED6F44] to-[#D5613D] rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <span className="text-white font-bold text-base lg:text-lg">#{orderNumber}</span>
                    </div>
                  </div>
                  <h3 className="text-base lg:text-xl font-bold text-gray-800 mb-2">{t('thankYou.orderNumber')}</h3>
                  <p className="text-gray-600 text-sm lg:text-base">{t('thankYou.orderNumberDescription')}</p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-4 lg:p-6 shadow-xl border border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-center justify-center mb-3 lg:mb-4">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <Clock size={20} className="text-white lg:w-6 lg:h-6" />
                    </div>
                  </div>
                  <h3 className="text-base lg:text-xl font-bold text-gray-800 mb-2">{t('thankYou.estimatedTime')}</h3>
                  <p className="text-emerald-600 text-lg lg:text-xl font-bold">{formatTime(estimatedTime)}</p>
                </div>
              </div>
            </div>

            {/* Enhanced instructions */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-4 lg:p-6 mb-6 lg:mb-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#ED6F44] to-[#D5613D] rounded-2xl flex items-center justify-center">
                  <Coffee size={20} className="text-white lg:w-6 lg:h-6" />
                </div>
                <h3 className="text-lg lg:text-2xl font-bold text-gray-800">
                  {t('thankYou.preparing.title')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 text-left">
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <p className="text-gray-700 text-sm lg:text-base">{t('thankYou.preparing.instructions.0')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <p className="text-gray-700 text-sm lg:text-base">{t('thankYou.preparing.instructions.1')}</p>
                  </div>
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <p className="text-gray-700 text-sm lg:text-base">{t('thankYou.preparing.instructions.2')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <p className="text-gray-700 text-sm lg:text-base">{t('thankYou.preparing.instructions.3')} #{orderNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced actions */}
            <div className="space-y-3 lg:space-y-4">
              <button
                onClick={handleStartNewOrder}
                className="group relative bg-gradient-to-r from-[#ED6F44] to-[#D5613D] text-white text-lg lg:text-xl font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 active:scale-95 overflow-hidden"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#D5613D] to-[#ED6F44] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button content */}
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Home size={20} className="group-hover:animate-bounce lg:w-6 lg:h-6" />
                  <span>{t('thankYou.startNewOrder')}</span>
                </div>
                
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300 rounded-3xl"></div>
                </div>
              </button>

              {/* Enhanced auto redirect countdown */}
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-3 lg:p-4 border border-white/30 shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{countdown}</span>
                  </div>
                  <p className="text-gray-700 text-sm lg:text-base font-medium">
                    {t('thankYou.autoRedirect')} {formatCountdown(countdown)}
                  </p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(countdown / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced decoration */}
            <div className="mt-6 lg:mt-8 text-3xl lg:text-4xl opacity-30 animate-bounce">
              ☕ ✨ 🎉 ☕ ✨ ☕
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
