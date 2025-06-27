'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { SelectedCustomization, CartItem } from '../types';
import { ArrowLeft, Plus, Minus, Loader2 } from 'lucide-react';
import { t, formatPrice } from '../locales';

// Helper function to get user-friendly customization type names
const getCustomizationTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    'CUP_SIZE': 'Размер',
    'MILK_TYPE': 'Тип молока', 
    'SYRUP': 'Сироп',
    'EXTRA_SHOT': 'Дополнительные опции',
    'TEMPERATURE': 'Температура',
    'OTHER': 'Дополнительно'
  };
  return typeNames[type] || type;
};

interface CustomizeScreenProps {
  productId: string;
}

export default function CustomizeScreen({ productId }: CustomizeScreenProps) {
  const { addToCart, setStep } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);
  
  const { getProductById, getProductCustomizations, loading } = useMenu();
  const customizations = getProductCustomizations(productId);
  const product = getProductById(productId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">{t('errors.productNotFound')}</h2>
          <button onClick={() => setStep('menu')} className="btn-primary">
            {t('menu.backToMenu')}
          </button>
        </div>
      </div>
    );
  }

  const handleCustomizationChange = (customizationId: string, name: string, additionalPrice: number, type: string) => {
    setSelectedCustomizations(prev => {
      // Remove any existing selection for this customization type
      const filtered = prev.filter(c => c.type !== type);
      // Add the new selection
      return [...filtered, { customizationId, name, additionalPrice, type }];
    });
  };

  const calculateTotalPrice = () => {
    const customizationPrice = selectedCustomizations.reduce((sum, c) => sum + c.additionalPrice, 0);
    return (product.price + customizationPrice) * quantity;
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      quantity,
      customizations: selectedCustomizations,
      totalPrice: calculateTotalPrice(),
    };

    addToCart(cartItem);
    setStep('cart');
  };

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
          <h1 className="text-4xl font-bold text-gray-800">{t('customize.title')}</h1>
          <div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Info */}
          <div className="card">
            <div className="w-full h-64 bg-gray-200 rounded-xl mb-6 flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-8xl">☕</div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="text-2xl font-bold text-[#ED6F44]">
              {t('customize.basePrice')}: {formatPrice(product.price)}
            </div>
          </div>

          {/* Customizations */}
          <div className="space-y-6">
            {loading ? (
              <div className="card text-center">
                <Loader2 size={32} className="text-[#ED6F44] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">{t('customize.loadingCustomizations')}</p>
              </div>
            ) : customizations.length === 0 ? (
              <div className="card text-center">
                <p className="text-gray-600">{t('customize.noCustomizations')}</p>
              </div>
            ) : (
              // Group customizations by type
              Object.entries(
                customizations.reduce((groups: any, customization: any) => {
                  const type = customization.type;
                  if (!groups[type]) {
                    groups[type] = [];
                  }
                  groups[type].push(customization);
                  return groups;
                }, {})
              ).map(([type, typeCustomizations]: [string, any]) => (
                <div key={type} className="card">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {getCustomizationTypeName(type)}
                  </h3>
                  <div className="space-y-2">
                    {(typeCustomizations as any[]).map((customization: any) => {
                      const isSelected = selectedCustomizations.some(
                        c => c.customizationId === customization.id
                      );
                      
                      return (
                        <button
                          key={customization.id}
                          onClick={() => handleCustomizationChange(
                            customization.id,
                            customization.name,
                            customization.price,
                            customization.type
                          )}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-[#ED6F44] bg-orange-50 text-[#ED6F44]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{customization.name}</span>
                            <span className="text-sm">
                              {customization.price > 0 ? `+${formatPrice(customization.price)}` : t('free')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Quantity Selector */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('quantity')}</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn-secondary p-3"
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn-secondary p-3"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="card bg-[#ED6F44] text-white">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('customize.basePrice')}:</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
                {selectedCustomizations.map(customization => (
                  <div key={customization.customizationId} className="flex justify-between text-sm">
                    <span>{customization.name}:</span>
                    <span>+{formatPrice(customization.additionalPrice)}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>{t('quantity')}:</span>
                  <span>×{quantity}</span>
                </div>
                <hr className="border-white/30" />
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('total')}:</span>
                  <span>{formatPrice(calculateTotalPrice())}</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full btn-primary text-xl py-6"
            >
              {t('customize.addToCart')} - {formatPrice(calculateTotalPrice())}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
