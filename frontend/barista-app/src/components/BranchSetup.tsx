'use client';

import { useState, useEffect } from 'react';
import { BranchValidator, BranchInitializer, Branch } from '../services/branchService';
import LoadingSpinner from './LoadingSpinner';

interface BranchSetupProps {
  onComplete: (branchId: string) => void;
  onError: (error: string) => void;
}

export default function BranchSetup({ onComplete, onError }: BranchSetupProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const branchList = await BranchValidator.getBranches();
      setBranches(branchList.filter(b => b.isActive !== false)); // Include branches where isActive is true or undefined
    } catch (error) {
      onError('Failed to load branches. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupBranch = async () => {
    if (!selectedBranchId) {
      onError('Please select a branch');
      return;
    }

    try {
      setIsRegistering(true);
      await BranchInitializer.setBranchAndRegister(selectedBranchId);
      onComplete(selectedBranchId);
    } catch (error) {
      console.error('Branch setup error:', error);
      onError('Failed to setup branch. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAdminUnlock = async () => {
    try {
      const success = await BranchInitializer.adminUnlock(adminPassword);
      if (success) {
        setShowAdminUnlock(false);
        setAdminPassword('');
        await loadBranches();
      } else {
        onError('Invalid admin password');
      }
    } catch (error) {
      onError('Admin unlock failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-cream">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-coffee-brown font-medium">Loading branches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-coffee-brown rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Barista App Setup</h1>
            <p className="text-gray-600">Select your branch to get started</p>
          </div>

          {!showAdminUnlock ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Branch
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="input-field"
                  disabled={isRegistering}
                >
                  <option value="">Choose a branch...</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSetupBranch}
                  disabled={!selectedBranchId || isRegistering}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isRegistering ? (
                    <>
                      <LoadingSpinner size="small" color="text-white" className="mr-2" />
                      Setting up...
                    </>
                  ) : (
                    'Setup Branch'
                  )}
                </button>

                <button
                  onClick={() => setShowAdminUnlock(true)}
                  className="w-full btn-secondary text-sm"
                >
                  Admin Override
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter admin password"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminUnlock()}
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAdminUnlock}
                  disabled={!adminPassword}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  Unlock
                </button>

                <button
                  onClick={() => {
                    setShowAdminUnlock(false);
                    setAdminPassword('');
                  }}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
