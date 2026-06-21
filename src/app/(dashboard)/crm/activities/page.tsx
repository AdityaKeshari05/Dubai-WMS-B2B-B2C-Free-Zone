'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
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
import { Activity } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const types = ['CALL','EMAIL','MEETING','TASK','NOTE','FOLLOW_UP'];
const statuses = ['PLANNED','IN_PROGRESS','COMPLETED','CANCELLED'];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'CALL', subject: '', description: '', dueDate: '', status: 'PLANNED' });
  const limit = 20;

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/crm/activities', { params: { page, limit, type: typeFilter || undefined } });
      setActivities(res.data.data.items);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchActivities(); }, [page, typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/activities', form);
      toast.success('Activity created');
      setShowModal(false);
      fetchActivities();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'type', header: 'Type', render: (a: Activity) => <StatusBadge status={a.type} /> },
    { key: 'subject', header: 'Subject', render: (a: Activity) => <span className="font-medium">{a.subject}</span> },
    { key: 'status', header: 'Status', render: (a: Activity) => <StatusBadge status={a.status} /> },
    { key: 'dueDate', header: 'Due Date', render: (a: Activity) => a.dueDate ? formatDate(a.dueDate) : '—' },
    { key: 'description', header: 'Notes', render: (a: Activity) => a.description ? a.description.slice(0, 60) + (a.description.length > 60 ? '…' : '') : '—' },
  ];

  return (
    <div>
      <PageHeader title="Activities" description="Track calls, emails, and meetings" action={{ label: 'Log Activity', onClick: () => setShowModal(true), icon: Plus }} />
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant={typeFilter === '' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('')}>All</Button>
        {types.map(t => <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(t)}>{t}</Button>)}
      </div>
      {activities.length === 0 && !isLoading ? (
        <EmptyState icon={Calendar} title="No activities" description="Log your first CRM activity" action={{ label: 'Log Activity', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={activities} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Log Activity</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Due Date</Label><Input type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Save Activity</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
