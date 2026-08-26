'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SelectEmptyState } from '@/components/shared/SelectEmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { showApiError, showApiSuccess } from '@/lib/apiError';

type EmployeeOption = {
  id: string;
  employeeId: string;
  salary?: number;
  user?: { firstName: string; lastName: string; email?: string };
  department?: { name: string };
  position?: { title: string };
  status?: string;
};

type Option = { id: string; name?: string; title?: string; code?: string };

function fullName(employee?: EmployeeOption) {
  return `${employee?.user?.firstName || ''} ${employee?.user?.lastName || ''}`.trim() || 'Employee';
}

function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  useEffect(() => {
    api
      .get('/hr/employees', { params: { limit: 300 } })
      .then((res) => setEmployees(res.data?.data?.items || []))
      .catch(() => setEmployees([]));
  }, []);
  return employees;
}

export function LeaveLedgerPage() {
  const employees = useEmployees();
  const [leaveTypes, setLeaveTypes] = useState<Option[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState<any>({
    employeeId: '',
    leaveTypeId: '',
    allocated: 12,
    fromDate: `${new Date().getFullYear()}-01-01`,
    toDate: `${new Date().getFullYear()}-12-31`,
  });

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [types, alloc, led] = await Promise.all([
        api.get('/hr/leave-types'),
        api.get('/hr/leave-allocations'),
        api.get('/hr/leave-ledger'),
      ]);
      setLeaveTypes(types.data?.data || []);
      setAllocations(alloc.data?.data || []);
      setLedger(led.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load leave ledger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const allocate = async () => {
    if (isSubmitting) return;

    if (!form.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (!form.leaveTypeId) {
      toast.error('Please select a leave type');
      return;
    }
    if (!form.allocated || Number(form.allocated) <= 0) {
      toast.error('Allocated days must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/hr/leave-allocations', { ...form, allocated: Number(form.allocated) });
      showApiSuccess('Leave allocated successfully');
      fetchAll();
    } catch (err: any) {
      showApiError(err, 'Allocation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (alloc: any) => {
    setEditingAllocation(alloc);
    setForm({
      employeeId: alloc.employeeId,
      leaveTypeId: alloc.leaveTypeId,
      allocated: alloc.allocated,
      fromDate: alloc.fromDate ? new Date(alloc.fromDate).toISOString().split('T')[0] : '',
      toDate: alloc.toDate ? new Date(alloc.toDate).toISOString().split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAllocation || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.put(`/hr/leave-allocations/${editingAllocation.id}`, {
        allocated: Number(form.allocated),
        fromDate: form.fromDate,
        toDate: form.toDate,
      });
      showApiSuccess('Leave allocation updated');
      setShowEditModal(false);
      setEditingAllocation(null);
      fetchAll();
    } catch (err: any) {
      showApiError(err, 'Failed to update leave allocation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAllocation = async (alloc: any) => {
    if (!window.confirm('Are you sure you want to delete this leave allocation?')) return;
    try {
      await api.delete(`/hr/leave-allocations/${alloc.id}`);
      showApiSuccess('Leave allocation deleted');
      fetchAll();
    } catch (err: any) {
      showApiError(err, 'Failed to delete leave allocation');
    }
  };

  return (
    <div>
      <PageHeader
        title="Leave Ledger"
        description="Leave balances generated from allocations and approved leave requests"
      >
        <Button onClick={allocate} disabled={isSubmitting || employees.length === 0 || leaveTypes.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Allocating...' : 'Allocate Leave'}
        </Button>
      </PageHeader>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>New Leave Allocation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Select value={form.employeeId} onValueChange={(v) => setForm((f: any) => ({ ...f, employeeId: v }))}>
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
                    {fullName(e)} ({e.employeeId})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Select value={form.leaveTypeId} onValueChange={(v) => setForm((f: any) => ({ ...f, leaveTypeId: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Leave type master" />
            </SelectTrigger>
            <SelectContent>
              {leaveTypes.length === 0 ? (
                <SelectEmptyState
                  message="No leave types found"
                  linkHref="/hr/leave"
                  linkText="Create Leave Type"
                />
              ) : (
                leaveTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Days allowed"
            value={form.allocated}
            onChange={(e) => setForm((f: any) => ({ ...f, allocated: e.target.value }))}
          />
          <Input
            type="date"
            value={form.fromDate}
            onChange={(e) => setForm((f: any) => ({ ...f, fromDate: e.target.value }))}
          />
          <Input
            type="date"
            value={form.toDate}
            onChange={(e) => setForm((f: any) => ({ ...f, toDate: e.target.value }))}
          />
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTable
          data={allocations}
          isLoading={isLoading}
          columns={[
            { key: 'employee', header: 'Employee', render: (r: any) => fullName(r.employee) },
            { key: 'leaveType', header: 'Type', render: (r: any) => r.leaveType?.name },
            { key: 'allocated', header: 'Allocated' },
            { key: 'used', header: 'Used' },
            {
              key: 'balance',
              header: 'Balance',
              render: (r: any) => <span className="font-semibold text-blue-700">{r.balance}</span>,
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'text-right',
              render: (r: any) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                    title="Edit Allocation"
                    onClick={() => handleOpenEdit(r)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {Number(r.used || 0) === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                      title="Delete Allocation"
                      onClick={() => handleDeleteAllocation(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
        <DataTable
          data={ledger}
          isLoading={isLoading}
          columns={[
            {
              key: 'transactionDate',
              header: 'Date',
              render: (r: any) => formatDate(r.transactionDate),
            },
            { key: 'employee', header: 'Employee', render: (r: any) => fullName(r.employee) },
            { key: 'entryType', header: 'Type', render: (r: any) => <StatusBadge status={r.entryType} /> },
            { key: 'leaves', header: 'Leaves' },
            { key: 'balanceAfter', header: 'Balance' },
          ]}
        />
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Leave Allocation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Allocated Days *</Label>
              <Input
                type="number"
                value={form.allocated}
                onChange={(e) => setForm((f: any) => ({ ...f, allocated: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>From Date *</Label>
                <Input
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setForm((f: any) => ({ ...f, fromDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>To Date *</Label>
                <Input
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setForm((f: any) => ({ ...f, toDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
