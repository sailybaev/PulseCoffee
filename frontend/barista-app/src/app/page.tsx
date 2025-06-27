'use client';

import { useState, useEffect } from 'react';
import { AppProvider } from '../context/AppContext';
import { BranchInitializer } from '../services/branchService';
import { authService } from '../services/authService';
import BranchSetup from '../components/BranchSetup';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import ApiTest from '../components/ApiTest';

type AppState = 'loading' | 'branch-setup' | 'login' | 'dashboard' | 'error';

interface AppError {
  message: string;
  showApiTest?: boolean;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [branchId, setBranchId] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [showApiTest, setShowApiTest] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setAppState('loading');
      setError(null);

      // Check if branch is configured
      let currentBranchId: string;
      try {
        currentBranchId = await BranchInitializer.initialize();
        setBranchId(currentBranchId);
      } catch (branchError) {
        console.log('Branch not configured:', branchError);
        setAppState('branch-setup');
        return;
      }

      // 2. Check authentication
      if (!authService.isAuthenticated()) {
        setAppState('login');
        return;
      }

      // 3. Validate token
      const isValidToken = await authService.validateToken();
      if (!isValidToken) {
        setAppState('login');
        return;
      }

      // 4. Check if user is barista
      if (!authService.isBarista()) {
        setError({
          message: 'Access denied. This app is for baristas only.',
          showApiTest: false,
        });
        setAppState('error');
        return;
      }

      // All checks passed, go to dashboard
      setAppState('dashboard');
    } catch (err) {
      console.error('App initialization error:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to initialize app',
        showApiTest: true,
      });
      setAppState('error');
    }
  };

  const handleBranchSetupComplete = (newBranchId: string) => {
    setBranchId(newBranchId);
    setAppState('login');
  };

  const handleLoginComplete = () => {
    setAppState('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setAppState('login');
  };

  const handleError = (errorMessage: string) => {
    setError({
      message: errorMessage,
      showApiTest: errorMessage.includes('fetch') || errorMessage.includes('404') || errorMessage.includes('Failed to'),
    });
    setAppState('error');
  };

  const renderCurrentState = () => {
    switch (appState) {
      case 'loading':
        return (
          <div className="min-h-screen flex items-center justify-center bg-coffee-cream">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-coffee-brown font-medium">Initializing Barista App...</p>
            </div>
          </div>
        );

      case 'branch-setup':
        return <BranchSetup onComplete={handleBranchSetupComplete} onError={handleError} />;

      case 'login':
        return (
          <LoginForm 
            branchId={branchId} 
            onComplete={handleLoginComplete} 
            onError={handleError}
          />
        );

      case 'dashboard':
        return (
          <Dashboard 
            branchId={branchId!} 
            onLogout={handleLogout}
            onError={handleError}
          />
        );

      case 'error':
        return (
          <div className="min-h-screen bg-coffee-cream p-4">
            <div className="max-w-2xl mx-auto pt-20">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">App Error</h1>
                  <p className="text-red-600 mb-4">{error?.message}</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={initializeApp}
                    className="w-full btn-primary"
                  >
                    Retry
                  </button>

                  {error?.showApiTest && (
                    <button
                      onClick={() => setShowApiTest(!showApiTest)}
                      className="w-full btn-secondary"
                    >
                      {showApiTest ? 'Hide' : 'Show'} API Test
                    </button>
                  )}

                  <button
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full btn-secondary text-sm"
                  >
                    Reset App Data
                  </button>
                </div>

                {showApiTest && (
                  <div className="mt-6">
                    <ApiTest />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppProvider>
      {renderCurrentState()}
    </AppProvider>
  );
}
