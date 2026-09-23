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
  const [slug, setSlug] = useState<string | null>('demo');
  const [company, setCompany] = useState<WorkspaceCompany | null>({
    id: 'demo-company-id',
    name: 'Demo Workspace',
    slug: 'demo',
    currency: 'USD',
  });
  const [isValid, setIsValid] = useState<boolean | null>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMismatch, setIsMismatch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspace = useCallback(async (activeSlug: string) => {
    // Disabled backend validation for demo mode
  }, []);

  useEffect(() => {
    // Disabled subdomain and workspace checking for demo mode
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

