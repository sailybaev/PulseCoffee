'use client';

import { useState } from 'react';
import { authService, LoginCredentials, RegisterCredentials } from '../services/authService';
import { audioService } from '../services/audioService';
import LoadingSpinner from './LoadingSpinner';
import RegisterForm from './RegisterForm';

interface LoginFormProps {
  branchId: string | null;
  onComplete: () => void;
  onError: (error: string) => void;
}

export default function LoginForm({ branchId, onComplete, onError }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    phoneNumber: '+1234567891',
    password: 'password123',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return (
      <div className="min-h-screen bg-coffee-cream flex items-center justify-center p-4">
        <RegisterForm
          onSuccess={() => {
            setShowRegister(false);
            onComplete();
          }}
          onCancel={() => setShowRegister(false)}
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.phoneNumber || !credentials.password) {
      onError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await authService.login(credentials);
      
      if (!response.user.role || (response.user.role !== 'BARISTA' && response.user.role !== 'ADMIN')) {
        onError('Access denied. This app is for baristas only.');
        return;
      }

      // Enable audio after user interaction
      await audioService.enableAudio();
      
      onComplete();
    } catch (error) {
      console.error('Login error:', error);
      onError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-coffee-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-coffee-brown rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Barista Login</h1>
            <p className="text-gray-600">
              {branchId ? `Branch: ${branchId}` : 'Access the barista dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={credentials.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="input-field"
                placeholder="+7 xxx xxx xxxx"
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !credentials.phoneNumber || !credentials.password}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" color="text-white" className="mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Only authorized baristas can access this application
            </p>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Need to create a test user? Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
