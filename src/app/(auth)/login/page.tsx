'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#2490ef] shadow-sm shadow-[#2490ef]/25">
            <span className="text-xl font-bold text-white">V</span>
          </div>
          <h1 className="text-xl font-semibold text-[#1f2937]">Vitthal ERP</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Sign in to your business desk</p>
        </div>

        <Card className="shadow-[0_18px_50px_rgba(16,24,40,0.08)]">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Use your Vitthal ERP account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
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
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <div className="mt-4 rounded-md border border-[#cde6fb] bg-[#eef6fd] p-3">
              <p className="text-xs font-medium text-[#1674c4]">Demo credentials</p>
              <p className="mt-1 text-xs text-[#256f9f]">Email: admin@oruserp.com</p>
              <p className="text-xs text-[#256f9f]">Password: Admin@123</p>
            </div>
            <p className="mt-4 text-center text-sm text-[#6b7280]">
              Don&apos;t have an account?{' '}
              <a href="/register" className="font-medium text-[#1674c4] hover:underline">Register</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
