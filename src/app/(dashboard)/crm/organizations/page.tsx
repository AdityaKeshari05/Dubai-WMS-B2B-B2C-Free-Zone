'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building2, Plus } from 'lucide-react';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrmOrganization } from '@/types';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<CrmOrganization[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', email: '', phone: '', city: '', country: '' });
  const router = useRouter();

  const load = async () => {
    const res = await api.get('/crm/organizations', { params: { limit: 100 } });
    setOrganizations(res.data.data.items || []);
  };

  useEffect(() => { load().catch(() => toast.error('Failed to load organizations')); }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/crm/organizations', form);
      toast.success('Organization created');
      setOpen(false);
      setForm({ name: '', industry: '', website: '', email: '', phone: '', city: '', country: '' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create organization');
    }
  };

  return (
    <div>
      <PageHeader title="Organizations" description="Company-level CRM accounts connected to leads, contacts, and opportunities" action={{ label: 'New Organization', onClick: () => setOpen(true), icon: Plus }} />
      {organizations.length ? (
        <DataTable data={organizations} onRowClick={(org) => router.push(`/crm/organizations/${org.id}`)} columns={[
          { key: 'name', header: 'Organization', render: (org: CrmOrganization) => <span className="font-medium">{org.name}</span> },
          { key: 'industry', header: 'Industry', render: (org: CrmOrganization) => org.industry || '-' },
          { key: 'email', header: 'Email', render: (org: CrmOrganization) => org.email || '-' },
          { key: 'phone', header: 'Phone', render: (org: CrmOrganization) => org.phone || '-' },
          { key: 'location', header: 'Location', render: (org: CrmOrganization) => [org.city, org.country].filter(Boolean).join(', ') || '-' },
          { key: 'records', header: 'CRM Records', render: (org: CrmOrganization) => `${org._count?.leads || 0} leads / ${org._count?.opportunities || 0} deals` },
        ]} />
      ) : <EmptyState icon={Building2} title="No organizations" description="Organizations are created manually or automatically during lead import." action={{ label: 'New Organization', onClick: () => setOpen(true) }} />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Organization</DialogTitle></DialogHeader>
          <form onSubmit={create} className="grid grid-cols-2 gap-3">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></Field>
            <Field label="Industry"><Input value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} /></Field>
            <Field label="Website"><Input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} /></Field>
            <Field label="Email"><Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
            <Field label="City"><Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></Field>
            <div className="col-span-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
