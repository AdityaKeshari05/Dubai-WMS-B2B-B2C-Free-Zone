'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { isSubdomainEnabled } from '@/lib/subdomain';
import { WorkspaceNotFound } from '@/components/workspace/WorkspaceNotFound';
import { WorkspaceMismatch } from '@/components/workspace/WorkspaceMismatch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, ShieldCheck, Loader2, ArrowRight, Globe, Search } from 'lucide-react';
import toast from 'react-hot-toast';

function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [targetSlug, setTargetSlug] = useState('');
  const [challenge, setChallenge] = useState('');
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const { slug, company, isValid, isLoading, isMismatch, refetchWorkspace } = useWorkspace();
  const router = useRouter();

  const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3001';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  const isSubdomainActive = isSubdomainEnabled();

  // 1. Loading state while verifying workspace
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef6fd] text-[#2490ef]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-sm font-medium text-[#6b7280]">Verifying workspace...</p>
        </div>
      </div>
    );
  }

  // 2. Workspace Not Found (404) - only relevant when explicitly using a subdomain
  if (isSubdomainActive && slug && isValid === false) {
    return <WorkspaceNotFound slug={slug} onRetry={refetchWorkspace} />;
  }

  // 3. User session belongs to another company - only relevant when explicitly using a subdomain
  if (isSubdomainActive && slug && isMismatch) {
    return <WorkspaceMismatch currentWorkspace={company} activeSlug={slug} />;
  }

  // 4. Subdomain Mode Visitor on bare root domain who needs to find their workspace
  if (isSubdomainActive && !slug) {
    const handleGoToWorkspace = (e: React.FormEvent) => {
      e.preventDefault();
      const cleanSlug = slugify(targetSlug);
      if (!cleanSlug) {
        toast.error('Please enter a workspace URL');
        return;
      }
      const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
      const protocol = window.location.protocol;
      const destination = isLocal
        ? `${protocol}//${cleanSlug}.${rootDomain}/login`
        : `https://${cleanSlug}.${rootDomain}/login`;

      window.location.href = destination;
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2490ef] shadow-sm shadow-[#2490ef]/25">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1f2937]">Orus ERP Workspace</h1>
            <p className="mt-1 text-sm text-[#6b7280]">Enter your company workspace URL to sign in</p>
          </div>

          <Card className="border border-[#e5e2dc] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.08)]">
            <CardHeader>
              <CardTitle>Find your workspace</CardTitle>
              <CardDescription>Enter the subdomain provided when your company signed up.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGoToWorkspace} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Workspace Subdomain</Label>
                  <div className="flex items-center rounded-md border border-[#d9d4cc] bg-white focus-within:border-[#2490ef] focus-within:ring-2 focus-within:ring-[#2490ef]/20 transition-all">
                    <span className="pl-3 text-xs text-[#9ca3af] font-medium">https://</span>
                    <input
                      type="text"
                      placeholder="e.g. Orus-ERP"
                      value={targetSlug}
                      onChange={(e) => setTargetSlug(e.target.value)}
                      className="flex-1 border-0 bg-transparent px-1 py-2 text-sm text-[#1f2937] font-semibold placeholder:text-[#9ca3af] focus:outline-none"
                      required
                    />
                    <span className="pr-3 text-xs font-semibold text-[#6b7280]">.{rootDomain}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full font-semibold h-10 bg-[#2490ef] hover:bg-[#1674c4]">
                  Continue to Workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 border-t border-[#f0ede8] pt-4 text-center">
                <p className="text-xs text-[#6b7280]">
                  Don&apos;t have a workspace yet?{' '}
                  <a href={`${marketingUrl}/register`} className="font-medium text-[#1674c4] hover:underline">
                    Create New Workspace
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 5. Direct / Active Login Form (Single Project Mode & Subdomain Mode)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await login(normalizedEmail, password, challenge ? code : undefined, challenge || undefined);
      if (result.requiresTwoFactor && result.challenge) {
        setChallenge(result.challenge);
        toast.success('Enter the code from your authenticator app');
        return;
      }
      toast.success('Signed in successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const displayName = company?.name || 'Orus ERP';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4">
      <div className="w-full max-w-md">
        {/* Workspace Brand Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2490ef] shadow-sm shadow-[#2490ef]/25">
            {company?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={displayName} className="h-7 w-7 object-contain rounded" />
            ) : (
              <Building2 className="h-6 w-6 text-white" />
            )}
          </div>
          <h1 className="text-xl font-bold text-[#1f2937]">{displayName}</h1>
          <p className="mt-1 text-xs text-[#6b7280]">
            {company
              ? `Enterprise Operations Desk (${company.currency})`
              : 'Sign in to your business desk'}
          </p>

          {slug && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#d9e4e8] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#1674c4]">
              <ShieldCheck className="h-3 w-3 text-[#0f9d58]" /> Verified Organization
            </div>
          )}
        </div>

        <Card className="border border-[#e5e2dc] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.08)]">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              {company
                ? `Enter your ${company.name} credentials to continue.`
                : 'Enter your credentials to access your ERP desk.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!challenge && <div className="space-y-1.5">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>}
              {challenge && <div className="space-y-1.5"><Label htmlFor="code">Authenticator code</Label><Input id="code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required /></div>}
              {!challenge && <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>}

              <Button
                type="submit"
                className="w-full font-semibold h-9 bg-[#2490ef] hover:bg-[#1674c4]"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    {challenge ? 'Verify Code' : 'Sign In to Desk'} <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#f0ede8] pt-4 text-center">
              <p className="text-xs text-[#6b7280]">
                Need to create a new company workspace?{' '}
                <a
                  href={`/register`}
                  className="font-medium text-[#1674c4] hover:underline"
                >
                  Register Organization
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
