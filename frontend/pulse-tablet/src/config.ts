const config = {
  DEVELOPMENT: {
    USE_MOCK_DATA: false,
    DEBUG: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true',
  },
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  CACHE: {
    DURATION: 5 * 60 * 1000, // 5 minutes
  },
};

export default config;
