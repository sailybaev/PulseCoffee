'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, QrCode, CheckCircle, Clock } from 'lucide-react';
import { t, formatPrice } from '../locales';
import { apiService, CreateOrderRequest } from '../services/api';
import config from '../config';
import { useBranch } from '../hooks/useBranch';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { 
    cartItems, 
    customerName, 
    setCustomerName, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    getTotalItems,
    clearCart,
    setStep
  } = useCart();
  
  const { branchId, isValidBranch } = useBranch();

  const [showNameInput, setShowNameInput] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState(customerName);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD' | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('PENDING');
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (tempCustomerName.trim()) {
      setCustomerName(tempCustomerName.trim());
      setShowNameInput(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!customerName.trim()) {
      setShowNameInput(true);
      return;
    }
    setShowPayment(true);
  };

  const handleQRPayment = () => {
    setPaymentMethod('QR');
    setShowQR(true);
    setPaymentStatus('PROCESSING');
  };

  const handleCardPayment = () => {
    setPaymentMethod('CARD');
    setPaymentStatus('PROCESSING');
    
    // Simulate card payment process
    setTimeout(() => {
      setPaymentStatus('COMPLETED');
      setTimeout(() => {
        handlePaymentSuccess();
      }, 2000);
    }, 3000);
  };

  const handleQRPaymentConfirm = () => {
    setPaymentStatus('COMPLETED');
    setTimeout(() => {
      handlePaymentSuccess();
    }, 2000);
  };

  const handlePaymentSuccess = async () => {
    // For development/testing - allow orders even if branch validation is pending
    const allowOrderSubmission = branchId && (isValidBranch || config.DEVELOPMENT.DEBUG);
    
    if (!allowOrderSubmission) {
      console.error('Branch not configured or invalid');
      console.error('Branch ID exists:', !!branchId);
      console.error('Branch is valid:', isValidBranch);
      console.error('Debug mode:', config.DEVELOPMENT.DEBUG);
      setPaymentStatus('FAILED');
      return;
    }

    try {
      // Use stored branch ID or fallback for debugging
      const orderBranchId = branchId || process.env.NEXT_PUBLIC_BRANCH_ID || 'default-branch';
      
      // Prepare order data for API
      const orderData: CreateOrderRequest = {
        customerName,
        branchId: orderBranchId,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.totalPrice,
          customizations: item.customizations.map(c => ({
            productCustomizationId: c.customizationId,
          })),
        })),
        total: getTotalPrice(),
        paymentMethod: paymentMethod!,
        paymentStatus: 'COMPLETED',
      };
      
      console.log('Order data prepared:', orderData);
      
      if (config.DEVELOPMENT.USE_MOCK_DATA) {
        console.log('Mock order submitted:', orderData);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        const response = await apiService.createPublicOrder(orderData);
        console.log('Order created:', response);
      }
      
      // Clear cart and proceed to thank you screen
      clearCart();
      setStep('thankyou');
      onClose();
    } catch (error) {
      console.error('Failed to submit order:', error);
      setPaymentStatus('FAILED');
    }
  };

  const handlePaymentFailure = () => {
    setPaymentStatus('FAILED');
    setTimeout(() => {
      setPaymentStatus('PENDING');
      setPaymentMethod(null);
      setShowQR(false);
    }, 3000);
  };

  const resetPaymentState = () => {
    setShowPayment(false);
    setPaymentMethod(null);
    setPaymentStatus('PENDING');
    setShowQR(false);
  };

  // Payment Success Screen
  if (paymentStatus === 'COMPLETED') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full text-center p-8">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('payment.status.successful')}</h2>
          <p className="text-gray-600 mb-6">
            {t('payment.status.confirmed')}
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  // Payment Failed Screen
  if (paymentStatus === 'FAILED') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full text-center p-8">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-4xl">✕</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('payment.status.failed')}</h2>
          <p className="text-gray-600 mb-6">
            {t('payment.status.failedDescription')}
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full text-center p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
          
          <ShoppingBag size={80} className="text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">{t('cart.empty.title')}</h2>
          <p className="text-gray-500 mb-8">
            {t('cart.empty.description')}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-[#ED6F44] text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-[#D5613D] transition-colors"
          >
            {t('cart.empty.browseMenu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {showPayment ? t('payment.title') : t('cart.title')} 
            {!showPayment && (
              <span className="text-[#ED6F44] ml-2">
                ({getTotalItems()} {getTotalItems() === 1 ? t('cart.item') : t('cart.items')})
              </span>
            )}
          </h2>
          <button
            onClick={() => {
              if (showPayment) {
                resetPaymentState();
              } else {
                onClose();
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          {/* Cart Items / Payment Content */}
          <div className="flex-1 overflow-y-auto">
            {!showPayment ? (
              <div className="p-6 space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">☕</span>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
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
                            className="w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={14} />
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
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Payment Content
              <div className="p-6">
                {!paymentMethod && paymentStatus === 'PENDING' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('payment.choosePaymentMethod')}</h3>
                    
                    {/* QR Payment */}
                    <button
                      onClick={handleQRPayment}
                      className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-[#ED6F44] hover:bg-orange-50 transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        <QrCode size={48} className="text-[#ED6F44] group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <h4 className="text-lg font-semibold text-gray-800">{t('payment.methods.qr.title')}</h4>
                          <p className="text-gray-600">{t('payment.methods.qr.description')}</p>
                        </div>
                      </div>
                    </button>

                    {/* Card Payment */}
                    <button
                      onClick={handleCardPayment}
                      className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-[#ED6F44] hover:bg-orange-50 transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        <CreditCard size={48} className="text-[#ED6F44] group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <h4 className="text-lg font-semibold text-gray-800">{t('payment.methods.card.title')}</h4>
                          <p className="text-gray-600">{t('payment.methods.card.description')}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* QR Code Display */}
                {showQR && paymentMethod === 'QR' && (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('payment.qrPayment.title')}</h3>
                    
                    {/* QR Code Placeholder */}
                    <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <div className="grid grid-cols-6 gap-1">
                        {Array.from({ length: 36 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-[#ED6F44] mb-4">
                      {formatPrice(getTotalPrice())}
                    </div>

                    <p className="text-gray-600 mb-6">
                      {t('payment.qrPayment.instructions')}
                    </p>

                    {paymentStatus === 'PROCESSING' && (
                      <div className="mb-6">
                        <div className="flex items-center justify-center space-x-2 text-yellow-600 mb-4">
                          <Clock size={20} />
                          <span>{t('payment.qrPayment.waiting')}</span>
                        </div>
                        <div className="animate-pulse w-full bg-yellow-200 h-2 rounded-full">
                          <div className="bg-yellow-500 h-2 rounded-full w-1/2"></div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={handleQRPaymentConfirm}
                        className="flex-1 bg-[#ED6F44] text-white py-3 px-6 rounded-2xl font-semibold hover:bg-[#D5613D] transition-colors"
                        disabled={paymentStatus === 'PROCESSING'}
                      >
                        {t('payment.qrPayment.madePament')}
                      </button>
                      <button
                        onClick={() => {
                          setPaymentMethod(null);
                          setShowQR(false);
                          setPaymentStatus('PENDING');
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        {t('payment.qrPayment.chooseDifferent')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Payment Processing */}
                {paymentMethod === 'CARD' && paymentStatus === 'PROCESSING' && (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('payment.cardPayment.title')}</h3>
                    
                    <div className="w-32 h-32 mx-auto mb-6 relative">
                      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#ED6F44] rounded-full border-t-transparent animate-spin"></div>
                      <CreditCard size={48} className="absolute inset-0 m-auto text-[#ED6F44]" />
                    </div>

                    <div className="text-2xl font-bold text-[#ED6F44] mb-4">
                      {formatPrice(getTotalPrice())}
                    </div>

                    <p className="text-gray-600 mb-6">
                      {t('payment.cardPayment.processing')}
                    </p>

                    <button
                      onClick={handlePaymentFailure}
                      className="bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      {t('payment.cardPayment.cancelPayment')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Customer Info & Total */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-6 space-y-6 flex-1">
              {/* Customer Name */}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('cart.customerInfo.title')}</h3>
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
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#ED6F44] hover:text-[#ED6F44] transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED6F44] focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveName}
                        className="flex-1 bg-[#ED6F44] text-white py-2 px-4 rounded-xl font-medium hover:bg-[#D5613D] transition-colors"
                      >
                        {t('save')}
                      </button>
                      <button
                        onClick={() => {
                          setShowNameInput(false);
                          setTempCustomerName(customerName);
                        }}
                        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('cart.orderSummary.title')}</h3>
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
            </div>

            {/* Action Buttons */}
            <div className="p-6 space-y-3 border-t border-gray-200">
              {!showPayment ? (
                <>
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-[#ED6F44] text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-[#D5613D] transition-colors"
                  >
                    {t('cart.proceedToPayment')}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    {t('cart.continueShopping')}
                  </button>
                </>
              ) : (
                <button
                  onClick={resetPaymentState}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
                >
                  {t('payment.backToCart')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
