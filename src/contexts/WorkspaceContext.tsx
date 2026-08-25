'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { extractSubdomain, isSubdomainEnabled } from '@/lib/subdomain';

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
  isSubdomainMode: boolean;
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
      // Single Project / Root domain direct mode
      if (typeof window !== 'undefined') {
        try {
          const savedUserStr = localStorage.getItem('user');
          if (savedUserStr) {
            const user = JSON.parse(savedUserStr);
            const userCompany = user?.company;
            if (userCompany) {
              setCompany({
                id: userCompany.id || user.companyId,
                name: userCompany.name || 'My Workspace',
                slug: userCompany.slug || user.companySlug || '',
                logo: userCompany.logo || null,
                currency: userCompany.currency || 'USD',
              });
              setIsValid(true);
            }
          }
        } catch {}
      }
      setIsLoading(false);
      setIsValid(true);
    }
  }, [fetchWorkspace]);

  // Check for session mismatch (only active when in subdomain mode with an explicit slug)
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

  const isSubdomainMode = Boolean(slug && isSubdomainEnabled());

  return (
    <WorkspaceContext.Provider
      value={{
        slug,
        company,
        isValid,
        isLoading,
        isMismatch,
        isSubdomainMode,
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

