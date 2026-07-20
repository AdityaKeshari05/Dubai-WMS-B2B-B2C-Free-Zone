'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', value: '', currency: 'USD', stage: 'PROSPECTING', probability: '10', expectedClose: '', notes: '' });
  const router = useRouter();
  const limit = 20;

  const fetchOpps = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/crm/opportunities', { params: { page, limit, stage: stageFilter || undefined } });
      setOpps(res.data.data.items);
      setTotal(res.data.data.total);
      const pipelineRes = await api.get('/crm/opportunities/pipeline');
      setPipeline(pipelineRes.data.data || []);
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

  const moveStage = async (id: string, stage: string) => {
    try {
      await api.patch(`/crm/opportunities/${id}`, { stage });
      toast.success('Opportunity stage updated');
      fetchOpps();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Stage update failed');
    }
  };

  return (
    <div>
      <PageHeader title="Opportunities" description="Track sales opportunities" action={{ label: 'New Opportunity', onClick: () => setShowModal(true), icon: Plus }} />
      <div className="mb-4 grid gap-3 xl:grid-cols-6">
        {pipeline.map((column) => (
          <div key={column.stage} className="min-h-44 rounded-md border border-[#dfe3e8] bg-[#fbfaf8]">
            <div className="border-b border-[#e5e2dc] p-3">
              <StatusBadge status={column.stage} />
              <p className="mt-1 text-xs text-[#6b7280]">{column.count} deals · {formatCurrency(column.totalValue || 0, 'USD')}</p>
            </div>
            <div className="space-y-2 p-2">
              {column.items.slice(0, 4).map((opp: Opportunity) => (
                <div key={opp.id} className="rounded-md border border-[#e5e2dc] bg-white p-2 text-sm">
                  <p className="font-medium text-[#1f2937]">{opp.title}</p>
                  <p className="text-xs text-[#6b7280]">{formatCurrency(opp.value, opp.currency)} · {opp.probability}%</p>
                  <Select value={opp.stage} onValueChange={(stage) => moveStage(opp.id, stage)}>
                    <SelectTrigger className="mt-2 h-7"><SelectValue /></SelectTrigger>
                    <SelectContent>{stages.map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant={stageFilter === '' ? 'default' : 'outline'} size="sm" onClick={() => setStageFilter('')}>All</Button>
        {stages.map(s => <Button key={s} variant={stageFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStageFilter(s)}>{s.replace('_',' ')}</Button>)}
      </div>
      {opps.length === 0 && !isLoading ? (
        <EmptyState icon={TrendingUp} title="No opportunities" description="Start tracking sales opportunities" action={{ label: 'New Opportunity', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={opps} isLoading={isLoading} onRowClick={(opp) => router.push(`/crm/opportunities/${opp.id}`)} />
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
