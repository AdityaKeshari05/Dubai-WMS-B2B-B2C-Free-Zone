'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar, Check, X } from 'lucide-react';
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
import { LeaveRequest, Employee, LeaveType } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const limit = 20;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [lrRes, empRes, ltRes] = await Promise.all([
        api.get('/hr/leave-requests', { params: { page, limit, status: statusFilter || undefined } }),
        api.get('/hr/employees', { params: { limit: 200 } }),
        api.get('/hr/leave-types'),
      ]);
      setRequests(lrRes.data.data.items);
      setTotal(lrRes.data.data.total);
      setEmployees(empRes.data.data.items);
      setLeaveTypes(ltRes.data.data);
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [page, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hr/leave-requests', form);
      toast.success('Leave request submitted');
      setShowModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleApprove = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/hr/leave-requests/${id}/approve`, { status });
      toast.success(status === 'APPROVED' ? 'Leave approved' : 'Leave rejected');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'employee', header: 'Employee', render: (r: LeaveRequest) => <span className="font-medium">{r.employee?.user?.firstName} {r.employee?.user?.lastName}</span> },
    { key: 'type', header: 'Leave Type', render: (r: LeaveRequest) => r.leaveType?.name || '—' },
    { key: 'startDate', header: 'From', render: (r: LeaveRequest) => formatDate(r.startDate) },
    { key: 'endDate', header: 'To', render: (r: LeaveRequest) => formatDate(r.endDate) },
    { key: 'status', header: 'Status', render: (r: LeaveRequest) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: (r: LeaveRequest) => r.status === 'PENDING' ? (
      <div className="flex gap-1">
        <Button size="sm" variant="success" onClick={() => handleApprove(r.id, 'APPROVED')}><Check className="h-3 w-3" /></Button>
        <Button size="sm" variant="destructive" onClick={() => handleApprove(r.id, 'REJECTED')}><X className="h-3 w-3" /></Button>
      </div>
    ) : null },
  ];

  return (
    <div>
      <PageHeader title="Leave Management" description="Manage employee leave requests" action={{ label: 'Request Leave', onClick: () => setShowModal(true), icon: Plus }} />
      <div className="flex gap-2 mb-4">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </Button>
        ))}
      </div>
      {requests.length === 0 && !isLoading ? (
        <EmptyState icon={Calendar} title="No leave requests" description="No leave requests found" action={{ label: 'Request Leave', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={requests} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Request Leave</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <Select value={form.employeeId} onValueChange={v => setForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.user?.firstName} {e.user?.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Leave Type *</Label>
              <Select value={form.leaveTypeId} onValueChange={v => setForm(f => ({ ...f, leaveTypeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>{leaveTypes.map(lt => <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>From *</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label>To *</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required /></div>
            </div>
            <div className="space-y-1.5"><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
