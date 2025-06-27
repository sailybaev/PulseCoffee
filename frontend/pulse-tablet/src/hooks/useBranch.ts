'use client';

import { useState, useEffect } from 'react';
import { BranchConfig, BranchValidator } from '../services/branchService';
import type { Branch } from '../services/branchService';
import type { ApiOrderResponse, ApiProduct } from '../services/api';

interface UseBranchReturn {
  branchId: string | null;
  branchInfo: Branch | null;
  isLoading: boolean;
  error: string | null;
  refreshBranchInfo: () => Promise<void>;
  isValidBranch: boolean;
}

export function useBranch(): UseBranchReturn {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [branchInfo, setBranchInfo] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidBranch, setIsValidBranch] = useState(false);

  const refreshBranchInfo = async () => {
    const currentBranchId = BranchConfig.getBranchId();
    console.log('useBranch - refreshBranchInfo called, branch ID:', currentBranchId);
    setBranchId(currentBranchId);

    if (!currentBranchId) {
      console.log('useBranch - No branch ID found');
      setBranchInfo(null);
      setIsValidBranch(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate branch is still valid
      console.log('useBranch - Validating branch:', currentBranchId);
      const isValid = await BranchValidator.validateBranch(currentBranchId);
      console.log('useBranch - Branch validation result:', isValid);
      setIsValidBranch(isValid);

      if (isValid) {
        // Get branch details
        console.log('useBranch - Getting branch details');
        const branches = await BranchValidator.getBranches();
        const branch = branches.find(b => b.id === currentBranchId);
        console.log('useBranch - Found branch:', branch);
        setBranchInfo(branch || null);
      } else {
        setBranchInfo(null);
        setError('Branch validation failed');
      }
    } catch (err: any) {
      console.error('useBranch - Error during refresh:', err);
      setError(err.message || 'Failed to fetch branch info');
      setBranchInfo(null);
      setIsValidBranch(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBranchInfo();

    // Listen for branch changes (if implemented)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'TABLET_BRANCH_ID') {
        refreshBranchInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    branchId,
    branchInfo,
    isLoading,
    error,
    refreshBranchInfo,
    isValidBranch
  };
}

export function useBranchOrders() {
  const { branchId, isValidBranch } = useBranch();
  const [orders, setOrders] = useState<ApiOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (status?: string) => {
    if (!branchId || !isValidBranch) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { apiService } = await import('../services/api');
      const branchOrders = await apiService.getOrdersForCurrentBranch(status);
      setOrders(branchOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (branchId && isValidBranch) {
      fetchOrders();
    }
  }, [branchId, isValidBranch]);

  return {
    orders,
    isLoading,
    error,
    refreshOrders: fetchOrders
  };
}

export function useBranchProducts() {
  const { branchId, isValidBranch } = useBranch();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!branchId || !isValidBranch) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { apiService } = await import('../services/api');
      const branchProducts = await apiService.getProductsForCurrentBranch();
      setProducts(branchProducts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (branchId && isValidBranch) {
      fetchProducts();
    }
  }, [branchId, isValidBranch]);

  return {
    products,
    isLoading,
    error,
    refreshProducts: fetchProducts
  };
}
