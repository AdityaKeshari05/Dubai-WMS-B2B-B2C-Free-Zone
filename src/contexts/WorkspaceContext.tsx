'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { extractSubdomain } from '@/lib/subdomain';

export interface WorkspaceCompany {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  currency: string;
  createdAt?: string;
}

interface WorkspaceContextType {
  slug: string | null;
  company: WorkspaceCompany | null;
  isValid: boolean | null;
  isLoading: boolean;
  isMismatch: boolean;
  error: string | null;
  refetchWorkspace: () => Promise<void>;
  clearMismatch: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [company, setCompany] = useState<WorkspaceCompany | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMismatch, setIsMismatch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspace = useCallback(async (activeSlug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/auth/workspace/${activeSlug}`);
      if (res.data?.success && res.data?.data) {
        setCompany(res.data.data);
        setIsValid(true);
      } else {
        setIsValid(false);
        setError('Workspace not found');
      }
    } catch (err: any) {
      setCompany(null);
      setIsValid(false);
      setError(err.response?.data?.message || 'Workspace not found');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const detectedSlug = extractSubdomain();
    setSlug(detectedSlug);

    if (detectedSlug) {
      fetchWorkspace(detectedSlug);
    } else {
      // Root domain / Localhost direct
      setIsLoading(false);
      setIsValid(null);
    }
  }, [fetchWorkspace]);

  // Check for session mismatch
  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUserStr = localStorage.getItem('user');
        if (savedToken && savedUserStr) {
          const user = JSON.parse(savedUserStr);
          const userSlug = user?.companySlug || user?.company?.slug;
          if (userSlug && userSlug.toLowerCase() !== slug.toLowerCase()) {
            setIsMismatch(true);
            return;
          }
        }
        setIsMismatch(false);
      } catch {
        setIsMismatch(false);
      }
    } else {
      setIsMismatch(false);
    }
  }, [slug]);

  const clearMismatch = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setIsMismatch(false);
  }, []);

  const refetchWorkspace = async () => {
    if (slug) {
      await fetchWorkspace(slug);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        slug,
        company,
        isValid,
        isLoading,
        isMismatch,
        error,
        refetchWorkspace,
        clearMismatch,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
