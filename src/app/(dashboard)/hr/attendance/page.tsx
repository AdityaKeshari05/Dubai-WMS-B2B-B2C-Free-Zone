'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { Attendance, Employee } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const statuses = ['PRESENT','ABSENT','LATE','HALF_DAY','ON_LEAVE','HOLIDAY'];

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', date: new Date().toISOString().split('T')[0], status: 'PRESENT', checkIn: '', checkOut: '' });

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [attRes, empRes] = await Promise.all([
        api.get('/hr/attendance'),
        api.get('/hr/employees', { params: { limit: 200 } }),
      ]);
      setRecords(attRes.data.data.items || attRes.data.data || []);
      setEmployees(empRes.data.data.items);
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hr/attendance', form);
      toast.success('Attendance marked');
      setShowModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (a: Attendance) => formatDate(a.date) },
    { key: 'employee', header: 'Employee', render: (a: Attendance) => <span className="font-medium">{a.employee?.user?.firstName} {a.employee?.user?.lastName}</span> },
    { key: 'status', header: 'Status', render: (a: Attendance) => <StatusBadge status={a.status} /> },
    { key: 'checkIn', header: 'Check In', render: (a: Attendance) => a.checkIn ? new Date(a.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—' },
    { key: 'checkOut', header: 'Check Out', render: (a: Attendance) => a.checkOut ? new Date(a.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—' },
    { key: 'overtime', header: 'Overtime', render: (a: Attendance) => a.overtime ? `${a.overtime}h` : '—' },
  ];

  return (
    <div>
      <PageHeader title="Attendance" description="Track employee attendance" action={{ label: 'Mark Attendance', onClick: () => setShowModal(true), icon: Clock }} />
      {records.length === 0 && !isLoading ? (
        <EmptyState icon={Clock} title="No attendance records" description="Start marking daily attendance" action={{ label: 'Mark Attendance', onClick: () => setShowModal(true) }} />
      ) : (
        <DataTable columns={columns} data={records} isLoading={isLoading} />
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
          <form onSubmit={handleMark} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <Select value={form.employeeId} onValueChange={v => setForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.user?.firstName} {e.user?.lastName} ({e.employeeId})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Check In</Label><Input type="time" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Check Out</Label><Input type="time" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Mark Attendance</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
