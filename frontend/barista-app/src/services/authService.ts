export interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  role: 'BARISTA' | 'ADMIN' | 'CLIENT';
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterCredentials {
  name: string;
  phoneNumber: string;
  password: string;
}

class AuthService {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = typeof window !== 'undefined' 
      ? (window as any).__NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      : 'http://localhost:3000/api';
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Include cookies for refresh token
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const loginResponse: LoginResponse = await response.json();
      
      // Store token and user data
      localStorage.setItem('auth_token', loginResponse.accessToken);
      localStorage.setItem('user_data', JSON.stringify(loginResponse.user));
      
      return loginResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Include cookies for refresh token
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const registerResponse: LoginResponse = await response.json();
      
      // Store token and user data
      localStorage.setItem('auth_token', registerResponse.accessToken);
      localStorage.setItem('user_data', JSON.stringify(registerResponse.user));
      
      return registerResponse;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser(): User | null {
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  isBarista(): boolean {
    const user = this.getUser();
    return user?.role === 'BARISTA' || user?.role === 'ADMIN';
  }

  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      console.log('🔐 No token found for validation');
      return false;
    }

    try {
      // Check if token is expired by decoding it
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      
      console.log('🔐 Token validation:', {
        exp: payload.exp,
        currentTime,
        expired: payload.exp < currentTime,
        timeLeft: payload.exp - currentTime
      });
      
      if (payload.exp < currentTime) {
        console.log('🔐 Token is expired, attempting refresh');
        return await this.refreshToken();
      }
      
      console.log('🔐 Token is valid');
      return true;
    } catch (error) {
      console.error('🔐 Token validation error:', error);
      // Try to refresh token as fallback
      return await this.refreshToken();
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      console.log('🔄 Attempting to refresh token...');
      const response = await fetch(`${this.apiUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies for refresh token
      });

      console.log('🔄 Refresh response status:', response.status);

      if (!response.ok) {
        console.error('🔄 Token refresh failed:', response.status, response.statusText);
        this.logout();
        return false;
      }

      const { accessToken } = await response.json();
      localStorage.setItem('auth_token', accessToken);
      console.log('🔄 Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('🔄 Token refresh error:', error);
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
