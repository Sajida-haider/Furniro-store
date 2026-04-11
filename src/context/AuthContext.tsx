'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; username: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then((userData) => setUser(userData))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    localStorage.setItem('token', response.access_token);
    setUser(response.user);
  }, []);

  const signup = useCallback(async (data: { email: string; username: string; password: string; full_name?: string }) => {
    const response = await api.signup(data);
    localStorage.setItem('token', response.access_token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    refreshUser: async () => {},
  } as AuthContextType;
}
