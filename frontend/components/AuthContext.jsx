'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/app/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const store = useAuthStore();
  const router = useRouter();

  // Run initAuth on app mount
  useEffect(() => {
    store.initAuth();
  }, []);

  const login = async (email, password) => {
    useAuthStore.setState({ isLoading: true });
    try {
      const data = await api.auth.login({ email, password });
      
      // Update Zustand store
      store.login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      
      // Redirect based on role
      if (data.user.role === 'provider') {
        router.push('/dashboard');
      } else {
        router.push('/browse');
      }
      return data.user;
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      useAuthStore.setState({ isLoading: false });
      throw error;
    }
  };

  const register = async (userData) => {
    useAuthStore.setState({ isLoading: true });
    try {
      const data = await api.auth.register(userData);
      
      // Update Zustand store
      store.login(data.user, data.token);
      toast.success(`Welcome to Nexora, ${data.user.name}!`);
      
      // Redirect based on role
      if (data.user.role === 'provider') {
        router.push('/dashboard/profile');
      } else {
        router.push('/browse');
      }
      return data.user;
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      useAuthStore.setState({ isLoading: false });
      throw error;
    }
  };

  const logout = () => {
    store.logout();
    toast.success('Logged out successfully.');
    router.push('/');
  };

  const updateProfileInState = (updatedUser) => {
    useAuthStore.setState({ user: updatedUser });
    if (typeof window !== 'undefined') {
      localStorage.setItem('companion_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user: store.user, 
      token: store.token, 
      loading: store.isLoading, 
      login, 
      register, 
      logout, 
      updateProfileInState 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
