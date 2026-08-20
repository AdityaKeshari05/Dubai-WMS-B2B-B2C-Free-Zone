'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { WorkspaceNotFound } from '@/components/workspace/WorkspaceNotFound';
import { WorkspaceMismatch } from '@/components/workspace/WorkspaceMismatch';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, token, isLoading } = useAuth();
  const { slug, company, isValid, isLoading: isWorkspaceLoading, isMismatch } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isWorkspaceLoading) {
      if (!slug) {
        router.replace('/login');
      } else if (!user || !token) {
        router.replace('/login');
      }
    }
  }, [user, token, isLoading, isWorkspaceLoading, slug, router]);

  if (isLoading || isWorkspaceLoading) {
    return (
      <div className="h-screen flex items-center justify-center desk-surface">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Guard against bare root domain (e.g. localhost:3000/dashboard without subdomain)
  if (!slug) {
    return null;
  }

  // Guard against non-existent workspace (404)
  if (slug && isValid === false) {
    return <WorkspaceNotFound slug={slug} />;
  }

  // Guard against tenant session mismatch
  if (slug && isMismatch) {
    return <WorkspaceMismatch currentWorkspace={company} activeSlug={slug} />;
  }

  if (!user || !token) return null;

  return (
    <div className="flex h-screen overflow-hidden desk-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
