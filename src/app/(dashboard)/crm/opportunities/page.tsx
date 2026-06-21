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
import api from '@/lib/api';
import { Opportunity } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const stages = ['PROSPECTING','QUALIFICATION','PROPOSAL','NEGOTIATION','CLOSED_WON','CLOSED_LOST'];

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', value: '', currency: 'USD', stage: 'PROSPECTING', probability: '10', expectedClose: '', notes: '' });
  const limit = 20;

  const fetchOpps = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/crm/opportunities', { params: { page, limit, stage: stageFilter || undefined } });
      setOpps(res.data.data.items);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOpps(); }, [page, stageFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/opportunities', { ...form, value: Number(form.value), probability: Number(form.probability) });
      toast.success('Opportunity created');
      setShowModal(false);
      fetchOpps();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'title', header: 'Opportunity', render: (o: Opportunity) => <span className="font-medium text-gray-900">{o.title}</span> },
    { key: 'value', header: 'Value', render: (o: Opportunity) => <span className="font-semibold">{formatCurrency(o.value, o.currency)}</span> },
    { key: 'stage', header: 'Stage', render: (o: Opportunity) => <StatusBadge status={o.stage} /> },
    { key: 'probability', header: 'Probability', render: (o: Opportunity) => `${o.probability}%` },
    { key: 'expectedClose', header: 'Expected Close', render: (o: Opportunity) => o.expectedClose ? formatDate(o.expectedClose) : '—' },
  ];

  return (
    <div>
      <PageHeader title="Opportunities" description="Track sales opportunities" action={{ label: 'New Opportunity', onClick: () => setShowModal(true), icon: Plus }} />
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant={stageFilter === '' ? 'default' : 'outline'} size="sm" onClick={() => setStageFilter('')}>All</Button>
        {stages.map(s => <Button key={s} variant={stageFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStageFilter(s)}>{s.replace('_',' ')}</Button>)}
      </div>
      {opps.length === 0 && !isLoading ? (
        <EmptyState icon={TrendingUp} title="No opportunities" description="Start tracking sales opportunities" action={{ label: 'New Opportunity', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={opps} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New Opportunity</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Value *</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{stages.map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Probability (%)</Label><Input type="number" min="0" max="100" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Expected Close Date</Label><Input type="date" value={form.expectedClose} onChange={e => setForm(f => ({ ...f, expectedClose: e.target.value }))} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Opportunity</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
