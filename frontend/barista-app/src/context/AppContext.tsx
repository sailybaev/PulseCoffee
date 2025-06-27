'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Order, OrderStatus } from '../services/orderService';
import { User } from '../services/authService';

interface AppState {
  user: User | null;
  branchId: string | null;
  branchName: string | null;
  orders: Order[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  selectedOrderId: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_BRANCH'; payload: { id: string; name: string } }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: { orderId: string; order: Partial<Order> } }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_ORDER'; payload: string | null }
  | { type: 'CLEAR_STATE' };

const initialState: AppState = {
  user: null,
  branchId: null,
  branchName: null,
  orders: [],
  isConnected: false,
  isLoading: false,
  error: null,
  selectedOrderId: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_BRANCH':
      return {
        ...state,
        branchId: action.payload.id,
        branchName: action.payload.name,
      };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    case 'ADD_ORDER':
      // Check if order already exists to avoid duplicates
      const orderExists = state.orders.some(order => order.id === action.payload.id);
      if (orderExists) {
        return state;
      }
      return {
        ...state,
        orders: [action.payload, ...state.orders],
      };
    
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, ...action.payload.order }
            : order
        ),
      };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SELECT_ORDER':
      return { ...state, selectedOrderId: action.payload };
    
    case 'CLEAR_STATE':
      return initialState;
    
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setUser: (user: User | null) => void;
    setBranch: (id: string, name: string) => void;
    setOrders: (orders: Order[]) => void;
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, order: Partial<Order>) => void;
    setConnectionStatus: (connected: boolean) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    selectOrder: (orderId: string | null) => void;
    clearState: () => void;
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', payload: user }),
    setBranch: (id: string, name: string) => dispatch({ type: 'SET_BRANCH', payload: { id, name } }),
    setOrders: (orders: Order[]) => dispatch({ type: 'SET_ORDERS', payload: orders }),
    addOrder: (order: Order) => dispatch({ type: 'ADD_ORDER', payload: order }),
    updateOrder: (orderId: string, order: Partial<Order>) => 
      dispatch({ type: 'UPDATE_ORDER', payload: { orderId, order } }),
    setConnectionStatus: (connected: boolean) => 
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: connected }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    selectOrder: (orderId: string | null) => dispatch({ type: 'SELECT_ORDER', payload: orderId }),
    clearState: () => dispatch({ type: 'CLEAR_STATE' }),
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
