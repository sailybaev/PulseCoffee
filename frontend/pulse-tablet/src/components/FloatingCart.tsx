'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface FloatingCartProps {
  itemCount: number;
  totalValue: number;
  disabled?: boolean;
}

export default function FloatingCart({
  itemCount,
  totalValue,
  disabled = false,
}: FloatingCartProps) {
  const { setStep } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCartClick = () => {
    if (!disabled) {
      setStep('cart');
    }
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <button
      onClick={handleCartClick}
      disabled={disabled}
      className={`floating-cart touch-target ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      type="button"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="relative">
            <ShoppingCart size={28} />
            {itemCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-white text-primary rounded-full min-w-[24px] h-6 flex items-center justify-center text-sm font-bold">
                {itemCount > 99 ? '99+' : itemCount}
              </div>
            )}
          </div>
          <span className="text-body font-semibold">
            Корзина ({itemCount} {getItemWord(itemCount)})
          </span>
        </div>
        
        <div className="text-subtitle font-bold">
          {formatPrice(totalValue)}
        </div>
      </div>
    </button>
  );
}

function getItemWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'товаров';
  }

  switch (lastDigit) {
    case 1:
      return 'товар';
    case 2:
    case 3:
    case 4:
      return 'товара';
    default:
      return 'товаров';
  }
}
