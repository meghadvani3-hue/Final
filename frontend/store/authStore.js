import { create } from 'zustand';
import axiosInstance from '@/lib/axios';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true, // Default to true while we verify session

  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('companion_token', token);
      localStorage.setItem('companion_user', JSON.stringify(user));
      
      // Set cookie for Next.js middleware access (expires in 7 days)
      document.cookie = `companion_token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;
    }
    set({ user, token, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('companion_token');
      localStorage.removeItem('companion_user');
      
      // Remove cookie
      document.cookie = 'companion_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    set({ user: null, token: null, isLoading: false });
  },

  initAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem('companion_token');
    const storedUser = localStorage.getItem('companion_user');

    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    // Load persisted state immediately to avoid layout shifts
    let cachedUser = null;
    if (storedUser) {
      try {
        cachedUser = JSON.parse(storedUser);
      } catch (err) {
        cachedUser = null;
      }
    }

    set({ token, user: cachedUser, isLoading: true });

    // Validate token with server to check if it has expired
    try {
      const response = await axiosInstance.get('/api/auth/me');
      const freshUser = response.data.user;
      
      localStorage.setItem('companion_user', JSON.stringify(freshUser));
      set({ user: freshUser, token, isLoading: false });
    } catch (error) {
      console.warn('Authentication token validation failed:', error.message);
      // If server returned 401/403, clear credentials and log out
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        get().logout();
      } else {
        // For other network/server errors (e.g. offline), we keep the cached session
        set({ isLoading: false });
      }
    }
  }
}));
