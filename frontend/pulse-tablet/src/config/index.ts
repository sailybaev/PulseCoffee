export const config = {
  // Backend API URL
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // Default branch ID (you can make this configurable per tablet)
  DEFAULT_BRANCH_ID: process.env.NEXT_PUBLIC_BRANCH_ID || 'default-branch',
  
  // Payment configuration
  PAYMENT: {
    // Enable/disable payment methods
    QR_ENABLED: true,
    CARD_ENABLED: true,
    
    // QR payment settings
    QR_TIMEOUT: 300000, // 5 minutes in milliseconds
    
    // Card payment settings
    STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  },
  
  // UI Configuration
  UI: {
    // Auto-redirect to home screen after order completion
    AUTO_REDIRECT_DELAY: 30000, // 30 seconds
    
    // Show nutritional information
    SHOW_NUTRITION: false,
    
    // Enable multilingual support
    MULTILINGUAL: false,
  },
  
  // Development settings
  DEVELOPMENT: {
    // Use mock data instead of API
    USE_MOCK_DATA: false, // Changed to false to use real API data
    
    // Enable debug logging
    DEBUG: process.env.NODE_ENV === 'development',
  }
};

export default config;
