'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { t, formatPrice } from '../locales';

export default function CartScreen() {
  const { 
    cartItems, 
    currentStep, 
    customerName, 
    setCustomerName, 
    setStep, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    getTotalItems 
  } = useCart();

  const [showNameInput, setShowNameInput] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState(customerName);

  const handleProceedToPayment = () => {
    if (!customerName.trim()) {
      setShowNameInput(true);
      return;
    }
    setStep('payment');
  };

  const handleSaveName = () => {
    if (tempCustomerName.trim()) {
      setCustomerName(tempCustomerName.trim());
      setShowNameInput(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep('menu')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>{t('menu.backToMenu')}</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-800">{t('cart.title')}</h1>          <div></div>
        </div>

          {/* Empty Cart */}
          <div className="text-center py-16">
            <ShoppingBag size={120} className="text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-600 mb-4">{t('cart.empty.title')}</h2>
            <p className="text-gray-500 mb-8 text-lg">
              {t('cart.empty.description')}
            </p>
            <button
              onClick={() => setStep('menu')}
              className="btn-primary text-xl py-4 px-8"
            >
              {t('cart.empty.browseMenu')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep('menu')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>{t('menu.backToMenu')}</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-800">
            {t('cart.title')} ({getTotalItems()} {getTotalItems() === 1 ? t('cart.item') : t('cart.items')})
          </h1>
          <div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="card">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">☕</span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {item.productName}
                    </h3>
                    <div className="text-sm text-gray-600 mb-2">
                      {t('cart.orderSummary.base')}: {formatPrice(item.basePrice)}
                    </div>
                    
                    {/* Customizations */}
                    {item.customizations.length > 0 && (
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="space-y-1">
                          {item.customizations.map((customization, i) => (
                            <div key={i} className="flex justify-between">
                              <span>• {customization.name}</span>
                              {customization.additionalPrice > 0 && (
                                <span>+{formatPrice(customization.additionalPrice)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="btn-secondary p-2"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="btn-secondary p-2"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Price and Remove */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#ED6F44] mb-2">
                      {formatPrice(item.totalPrice)}
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Customer Name */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('cart.customerInfo.title')}</h3>
              {!showNameInput ? (
                <div>
                  {customerName ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{t('cart.customerInfo.name')}</p>
                        <p className="font-semibold">{customerName}</p>
                      </div>
                      <button
                        onClick={() => setShowNameInput(true)}
                        className="text-[#ED6F44] text-sm hover:underline"
                      >
                        {t('edit')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNameInput(true)}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#ED6F44] hover:text-[#ED6F44] transition-colors"
                    >
                      {t('cart.customerInfo.addName')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tempCustomerName}
                    onChange={(e) => setTempCustomerName(e.target.value)}
                    placeholder={t('cart.namePlaceholder')}
                    className="input-field"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveName}
                      className="btn-primary flex-1"
                    >
                      {t('save')}
                    </button>
                    <button
                      onClick={() => {
                        setShowNameInput(false);
                        setTempCustomerName(customerName);
                      }}
                      className="btn-secondary"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="card bg-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('cart.orderSummary.title')}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>{t('cart.items')} ({getTotalItems()}):</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('cart.orderSummary.serviceFee')}:</span>
                  <span>{t('free')}</span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('total')}:</span>
                  <span className="text-[#ED6F44]">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            </div>

            {/* Proceed to Payment */}
            <button
              onClick={handleProceedToPayment}
              className="w-full btn-primary text-xl py-6"
            >
              {t('cart.proceedToPayment')}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={() => setStep('menu')}
              className="w-full btn-secondary"
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
