'use client';

import { useState, useEffect } from 'react';
import { Product, Customization } from '../types';
import { apiService } from '../services/api';
import { mockProducts } from '../data/menu';
import config from '../config';

// Convert API product to frontend product type
const convertApiProductToProduct = async (apiProduct: any): Promise<Product> => {
  let customizations: Customization[] = [];
  
  try {
    // Fetch customizations for this product
    const apiCustomizations = await apiService.getProductCustomizations(apiProduct.id);
    
    // Group customizations by type
    const customizationsByType = apiCustomizations.reduce((acc, custom) => {
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
    customizations = Object.entries(customizationsByType).map(([type, options]) => ({
      id: `${apiProduct.id}-${type}`,
      type: type as any,
      name: getCustomizationTypeName(type),
      options
    }));
  } catch (error) {
    console.error(`Failed to fetch customizations for product ${apiProduct.id}:`, error);
  }

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

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (config.DEVELOPMENT.USE_MOCK_DATA) {
          // Use mock data
          setProducts(mockProducts);
        } else {
          // Fetch from API
          const apiProducts = await apiService.getProducts();
          const convertedProducts = await Promise.all(
            apiProducts.map(convertApiProductToProduct)
          );
          setProducts(convertedProducts);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
        // Fallback to mock data if API fails
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  return {
    products,
    loading,
    error,
    getProductsByCategory,
    getProductById,
  };
};

export const useProductCustomizations = (productId: string | null) => {
  const [customizations, setCustomizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomizations = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);

        if (config.DEVELOPMENT.USE_MOCK_DATA) {
          // Use mock data - find product and return its customizations
          const mockProduct = mockProducts.find(p => p.id === productId);
          setCustomizations(mockProduct?.customizations || []);
        } else {
          // Fetch from API - return raw API data for CustomizeScreen
          const apiCustomizations = await apiService.getProductCustomizations(productId);
          console.log('useProductCustomizations - Fetched customizations for', productId, ':', apiCustomizations);
          setCustomizations(apiCustomizations);
        }
      } catch (err) {
        console.error('Failed to fetch customizations:', err);
        setError('Failed to load customizations');
        // Fallback to mock data
        const mockProduct = mockProducts.find(p => p.id === productId);
        setCustomizations(mockProduct?.customizations || []);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomizations();
  }, [productId]);

  return {
    customizations,
    loading,
    error,
  };
};
