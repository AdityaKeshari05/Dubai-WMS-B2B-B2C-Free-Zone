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
  const [user, setUser] = useState<User | null>({
    id: 'demo-user-id',
    firstName: 'Demo',
    lastName: 'Admin',
    email: 'admin@example.com',
    role: 'Warehouse Admin',
  } as any);

  const [token, setToken] = useState<string | null>('demo-token');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Disabled backend validation for demo mode
  }, []);

  const login = async (email: string, password: string, code?: string, challenge?: string) => {
    const res = code && challenge
      ? await api.post('/auth/login/2fa', { code, challenge })
      : await api.post<{ success: boolean; data: AuthResponse & { requiresTwoFactor?: boolean; challenge?: string } }>('/auth/login', { email, password });
    if (res.data?.data?.requiresTwoFactor) return res.data.data;

    const payload = res.data?.data;
    const userData = payload?.user || null;
    const jwtToken = payload?.accessToken || payload?.token || null;

    setAccessToken(jwtToken);
    setUser(userData);
    setToken(jwtToken);

    if (typeof window !== 'undefined') {
      try {
        if (jwtToken) localStorage.setItem('token', jwtToken);
        if (userData) localStorage.setItem('user', JSON.stringify(userData));
      } catch {}
    }

    return {};
  };

  const register = async (data: RegisterData) => {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data);
    const payload = res.data?.data;
    const userData = payload?.user || null;
    const jwtToken = payload?.accessToken || payload?.token || null;

    setAccessToken(jwtToken);
    setUser(userData);
    setToken(jwtToken);

    if (typeof window !== 'undefined') {
      try {
        if (jwtToken) localStorage.setItem('token', jwtToken);
        if (userData) localStorage.setItem('user', JSON.stringify(userData));
      } catch {}
    }

    return res.data.data;
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => null);
    setAccessToken(null);
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
    }
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
