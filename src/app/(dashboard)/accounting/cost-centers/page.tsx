'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CostCentersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', name: '', isGroup: false });
  const load = async () => api.get('/accounting/cost-centers').then((res) => setItems(res.data.data || []));
  useEffect(() => { load().catch(() => toast.error('Failed to load cost centers')); }, []);
  const create = async () => {
    await api.post('/accounting/cost-centers', form);
    toast.success('Cost center created');
    setForm({ code: '', name: '', isGroup: false });
    load();
  };
  return <div className="space-y-4"><PageHeader title="Cost Centers" description="Track accounting by department, branch, project, or team" /><div className="grid gap-3 rounded-md border border-[#e5e2dc] p-4 md:grid-cols-4"><div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} /></div><div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div><label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={form.isGroup} onChange={(e) => setForm((f) => ({ ...f, isGroup: e.target.checked }))} /> Group</label><div className="flex items-end"><Button onClick={create}>Create</Button></div></div><DataTable data={items} columns={[{ key: 'code', header: 'Code', render: (row: any) => <span className="font-mono">{row.code}</span> }, { key: 'name', header: 'Name' }, { key: 'type', header: 'Type', render: (row: any) => row.isGroup ? 'Group' : 'Ledger' }, { key: 'status', header: 'Status', render: (row: any) => row.isActive ? 'Active' : 'Inactive' }]} /></div>;
}
