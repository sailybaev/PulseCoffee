'use client';

import { useState, useRef, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { Product, SelectedCustomization, CartItem } from '../types';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import Image from 'next/image';
import WelcomeScreen from './WelcomeScreen';
import CartModal from './CartModal';
import ThankYouScreen from './ThankYouScreen';

// Product Card Component
interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onQuickAdd?: (product: Product) => void;
}

function ProductCard({ product, onClick, onQuickAdd }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className="product-card touch-target smooth-transition cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Product Image */}
      <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-xl overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-6xl">☕</div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-title font-bold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-body text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-subtitle font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          
          {product.customizations && product.customizations.length > 0 ? (
            <span className="text-caption text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Настраиваемый
            </span>
          ) : (
            onQuickAdd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(product);
                }}
                className="bg-primary text-white px-3 py-1 rounded-full text-caption font-semibold hover:opacity-90 transition-colors"
                type="button"
              >
                + В корзину
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Category Navigation Component
interface CategoryNavigationProps {
  categories: string[];
  activeCategory: string;
  onCategoryClick: (categorySlug: string) => void;
}

function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryClick,
}: CategoryNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const [highlightStyle, setHighlightStyle] = useState<{ width: number; left: number; height: number }>({ width: 0, left: 0, height: 48 });
  const [isInitialized, setIsInitialized] = useState(false);

  const categoryDisplayNames: Record<string, string> = {
    'COFFEE': 'Кофе',
    'TEA': 'Чай',
    'PASTRY': 'Выпечка',
    'SNACK': 'Закуски',
    'COLD_DRINKS': 'Холодные напитки',
    'FRESH_JUICE': 'Свежевыжатые соки',
    'HOT_BEVERAGES': 'Горячие напитки',
    'LEMONADES': 'Лимонады',
    'OTHER': 'Другое'
  };

  // Update highlight position when active category changes
  useEffect(() => {
    const updateHighlightPosition = () => {
      if (activeButtonRef.current && scrollContainerRef.current) {
        const button = activeButtonRef.current;
        const container = scrollContainerRef.current;
        
        // Get button position relative to container
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate position accounting for container padding
        const containerPadding = 8; // px-2 = 8px padding
        const relativeLeft = buttonRect.left - containerRect.left - containerPadding;
        
        console.log('Highlight positioning:', {
          buttonWidth: button.offsetWidth,
          buttonHeight: button.offsetHeight,
          relativeLeft,
          buttonRect,
          containerRect
        });
        
        setHighlightStyle({
          width: button.offsetWidth,
          left: relativeLeft,
          height: button.offsetHeight
        });

        if (!isInitialized) {
          setIsInitialized(true);
        }

        // Scroll active item into view if needed
        if (buttonRect.left < containerRect.left + 20 || buttonRect.right > containerRect.right - 20) {
          button.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
          
          // Update position after scroll animation with debouncing
          setTimeout(() => {
            if (activeButtonRef.current && scrollContainerRef.current) {
              const newButtonRect = activeButtonRef.current.getBoundingClientRect();
              const newContainerRect = scrollContainerRef.current.getBoundingClientRect();
              const newRelativeLeft = newButtonRect.left - newContainerRect.left - containerPadding;
              
              setHighlightStyle(prev => ({
                ...prev,
                left: newRelativeLeft
              }));
            }
          }, 500);
        }
      }
    };

    updateHighlightPosition();

    // Add a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      updateHighlightPosition();
    }, 50);

    // Handle window resize
    const handleResize = () => {
      setTimeout(updateHighlightPosition, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, [activeCategory]);

  // Update highlight position on scroll
  const handleScroll = () => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const button = activeButtonRef.current;
      const container = scrollContainerRef.current;
      
      // Get button position relative to container
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate position accounting for container padding
      const containerPadding = 8; // px-2 = 8px padding
      const relativeLeft = buttonRect.left - containerRect.left - containerPadding;
      
      // Only update if the button is still in view
      if (relativeLeft >= -button.offsetWidth && relativeLeft <= container.offsetWidth) {
        setHighlightStyle(prev => ({
          ...prev,
          left: relativeLeft
        }));
      }
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-6 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="floating-header">
          <div 
            ref={scrollContainerRef}
            className="relative flex items-center gap-6 overflow-x-auto scrollbar-hide px-2"
            onScroll={handleScroll}
          >
          {/* Liquid highlight background */}
          <div 
            className="absolute top-0 liquid-highlight"
            style={{
              // Set CSS variables for highlight
              // Use scale for pop effect, opacity for fade, and visibility for initial mount
              '--highlight-width': `${highlightStyle.width}px`,
              '--highlight-height': `${highlightStyle.height}px`,
              '--highlight-left': `${highlightStyle.left}px`,
              '--highlight-scale': activeCategory && isInitialized ? 1 : 0.8,
              '--highlight-opacity': activeCategory && isInitialized ? 1 : 0,
              visibility: isInitialized ? 'visible' : 'hidden',
            } as React.CSSProperties}
          />
          
          {categories.map((category) => (
            <button
              key={category}
              ref={activeCategory === category ? activeButtonRef : null}
              onClick={() => onCategoryClick(category)}
              className={`category-nav-item-new ${
                activeCategory === category ? 'active' : ''
              }`}
              type="button"
            >
              {categoryDisplayNames[category] || category}
            </button>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating Cart Component
interface FloatingCartProps {
  itemCount: number;
  totalValue: number;
  onCartClick: () => void;
}

function FloatingCart({ itemCount, totalValue, onCartClick }: FloatingCartProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getItemWord = (count: number): string => {
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
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <button
      onClick={onCartClick}
      className="floating-cart touch-target cursor-pointer"
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

// Product Detail Modal Component
interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);

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
    optionName: string,
    additionalPrice: number,
    type: string
  ) => {
    setSelectedCustomizations(prev => {
      // Remove existing selection for this customization type (since radio buttons should only allow one per type)
      const filtered = prev.filter(c => c.type !== type);
      return [...filtered, {
        customizationId, // This should be the actual ProductCustomization ID (option.id)
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

    console.log('Adding to cart from modal:', cartItem);
    onAddToCart(cartItem);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-10">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="relative flex-shrink-0">
          <div className="relative h-48 bg-gray-100">
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

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
                                option.id, // Use the actual ProductCustomization ID
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

        {/* Fixed Footer with Add to Cart Button */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white shadow-lg">
          <button
            onClick={handleAddToCart}
            className="btn-primary w-full min-h-[64px] text-lg font-bold shadow-xl"
            type="button"
            style={{ 
              background: 'linear-gradient(135deg, #ED6F44 0%, #d85a35 100%)',
              border: 'none',
              fontSize: '1.125rem'
            }}
          >
            <span className="flex items-center justify-between w-full">
              <span>🛒 Добавить в корзину</span>
              <span className="font-bold bg-white/20 px-3 py-1 rounded-full">
                {formatPrice(calculateTotalPrice())}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Screen Component
export default function MainKioskScreen() {
  const { products, getProductsByCategory } = useMenu();
  const { cartItems, addToCart, setStep, getTotalPrice, getTotalItems, currentStep } = useCart();
  
  // All state hooks must be at the top
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Define all available categories - show them all even if empty
  const allCategories = ['COFFEE', 'TEA', 'HOT_BEVERAGES', 'COLD_DRINKS', 'FRESH_JUICE', 'LEMONADES', 'PASTRY', 'SNACK', 'OTHER'];
  
  // Get unique categories from products and combine with all categories
  const categoriesWithProducts = Array.from(new Set(products.map(p => p.category)));
  const categories = allCategories;

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const containerHeight = scrollContainerRef.current.clientHeight;
      const threshold = containerHeight * 0.3;

      let newActiveCategory = activeCategory;

      for (const category of categories) {
        const element = categoryRefs.current[category];
        if (!element) continue;

        const { offsetTop, offsetHeight } = element;
        const elementBottom = offsetTop + offsetHeight;

        if (scrollTop + threshold < elementBottom && scrollTop < offsetTop + offsetHeight) {
          newActiveCategory = category;
          break;
        }
      }

      if (newActiveCategory !== activeCategory) {
        setActiveCategory(newActiveCategory);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [categories, activeCategory]);

  // Handler functions
  const handleCategoryClick = (categorySlug: string) => {
    const element = categoryRefs.current[categorySlug];
    if (element && scrollContainerRef.current) {
      const offsetTop = element.offsetTop - 160; // Adjusted for floating header + padding
      scrollContainerRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product.name, 'Customizations:', product.customizations?.length || 0);
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleQuickAdd = (product: Product) => {
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      quantity: 1,
      customizations: [],
      totalPrice: product.price,
    };
    addToCart(cartItem);
    
    // Show success feedback (you can add a toast notification here)
    console.log(`Added ${product.name} to cart`);
  };

  const totalCartItems = getTotalItems();
  const totalCartValue = getTotalPrice();
  
  // Render different screens based on currentStep
  if (currentStep === 'welcome') {
    return <WelcomeScreen />;
  }
  
  if (currentStep === 'thankyou') {
    return <ThankYouScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <CategoryNavigation
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      <div
        ref={scrollContainerRef}
        className="pt-32 pb-32 h-screen overflow-y-auto custom-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {categories.map((category) => {
            const categoryProducts = getProductsByCategory(category);

            const categoryDisplayNames: Record<string, string> = {
              'COFFEE': 'Кофе',
              'TEA': 'Чай',
              'PASTRY': 'Выпечка',
              'SNACK': 'Закуски',
              'COLD_DRINKS': 'Холодные напитки',
              'FRESH_JUICE': 'Свежевыжатые соки',
              'HOT_BEVERAGES': 'Горячие напитки',
              'LEMONADES': 'Лимонады',
              'OTHER': 'Другое'
            };

            return (
              <div
                key={category}
                ref={(el) => {
                  categoryRefs.current[category] = el;
                }}
                className="mb-16 fade-in-up"
              >
                <h2 className="category-header text-left mb-8">
                  {categoryDisplayNames[category] || category}
                </h2>

                {categoryProducts.length > 0 ? (
                  <div className="products-grid">
                    {categoryProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => handleProductClick(product)}
                        onQuickAdd={handleQuickAdd}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-title text-gray-500 mb-2">Скоро здесь появятся товары</h3>
                    <p className="text-body text-gray-400">
                      В этой категории пока нет доступных товаров
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">☕</div>
                <h3 className="text-title text-gray-600 mb-2">No Menu Available</h3>
                <p className="text-body text-gray-500">
                  Please check back later or contact support.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <FloatingCart
        itemCount={totalCartItems}
        totalValue={totalCartValue}
        onCartClick={handleCartClick}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={handleCloseModal}
          onAddToCart={addToCart}
        />
      )}

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />
    </div>
  );
}
