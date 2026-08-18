'use client';

import React from 'react';
import { ShieldAlert, ArrowRight, LogOut, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { WorkspaceCompany, useWorkspace } from '@/contexts/WorkspaceContext';

interface WorkspaceMismatchProps {
  currentWorkspace: WorkspaceCompany | null;
  activeSlug: string | null;
}

export function WorkspaceMismatch({ currentWorkspace, activeSlug }: WorkspaceMismatchProps) {
  const { user, logout } = useAuth();
  const { clearMismatch } = useWorkspace();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  const userCompanySlug = user?.companySlug || user?.company?.slug;
  const userCompanyName = user?.company?.name || 'Your Company';
  const targetCompanyName = currentWorkspace?.name || activeSlug || 'this organization';

  const handleGoToUserWorkspace = () => {
    if (userCompanySlug) {
      const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
      const protocol = window.location.protocol;
      const userUrl = isLocal
        ? `${protocol}//${userCompanySlug}.${rootDomain}/dashboard`
        : `https://${userCompanySlug}.${rootDomain}/dashboard`;
      window.location.href = userUrl;
    }
  };

  const handleSwitchToCurrentWorkspace = () => {
    logout();
    clearMismatch();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-[#1674c4] shadow-sm border border-blue-200">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <Card className="border border-[#e5e2dc] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.08)]">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-[#1f2937]">Workspace Mismatch</h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              You are currently signed in as <strong className="text-[#1f2937]">{user?.email}</strong>.
            </p>

            <div className="mt-4 rounded-md border border-[#d9e4e8] bg-[#f2f6f8] p-3 text-xs text-[#4b5563]">
              Your account belongs to <strong>{userCompanyName}</strong> (<code>{userCompanySlug}.{rootDomain}</code>), which does not have permission to access <strong>{targetCompanyName}</strong>.
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {userCompanySlug && (
                <Button
                  onClick={handleGoToUserWorkspace}
                  className="w-full font-semibold bg-[#2490ef] hover:bg-[#1674c4]"
                >
                  <Building2 className="mr-2 h-4 w-4" /> Go to {userCompanyName} Desk <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleSwitchToCurrentWorkspace}
                className="w-full font-semibold text-[#c3423f] border-[#f0c5c3] hover:bg-[#fef2f2]"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign In with {targetCompanyName} Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-[#9ca3af]">
          Orus ERP &bull; Multi-Tenant Access Isolation
        </p>
      </div>
    </div>
  );
}
