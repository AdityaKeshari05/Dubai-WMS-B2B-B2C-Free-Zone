'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAccessToken } from '@/lib/api';
import { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, code?: string, challenge?: string) => Promise<{ requiresTwoFactor?: boolean; challenge?: string }>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName: string;
  companyPhone?: string;
  country?: string;
  currency?: string;
  slug: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.post('/auth/refresh').then((res) => {
      const payload = res.data.data;
      setAccessToken(payload.accessToken);
      setToken(payload.accessToken);
      setUser(payload.user);
    }).catch(() => setAccessToken(null)).finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string, code?: string, challenge?: string) => {
    const res = code && challenge
      ? await api.post('/auth/login/2fa', { code, challenge })
      : await api.post<{ success: boolean; data: AuthResponse & { requiresTwoFactor?: boolean; challenge?: string } }>('/auth/login', { email, password });
    if (res.data.data.requiresTwoFactor) return res.data.data;
    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(user);
    setToken(accessToken);
    return {};
  };

  const register = async (data: RegisterData) => {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data);
    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(user);
    setToken(accessToken);
    return res.data.data;
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => null);
    setAccessToken(null);
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
