// Created by CaptainCode - FE-3 Specialist
// Auth store and session management

import { create } from 'zustand';
import { User, AuthSession } from '@/shared/types';
import authService from '@/shared/api/auth.service';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signup: (data: { firstName: string; lastName: string; email: string; password: string; role?: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setSession: (session) =>
    set({
      session,
      isAuthenticated: !!session,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: (data.role as 'learner' | 'instructor' | 'admin') || 'learner',
      });
      
      const user = response.data.user as unknown as User;
      // Ensure user has a role, default to learner if not provided
      if (!user.role) {
        user.role = (data.role as any) || 'learner';
      }
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    } catch (error: any) {
      set({
        error: error.message || 'Signup failed',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      set({
        user: response.data.user as unknown as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      // Clear remember me flag on logout
      localStorage.removeItem('rememberMe');
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      // Clear data even if logout API fails
      localStorage.removeItem('rememberMe');
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        error: error.message || 'Logout failed',
        isLoading: false,
      });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        set({ isLoading: false });
        return;
      }

      if (storedUser) {
        set({
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      }

      // Verify token with backend
      try {
        const currentUser = await authService.getCurrentUser();
        set({
          user: currentUser as unknown as User,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // Token might be expired, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
