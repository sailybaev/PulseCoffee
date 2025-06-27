'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Product, SelectedCustomization, CartItem } from '../types';
import { useCart } from '../context/CartContext';
import Image from 'next/image';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedCustomizations([]);
    }
  }, [isOpen, product]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCustomizationChange = (
    customizationId: string,
    optionId: string,
    optionName: string,
    additionalPrice: number,
    type: string
  ) => {
    setSelectedCustomizations(prev => {
      // Remove existing selection for this customization type (since radio buttons should only allow one per type)
      const filtered = prev.filter(c => c.type !== type);
      
      // Add new selection - use optionId as customizationId since that's the ProductCustomization ID
      return [...filtered, {
        customizationId: optionId, // This should be the ProductCustomization ID from the database
        name: optionName,
        additionalPrice,
        type
      }];
    });
  };

  const calculateTotalPrice = () => {
    const customizationTotal = selectedCustomizations.reduce(
      (sum, customization) => sum + customization.additionalPrice,
      0
    );
    return (product.price + customizationTotal) * quantity;
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
    onClose();
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full mx-6 max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative">
          {/* Product Image */}
          <div className="relative h-64 bg-gray-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-8xl">☕</div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Product Info */}
          <div className="mb-6">
            <h2 className="text-heading font-bold text-gray-800 mb-2">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-body text-gray-600 mb-4">
                {product.description}
              </p>
            )}
            <div className="text-title font-bold text-primary">
              {formatPrice(product.price)}
            </div>
          </div>

          {/* Customizations */}
          {product.customizations && product.customizations.length > 0 && (
            <div className="mb-6 space-y-6">
              {product.customizations.map((customization) => (
                <div key={customization.id}>
                  <h3 className="text-subtitle font-semibold text-gray-800 mb-3">
                    {customization.name}
                  </h3>
                  <div className="space-y-2">
                    {customization.options.map((option) => {
                      const isSelected = selectedCustomizations.some(
                        c => c.customizationId === option.id
                      );

                      return (
                        <label
                          key={option.id}
                          className={`form-option ${isSelected ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={customization.id}
                            value={option.id}
                            checked={isSelected}
                            onChange={() =>
                              handleCustomizationChange(
                                customization.id,
                                option.id,
                                option.name,
                                option.additionalPrice,
                                customization.type
                              )
                            }
                          />
                          <div className="flex-1">
                            <span className="text-body font-medium text-gray-800">
                              {option.name}
                            </span>
                            {option.additionalPrice > 0 && (
                              <span className="text-caption text-gray-600 ml-2">
                                +{formatPrice(option.additionalPrice)}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="text-subtitle font-semibold text-gray-800 mb-3">
              Количество
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Minus size={20} />
              </button>
              <span className="text-title font-bold min-w-[3ch] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleAddToCart}
            className="btn-primary w-full"
            type="button"
          >
            <span className="flex items-center justify-between w-full">
              <span>Добавить в корзину</span>
              <span className="font-bold">
                {formatPrice(calculateTotalPrice())}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
