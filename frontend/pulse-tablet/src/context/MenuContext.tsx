'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product, Customization } from '../types';
import { apiService } from '../services/api';
import { mockProducts } from '../data/menu';
import config from '../config';

interface MenuContextType {
  products: Product[];
  allCustomizations: Map<string, any[]>; // productId -> customizations
  loading: boolean;
  error: string | null;
  getProductsByCategory: (category: string) => Product[];
  getProductById: (id: string) => Product | undefined;
  getProductCustomizations: (productId: string) => any[];
  refreshMenuData: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};

interface MenuProviderProps {
  children: ReactNode;
}

// Cache keys for localStorage
const CACHE_KEYS = {
  PRODUCTS: 'pulse_tablet_products',
  CUSTOMIZATIONS: 'pulse_tablet_customizations',
  CACHE_TIMESTAMP: 'pulse_tablet_cache_timestamp',
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Convert API product to frontend product type
const convertApiProductToProduct = async (
  apiProduct: any, 
  customizationsMap: Map<string, any[]>
): Promise<Product> => {
  const productCustomizations = customizationsMap.get(apiProduct.id) || [];
  
  // Group customizations by type
  const customizationsByType = productCustomizations.reduce((acc, custom) => {
    if (!acc[custom.type]) {
      acc[custom.type] = [];
    }
    acc[custom.type].push({
      id: custom.id,
      name: custom.name,
      additionalPrice: custom.price || 0
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Convert to frontend structure
  const customizations: Customization[] = Object.entries(customizationsByType).map(([type, options]) => ({
    id: `${apiProduct.id}-${type}`,
    type: type as any,
    name: getCustomizationTypeName(type),
    options: options as any[]
  }));

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description || '',
    price: apiProduct.basePrice || apiProduct.price || 0,
    category: apiProduct.category,
    imageUrl: apiProduct.imageUrl,
    customizations
  };
};

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

// Check if cache is valid
const isCacheValid = (): boolean => {
  const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
  if (!timestamp) return false;
  
  const cacheTime = parseInt(timestamp, 10);
  return Date.now() - cacheTime < CACHE_DURATION;
};

// Load data from cache
const loadFromCache = (): { products: Product[], customizations: Map<string, any[]> } | null => {
  try {
    if (!isCacheValid()) return null;

    const cachedProducts = localStorage.getItem(CACHE_KEYS.PRODUCTS);
    const cachedCustomizations = localStorage.getItem(CACHE_KEYS.CUSTOMIZATIONS);

    if (!cachedProducts || !cachedCustomizations) return null;

    const products = JSON.parse(cachedProducts);
    const customizationsArray = JSON.parse(cachedCustomizations);
    const customizations = new Map<string, any[]>(customizationsArray);

    return { products, customizations };
  } catch (error) {
    console.error('Failed to load from cache:', error);
    return null;
  }
};

// Save data to cache
const saveToCache = (products: Product[], customizations: Map<string, any[]>) => {
  try {
    localStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(CACHE_KEYS.CUSTOMIZATIONS, JSON.stringify([...customizations]));
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error('Failed to save to cache:', error);
  }
};

// Clear cache
const clearCache = () => {
  localStorage.removeItem(CACHE_KEYS.PRODUCTS);
  localStorage.removeItem(CACHE_KEYS.CUSTOMIZATIONS);
  localStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
};

export const MenuProvider = ({ children }: MenuProviderProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCustomizations, setAllCustomizations] = useState<Map<string, any[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenuData = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      if (useCache) {
        const cachedData = loadFromCache();
        if (cachedData) {
          setProducts(cachedData.products);
          setAllCustomizations(cachedData.customizations);
          setLoading(false);
          return;
        }
      }

      if (config.DEVELOPMENT.USE_MOCK_DATA) {
        // Use mock data
        setProducts(mockProducts);
        
        // Extract customizations from mock products
        const customizationsMap = new Map<string, any[]>();
        mockProducts.forEach(product => {
          if (product.customizations) {
            // Convert frontend customizations back to API format for consistency
            const apiCustomizations = product.customizations.flatMap(customization => 
              customization.options.map(option => ({
                id: option.id,
                type: customization.type,
                name: option.name,
                price: option.additionalPrice,
                isAvailable: true
              }))
            );
            customizationsMap.set(product.id, apiCustomizations);
          }
        });
        setAllCustomizations(customizationsMap);

        // Save mock data to cache
        saveToCache(mockProducts, customizationsMap);
      } else {
        // Fetch from API
        const [apiProducts, allProductCustomizations] = await Promise.all([
          apiService.getProducts(),
          Promise.all(
            (await apiService.getProducts()).map(async (product) => ({
              productId: product.id,
              customizations: await apiService.getProductCustomizations(product.id)
            }))
          )
        ]);

        // Create customizations map
        const customizationsMap = new Map<string, any[]>();
        allProductCustomizations.forEach(({ productId, customizations }) => {
          customizationsMap.set(productId, customizations);
        });

        // Convert products with their customizations
        const convertedProducts = await Promise.all(
          apiProducts.map(product => convertApiProductToProduct(product, customizationsMap))
        );

        setProducts(convertedProducts);
        setAllCustomizations(customizationsMap);

        // Save to cache
        saveToCache(convertedProducts, customizationsMap);
      }
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
      setError('Failed to load menu data');
      
      // Fallback to mock data if API fails
      setProducts(mockProducts);
      const customizationsMap = new Map<string, any[]>();
      mockProducts.forEach(product => {
        if (product.customizations) {
          const apiCustomizations = product.customizations.flatMap(customization => 
            customization.options.map(option => ({
              id: option.id,
              type: customization.type,
              name: option.name,
              price: option.additionalPrice,
              isAvailable: true
            }))
          );
          customizationsMap.set(product.id, apiCustomizations);
        }
      });
      setAllCustomizations(customizationsMap);
    } finally {
      setLoading(false);
    }
  };

  const refreshMenuData = async () => {
    clearCache();
    await loadMenuData(false);
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getProductCustomizations = (productId: string) => {
    return allCustomizations.get(productId) || [];
  };

  return (
    <MenuContext.Provider value={{
      products,
      allCustomizations,
      loading,
      error,
      getProductsByCategory,
      getProductById,
      getProductCustomizations,
      refreshMenuData,
    }}>
      {children}
    </MenuContext.Provider>
  );
};
