'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', companyName: '', companyPhone: '', country: 'IN', currency: 'INR', slug: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [slugStatus, setSlugStatus] = useState<string | null>(null);
  const { register } = useAuth();
  const suggestedSlug = useMemo(() => slugify(form.slug || form.companyName), [form.slug, form.companyName]);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const checkSlug = async () => {
    if (!suggestedSlug) return;
    setSlugStatus('Checking...');
    try {
      await api.get(`/auth/check-slug/${suggestedSlug}`);
      setSlugStatus('Workspace URL is available');
    } catch (err: any) {
      setSlugStatus(err.response?.data?.message || 'Workspace URL is unavailable');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const payload = await register({ ...form, slug: suggestedSlug });
      const createdSlug = payload.user.companySlug || payload.user.company?.slug || suggestedSlug;
      toast.success('Workspace created successfully');
      window.location.href = `${window.location.protocol}//${createdSlug}.localhost:3001/dashboard`;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Workspace registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#1f2937]">Create your Orus ERP workspace</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Set up your company and Super Admin account.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Create workspace</CardTitle><CardDescription>Your workspace URL uniquely identifies your company.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5"><Label>Company name</Label><Input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} required /></div>
              <div className="space-y-1.5">
                <Label>Workspace URL</Label>
                <div className="flex gap-2"><Input value={form.slug} onChange={(e) => { update('slug', slugify(e.target.value)); setSlugStatus(null); }} placeholder={slugify(form.companyName) || 'your-company'} /><Button type="button" variant="outline" onClick={checkSlug}>Check</Button></div>
                <p className="text-xs text-[#6b7280]">{suggestedSlug || 'your-company'}.localhost:3001 {slugStatus && `— ${slugStatus}`}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>First name</Label><Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required /></div>
                <div className="space-y-1.5"><Label>Last name</Label><Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required /></div>
              </div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength={12} required /><p className="text-xs text-[#6b7280]">Use at least 12 characters with uppercase, lowercase, number, and symbol.</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={(e) => update('currency', e.target.value.toUpperCase())} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !suggestedSlug}>{isLoading ? 'Creating workspace...' : 'Create workspace'}</Button>
            </form>
            <p className="mt-4 text-center text-sm text-[#6b7280]">Already registered? <a href="/login" className="font-medium text-[#1674c4] hover:underline">Sign in</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
