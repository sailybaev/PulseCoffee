'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ArrowLeft, QrCode, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { apiService, CreateOrderRequest } from '../services/api';
import config from '../config';
import { t, formatPrice } from '../locales';
import { useBranch } from '../hooks/useBranch';

export default function PaymentScreen() {
  const { 
    cartItems, 
    currentStep, 
    customerName, 
    setStep, 
    getTotalPrice, 
    clearCart 
  } = useCart();
  const { branchId, isValidBranch } = useBranch();

  const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD' | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('PENDING');
  const [showQR, setShowQR] = useState(false);

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
    console.log('handlePaymentSuccess called');
    console.log('Branch ID:', branchId);
    console.log('Is Valid Branch:', isValidBranch);
    
    // For development/testing - allow orders even if branch validation is pending
    const allowOrderSubmission = branchId && (isValidBranch || config.DEVELOPMENT.DEBUG);
    
    if (!allowOrderSubmission) {
      console.error('Branch not configured or invalid - aborting order submission');
      console.error('Branch ID exists:', !!branchId);
      console.error('Branch is valid:', isValidBranch);
      console.error('Debug mode:', config.DEVELOPMENT.DEBUG);
      // Show error message to user instead of silent failure
      setPaymentStatus('FAILED');
      return;
    }

    try {
      setPaymentStatus('PROCESSING');
      
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
            productCustomizationId: c.customizationId, // Map customizationId to productCustomizationId
          })),
        })),
        total: getTotalPrice(),
        paymentMethod: paymentMethod!,
        paymentStatus: 'COMPLETED',
      };
      
      console.log('Order data prepared:', orderData);
      
      if (config.DEVELOPMENT.USE_MOCK_DATA) {
        // Simulate API call in development
        console.log('Using mock data - simulating order submission');
        console.log('Mock order submitted:', orderData);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Real API call
        console.log('Making real API call to create order');
        const response = await apiService.createPublicOrder(orderData);
        console.log('Order created successfully:', response);
      }
      
      // Clear cart and proceed to thank you screen
      clearCart();
      setStep('thankyou');
      setPaymentStatus('COMPLETED');
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

  if (paymentStatus === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
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

  if (paymentStatus === 'FAILED') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep('cart')}
            className="btn-secondary flex items-center space-x-2"
            disabled={paymentStatus === 'PROCESSING'}
          >
            <ArrowLeft size={20} />
            <span>{t('payment.backToCart')}</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-800">{t('payment.title')}</h1>
          <div></div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-sm">
            <strong>Debug Info:</strong> Branch ID: {branchId || 'None'} | Valid: {isValidBranch ? 'Yes' : 'No'} | Payment Status: {paymentStatus}
          </div>
        )}

        {/* Branch Error Warning */}
        {(!branchId || !isValidBranch) && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center text-red-800">
              <span className="font-semibold">⚠️ Branch Configuration Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              No valid branch selected. Orders cannot be submitted. Please configure the branch first.
            </p>
            {config.DEVELOPMENT.DEBUG && (
              <button
                onClick={() => {
                  console.log('Force submitting order despite branch issues');
                  handlePaymentSuccess();
                }}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Debug: Force Submit Order
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('payment.orderSummary')}</h3>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-600">{t('quantity')}: {item.quantity}</div>
                      {item.customizations.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {item.customizations.map(c => c.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="font-semibold">{formatPrice(item.totalPrice)}</div>
                  </div>
                ))}
                <hr className="border-gray-300" />
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('total')}:</span>
                  <span className="text-[#ED6F44]">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('payment.customer')}</h3>
              <p className="text-gray-600">{customerName}</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            {!paymentMethod && paymentStatus === 'PENDING' && (
              <>
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('payment.choosePaymentMethod')}</h3>
                  
                  {/* QR Payment */}
                  <button
                    onClick={handleQRPayment}
                    className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#ED6F44] hover:bg-orange-50 transition-all mb-4 group"
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
                    className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#ED6F44] hover:bg-orange-50 transition-all group"
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
              </>
            )}

            {/* QR Code Display */}
            {showQR && paymentMethod === 'QR' && (
              <div className="card text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('payment.qrPayment.title')}</h3>
                
                {/* QR Code Placeholder */}
                <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-xl mx-auto mb-6 flex items-center justify-center">
                  <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: 64 }, (_, i) => (
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

                <button
                  onClick={handleQRPaymentConfirm}
                  className="btn-primary w-full mb-4"
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
                  className="btn-secondary w-full"
                >
                  {t('payment.qrPayment.chooseDifferent')}
                </button>
              </div>
            )}

            {/* Card Payment Processing */}
            {paymentMethod === 'CARD' && paymentStatus === 'PROCESSING' && (
              <div className="card text-center">
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
                  className="btn-secondary"
                >
                  {t('payment.cardPayment.cancelPayment')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
