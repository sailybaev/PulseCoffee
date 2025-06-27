'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, OrderStep, SelectedCustomization } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  currentStep: OrderStep;
  customerName: string;
  selectedProductId: string | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  setStep: (step: OrderStep) => void;
  setCustomerName: (name: string) => void;
  setSelectedProductId: (productId: string | null) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState<OrderStep>('welcome');
  const [customerName, setCustomerName] = useState('');
  const [selectedProductId, setSelectedProductIdState] = useState<string | null>(null);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    setCartItems(prev => 
      prev.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              quantity, 
              totalPrice: (item.basePrice + item.customizations.reduce((sum, c) => sum + c.additionalPrice, 0)) * quantity 
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerName('');
    setSelectedProductIdState(null);
    setCurrentStep('welcome');
  };

  const setStep = (step: OrderStep) => {
    setCurrentStep(step);
  };

  const setSelectedProductId = (productId: string | null) => {
    setSelectedProductIdState(productId);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      currentStep,
      customerName,
      selectedProductId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setStep,
      setCustomerName: setCustomerName,
      setSelectedProductId,
      getTotalPrice,
      getTotalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};
