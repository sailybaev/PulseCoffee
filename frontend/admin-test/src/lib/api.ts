import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // Use the Next.js rewrite proxy
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth header
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const originalRequest = error.config
      
      // Don't retry refresh endpoint
      if (originalRequest.url?.includes('/auth/refresh')) {
        localStorage.removeItem('accessToken')
        return Promise.reject(error)
      }

      try {
        const response = await api.post('/auth/refresh')
        const newToken = response.data.accessToken
        localStorage.setItem('accessToken', newToken)
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api.request(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        window.location.reload()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api
