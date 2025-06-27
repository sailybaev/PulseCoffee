'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { Product, CartItem } from '../types';
import { ArrowLeft, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { t, formatPrice } from '../locales';

export default function MenuScreen() {
  const { setStep, currentStep, getTotalItems, addToCart, setSelectedProductId } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('COFFEE');
  const { products, loading, error, getProductsByCategory } = useMenu();

  const categories = [
    { id: 'COFFEE', name: t('menu.categories.coffee'), emoji: '☕' },
    { id: 'TEA', name: t('menu.categories.tea'), emoji: '🍵' },
    { id: 'HOT_BEVERAGES', name: 'Горячие напитки', emoji: '🔥' },
    { id: 'COLD_DRINKS', name: 'Холодные напитки', emoji: '🧊' },
    { id: 'LEMONADES', name: 'Лимонады', emoji: '🍋' },
    { id: 'FRESH_JUICE', name: 'Фреш', emoji: '🍊' },
    { id: 'PASTRY', name: t('menu.categories.pastry'), emoji: '🥐' },
    { id: 'SNACK', name: t('menu.categories.snacks'), emoji: '🍪' },
  ];

  const filteredProducts = getProductsByCategory(selectedCategory);

  const handleProductSelect = (product: Product) => {
    // Always go to customize screen for all products
    setSelectedProductId(product.id);
    setStep('customize');
  };

  const addToCartDirectly = (product: Product) => {
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      quantity: 1,
      customizations: [],
      totalPrice: product.price,
    };
    
    addToCart(cartItem);
    // Show a brief notification
    setTimeout(() => {
      // You could use a toast notification here
      console.log(`${product.name} added to cart!`);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep('welcome')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>{t('back')}</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-800">{t('menu.title')}</h1>
          
          <button
            onClick={() => setStep('cart')}
            className="btn-primary flex items-center space-x-2 relative"
          >
            <ShoppingCart size={20} />
            <span>{t('menu.cart')}</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-[#ED6F44] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 size={48} className="text-[#ED6F44] animate-spin mx-auto mb-4" />
              <p className="text-xl text-gray-600">{t('menu.loadingMenu')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              {t('menu.failedToLoadMenu')}
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              {t('tryAgain')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredProducts.map((product: Product) => (
            <div key={product.id} className="card hover:shadow-xl cursor-pointer group">
              {/* Product Image */}
              <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">
                    {selectedCategory === 'COFFEE' ? '☕' : 
                     selectedCategory === 'TEA' ? '🍵' :
                     selectedCategory === 'HOT_BEVERAGES' ? '🔥' :
                     selectedCategory === 'COLD_DRINKS' ? '🧊' :
                     selectedCategory === 'LEMONADES' ? '🍋' :
                     selectedCategory === 'FRESH_JUICE' ? '🍊' :
                     selectedCategory === 'PASTRY' ? '🥐' : '🍪'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
              </div>

              {/* Product Info */}
              <div className="space-y-2 mb-4">
                <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#ED6F44]">
                    {formatPrice(product.price)}
                  </span>
                  {product.customizations.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {t('menu.customizable')}
                    </span>
                  )}
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleProductSelect(product)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>{t('menu.select')}</span>
              </button>
            </div>
          ))}
        </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              {t('menu.emptyCategory.title')}
            </h3>
            <p className="text-gray-500">
              {t('menu.emptyCategory.description')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
