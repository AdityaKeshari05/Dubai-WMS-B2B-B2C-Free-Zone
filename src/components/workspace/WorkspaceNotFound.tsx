'use client';

import React from 'react';
import { Building2, ArrowRight, Globe, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WorkspaceNotFoundProps {
  slug?: string | null;
  onRetry?: () => void;
}

export function WorkspaceNotFound({ slug, onRetry }: WorkspaceNotFoundProps) {
  const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3001';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-[#d98324] shadow-sm border border-amber-200">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <Card className="border border-[#e5e2dc] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.08)]">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-[#1f2937]">Workspace Not Found</h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              We could not find an active ERP workspace at:
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#e5e2dc] bg-[#f4f5f6] px-4 py-2 text-sm font-semibold text-[#1f2937]">
              <Globe className="h-4 w-4 text-[#6b7280]" />
              <span>
                {slug ? `${slug}.${rootDomain}` : 'Unknown Workspace'}
              </span>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#6b7280]">
              This workspace link may be mistyped, or the organization might not have been provisioned yet.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Button
                asChild
                className="w-full sm:w-auto font-semibold bg-[#2490ef] hover:bg-[#1674c4]"
              >
                <a href={`${marketingUrl}/register`}>
                  Create New Workspace <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>

              {onRetry && (
                <Button
                  variant="outline"
                  onClick={onRetry}
                  className="w-full sm:w-auto font-semibold"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Retry
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto"
              >
                <a href={marketingUrl}>Main Portal</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-[#9ca3af]">
          Orus ERP &bull; Dedicated Multi-Tenant Enterprise Desk
        </p>
      </div>
    </div>
  );
}
