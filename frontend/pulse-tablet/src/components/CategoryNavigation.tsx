'use client';

import { useMemo } from 'react';

interface Category {
  slug: string;
  name: string;
}

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onCategoryClick: (categorySlug: string) => void;
}

export default function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryClick,
}: CategoryNavigationProps) {
  // Convert category enum to display names
  const categoryDisplayNames = useMemo(() => ({
    'COFFEE': 'Кофе',
    'TEA': 'Чай',
    'PASTRY': 'Выпечка',
    'SNACK': 'Закуски',
    'COLD_DRINKS': 'Холодные напитки',
    'FRESH_JUICE': 'Свежевыжатые соки',
    'HOT_BEVERAGES': 'Горячие напитки',
    'LEMONADES': 'Лимонады',
    'OTHER': 'Другое'
  }), []);

  const processedCategories = useMemo(() => {
    return categories.map(category => ({
      slug: category.slug || category.name,
      name: categoryDisplayNames[category.name as keyof typeof categoryDisplayNames] || category.name
    }));
  }, [categories, categoryDisplayNames]);

  if (processedCategories.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="glass-nav rounded-2xl p-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {processedCategories.map((category) => (
              <button
                key={category.slug}
                onClick={() => onCategoryClick(category.slug)}
                className={`category-nav-item ${
                  activeCategory === category.slug ? 'active' : ''
                }`}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
