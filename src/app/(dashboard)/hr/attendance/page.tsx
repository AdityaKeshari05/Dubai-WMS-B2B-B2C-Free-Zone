'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowUpRight, Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { SelectEmptyState } from '@/components/shared/SelectEmptyState';
import api from '@/lib/api';
import { Attendance, Employee } from '@/types';
import { formatDate } from '@/lib/utils';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';

const statuses = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY'];

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [form, setForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    checkIn: '',
    checkOut: '',
  });

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [attRes, empRes] = await Promise.all([
        api.get('/hr/attendance'),
        api.get('/hr/employees', { params: { limit: 200 } }),
      ]);
      setRecords(attRes.data?.data?.items || attRes.data?.data || []);
      setEmployees(empRes.data?.data?.items || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setForm({
      employeeId: employees[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      checkIn: '',
      checkOut: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (a: Attendance) => {
    setEditingRecord(a);
    const dateStr = a.date ? new Date(a.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const checkInTime = a.checkIn ? new Date(a.checkIn).toTimeString().slice(0, 5) : '';
    const checkOutTime = a.checkOut ? new Date(a.checkOut).toTimeString().slice(0, 5) : '';
    setForm({
      employeeId: a.employeeId,
      date: dateStr,
      status: a.status || 'PRESENT',
      checkIn: checkInTime,
      checkOut: checkOutTime,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (!form.date) {
      toast.error('Please specify attendance date');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRecord) {
        await api.put(`/hr/attendance/${editingRecord.id}`, {
          status: form.status,
          checkIn: form.checkIn || null,
          checkOut: form.checkOut || null,
        });
        showApiSuccess('Attendance record updated successfully');
      } else {
        await api.post('/hr/attendance', form);
        showApiSuccess('Attendance record saved successfully');
      }
      setShowModal(false);
      setEditingRecord(null);
      setForm({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
        checkIn: '',
        checkOut: '',
      });
      fetchAll();
    } catch (err: any) {
      showApiError(err, editingRecord ? 'Failed to update attendance' : 'Failed to record attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (a: Attendance) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await api.delete(`/hr/attendance/${a.id}`);
      showApiSuccess('Attendance record deleted');
      fetchAll();
    } catch (err: any) {
      showApiError(err, 'Failed to delete attendance record');
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (a: Attendance) => formatDate(a.date) },
    {
      key: 'employee',
      header: 'Employee',
      render: (a: Attendance) => (
        <span className="font-medium text-gray-900">
          {a.employee?.user?.firstName} {a.employee?.user?.lastName}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (a: Attendance) => <StatusBadge status={a.status} /> },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (a: Attendance) =>
        a.checkIn ? new Date(a.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (a: Attendance) =>
        a.checkOut ? new Date(a.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
    },
    { key: 'overtime', header: 'Overtime', render: (a: Attendance) => (a.overtime ? `${a.overtime}h` : '—') },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (a: Attendance) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
            title="Edit Attendance"
            onClick={() => handleOpenEdit(a)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
            title="Delete Attendance"
            onClick={() => handleDelete(a)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track employee daily check-ins, leaves, and attendance logs"
        action={{ label: 'Mark Attendance', onClick: handleOpenCreate, icon: Clock }}
      />
      {records.length === 0 && !isLoading ? (
        <EmptyState
          icon={Clock}
          title="No attendance records yet"
          description="Start logging daily attendance for active employees"
          action={{ label: 'Mark Attendance', onClick: handleOpenCreate }}
        />
      ) : (
        <DataTable columns={columns} data={records} isLoading={isLoading} />
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Attendance Record' : 'Mark Attendance'}</DialogTitle>
          </DialogHeader>

          {employees.length === 0 && !isLoading && (
            <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>No employees found. Add an employee first to log attendance.</span>
              </div>
              <Link
                href="/hr/employees"
                className="inline-flex items-center gap-0.5 font-semibold text-amber-900 underline hover:text-amber-700"
              >
                Add Employee <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <Select
                value={form.employeeId}
                disabled={Boolean(editingRecord)}
                onValueChange={(v) => setForm((f) => ({ ...f, employeeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <SelectEmptyState
                      message="No employees found"
                      linkHref="/hr/employees"
                      linkText="Create Employee"
                    />
                  ) : (
                    employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.user?.firstName} {e.user?.lastName} ({e.employeeId})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  disabled={Boolean(editingRecord)}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Check In</Label>
                <Input
                  type="time"
                  value={form.checkIn}
                  onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Check Out</Label>
                <Input
                  type="time"
                  value={form.checkOut}
                  onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || employees.length === 0}>
                {isSubmitting ? 'Saving...' : editingRecord ? 'Save Changes' : 'Mark Attendance'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
