/**
 * Authentication API Service
 * Handles all auth-related API calls to the backend
 */

import axios from 'axios';
import { API_BASE_URL } from './config';

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Add token to requests
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

// Handle token refresh on 401
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        localStorage.setItem('authToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);

        return authAPI(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'learner' | 'instructor' | 'admin';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role?: string;
      status?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  meta: {
    message: string;
  };
}

class AuthService {
  /**
   * Sign up a new user
   */
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    try {
      const response = await authAPI.post('/signup', payload);
      
      // Store tokens
      localStorage.setItem('authToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Log in with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await authAPI.post('/login', payload);
      
      // Store tokens
      localStorage.setItem('authToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      const response = await authAPI.get('/me');
      return response.data.data.user;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string, email?: string) {
    try {
      const response = await authAPI.post('/verify-email', { token, email });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    try {
      const response = await authAPI.post('/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    try {
      const response = await authAPI.post('/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string, passwordConfirm: string) {
    try {
      const response = await authAPI.post('/reset-password', {
        token,
        password,
        passwordConfirm,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await authAPI.post('/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error: any) {
      // Still clear storage even if logout fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw this.handleError(error);
    }
  }

  /**
   * Error handler
   */
  private handleError(error: any) {
    if (error.message === 'Network Error') {
      return new Error('Network Error: unable to reach the backend API');
    }
    if (error.response?.data?.error?.message) {
      return new Error(error.response.data.error.message);
    }
    if (error.response?.status === 409) {
      return new Error('Email already registered');
    }
    if (error.response?.status === 401) {
      return new Error('Invalid email or password');
    }
    if (error.response?.status === 400) {
      return new Error('Invalid input. Please check your information.');
    }
    return error;
  }
}

export const authService = new AuthService();
export default authService;
