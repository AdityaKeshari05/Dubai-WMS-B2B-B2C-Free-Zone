'use client';

import { useEffect, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { Lead, LeadStatus, LeadSource } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', firstName: '', lastName: '', email: '', phone: '', company: '', source: 'WEBSITE', status: 'NEW', priority: 'MEDIUM', value: '', notes: '' });
  const limit = 20;

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/crm/leads', { params: { page, limit, search: search || undefined, status: statusFilter || undefined } });
      setLeads(res.data.data.items);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load leads'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, [page, search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/leads', { ...form, value: form.value ? Number(form.value) : undefined });
      toast.success('Lead created');
      setShowModal(false);
      fetchLeads();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create lead'); }
  };

  const handleConvert = async (id: string) => {
    try {
      await api.post(`/crm/leads/${id}/convert`);
      toast.success('Lead converted to opportunity');
      fetchLeads();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to convert'); }
  };

  const columns = [
    { key: 'name', header: 'Lead', render: (l: Lead) => (
      <div>
        <p className="font-medium text-gray-900">{l.firstName} {l.lastName}</p>
        <p className="text-xs text-gray-400">{l.company || l.email}</p>
      </div>
    )},
    { key: 'source', header: 'Source', render: (l: Lead) => <span className="text-xs text-gray-500">{l.source}</span> },
    { key: 'status', header: 'Status', render: (l: Lead) => <StatusBadge status={l.status} /> },
    { key: 'priority', header: 'Priority', render: (l: Lead) => <StatusBadge status={l.priority} /> },
    { key: 'value', header: 'Value', render: (l: Lead) => l.value ? `$${l.value.toLocaleString()}` : '—' },
    { key: 'createdAt', header: 'Created', render: (l: Lead) => formatDate(l.createdAt) },
    { key: 'actions', header: '', render: (l: Lead) => (
      l.status !== 'CONVERTED' ? (
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleConvert(l.id); }}>Convert</Button>
      ) : null
    )},
  ];

  const statuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED'];

  return (
    <div>
      <PageHeader title="Leads" description="Track and manage your sales leads" action={{ label: 'New Lead', onClick: () => setShowModal(true), icon: Plus }} />

      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="Search leads..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
        <div className="flex gap-2">
          <Button variant={statusFilter === '' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('')}>All</Button>
          {statuses.map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      {leads.length === 0 && !isLoading ? (
        <EmptyState icon={TrendingUp} title="No leads yet" description="Start capturing leads to grow your business" action={{ label: 'Add Lead', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={leads} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Enterprise Software Deal" /></div>
            <div className="space-y-1.5"><Label>First Name *</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Last Name *</Label><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Company</Label><Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Estimated Value</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['WEBSITE','REFERRAL','SOCIAL_MEDIA','EMAIL','PHONE','ADVERTISEMENT','OTHER'].map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['LOW','MEDIUM','HIGH','URGENT'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Lead</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
