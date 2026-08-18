'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function RegisterRedirectPage() {
  useEffect(() => {
    const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3001';
    window.location.href = `${marketingUrl}/register`;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#2490ef]" />
        <p className="text-sm text-[#6b7280]">Redirecting to Workspace Registration Portal...</p>
      </div>
    </div>
  );
}
