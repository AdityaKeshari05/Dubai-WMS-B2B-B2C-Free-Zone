'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function FiscalYearsPage() {
  const [years, setYears] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });
  const load = async () => api.get('/accounting/fiscal-years').then((res) => setYears(res.data.data || []));
  useEffect(() => { load().catch(() => toast.error('Failed to load fiscal years')); }, []);
  const create = async () => {
    try {
      await api.post('/accounting/fiscal-years', form);
      toast.success('Fiscal year created');
      setForm({ name: '', startDate: '', endDate: '' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const togglePeriod = async (period: any) => {
    await api.put(`/accounting/periods/${period.id}`, { isClosed: !period.isClosed });
    toast.success(period.isClosed ? 'Period reopened' : 'Period closed');
    load();
  };
  return (
    <div className="space-y-4">
      <PageHeader title="Fiscal Years" description="Control fiscal years and lock accounting periods" />
      <Card><CardHeader><CardTitle>New Fiscal Year</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-4"><div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div><div className="space-y-1.5"><Label>Start</Label><Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></div><div className="space-y-1.5"><Label>End</Label><Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} /></div><div className="flex items-end"><Button onClick={create}><Plus className="mr-2 h-4 w-4" />Create</Button></div></CardContent></Card>
      <DataTable data={years} columns={[
        { key: 'name', header: 'Fiscal Year', render: (row: any) => <span className="font-medium">{row.name}</span> },
        { key: 'startDate', header: 'Start', render: (row: any) => formatDate(row.startDate) },
        { key: 'endDate', header: 'End', render: (row: any) => formatDate(row.endDate) },
        { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.isClosed ? 'CANCELLED' : 'ACTIVE'} /> },
        { key: 'periods', header: 'Periods', render: (row: any) => <div className="flex flex-wrap gap-1">{row.periods?.map((p: any) => <Button key={p.id} size="sm" variant={p.isClosed ? 'outline' : 'secondary'} onClick={(e) => { e.stopPropagation(); togglePeriod(p); }}>{p.name}: {p.isClosed ? 'Closed' : 'Open'}</Button>)}</div> },
      ]} />
    </div>
  );
}
