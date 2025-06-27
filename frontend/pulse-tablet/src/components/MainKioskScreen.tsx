'use client';

import { useState, useRef, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import ProductCard from './ProductCard';
import CategoryNavigation from './CategoryNavigation';
import FloatingCart from './FloatingCart';
import ProductDetailModal from './ProductDetailModal';

interface Category {
  slug: string;
  name: string;
}

export default function MainKioskScreen() {
  const { products, getProductsByCategory } = useMenu();
  const { cartItems, getTotalPrice, getTotalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Extract unique categories from products
  const categories: Category[] = Array.from(
    new Set(products.map(product => product.category))
  ).map(category => ({
    slug: category,
    name: category
  }));

  // Set initial active category when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].slug);
    }
  }, [categories, activeCategory]);

  // Handle scroll-based category highlighting
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const containerHeight = scrollContainerRef.current.clientHeight;
      const threshold = containerHeight * 0.3; // Category becomes active when 30% visible

      let newActiveCategory = activeCategory;

      for (const category of categories) {
        const element = categoryRefs.current[category.slug];
        if (!element) continue;

        const { offsetTop, offsetHeight } = element;
        const elementBottom = offsetTop + offsetHeight;

        // Check if category is in the viewport
        if (scrollTop + threshold < elementBottom && scrollTop < offsetTop + offsetHeight) {
          newActiveCategory = category.slug;
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

  const handleCategoryClick = (categorySlug: string) => {
    const element = categoryRefs.current[categorySlug];
    if (element && scrollContainerRef.current) {
      const offsetTop = element.offsetTop - 120; // Account for sticky nav
      scrollContainerRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const totalCartItems = getTotalItems();
  const totalCartValue = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Category Navigation */}
      <CategoryNavigation
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      {/* Main Content */}
      <div
        ref={scrollContainerRef}
        className="pt-24 pb-32 h-screen overflow-y-auto custom-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {categories.map((category) => {
            const categoryProducts = getProductsByCategory(category.slug);
            
            if (categoryProducts.length === 0) return null;

            return (
              <div
                key={category.slug}
                ref={(el) => {
                  categoryRefs.current[category.slug] = el;
                }}
                className="mb-16 fade-in-up"
              >
                {/* Category Header */}
                <h2 className="category-header text-left mb-8">
                  {category.name}
                </h2>

                {/* Products Grid */}
                <div className="products-grid">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => handleProductClick(product)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
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

      {/* Floating Cart Button */}
      <FloatingCart
        itemCount={totalCartItems}
        totalValue={totalCartValue}
        disabled={totalCartItems === 0}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
