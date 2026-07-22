'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Plus, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type EmployeeOption = {
  id: string;
  employeeId: string;
  salary?: number;
  user?: { firstName: string; lastName: string };
  department?: { id: string; name: string };
  position?: { id: string; title: string };
  status?: string;
};

type Option = { id: string; name?: string; title?: string };

const eventTypes = ['ONBOARDING', 'PROMOTION', 'TRANSFER', 'SEPARATION'];

function fullName(employee?: EmployeeOption) {
  return `${employee?.user?.firstName || ''} ${employee?.user?.lastName || ''}`.trim() || 'Employee';
}

function statusLabel(status: string) {
  if (status === 'SUBMITTED') return 'APPLIED';
  return status;
}

export function LifecyclePage() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [positions, setPositions] = useState<Option[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ employeeId: '', type: 'PROMOTION', effectiveDate: new Date().toISOString().slice(0, 10), reason: '', notes: '' });
  const selectedEmployee = employees.find((employee) => employee.id === form.employeeId);

  const stats = useMemo(() => ({
    drafts: events.filter((event) => event.status === 'DRAFT').length,
    applied: events.filter((event) => event.status === 'SUBMITTED').length,
    cancelled: events.filter((event) => event.status === 'CANCELLED').length,
  }), [events]);

  const fetchAll = async () => {
    const [employeeRes, departmentRes, positionRes, eventRes] = await Promise.all([
      api.get('/hr/employees', { params: { limit: 500 } }),
      api.get('/hr/departments'),
      api.get('/hr/positions'),
      api.get('/hr/lifecycle-events'),
    ]);
    setEmployees(employeeRes.data.data.items || []);
    setDepartments(departmentRes.data.data || []);
    setPositions(positionRes.data.data || []);
    setEvents(eventRes.data.data || []);
  };

  useEffect(() => { fetchAll().catch(() => toast.error('Failed to load lifecycle')); }, []);

  const create = async () => {
    try {
      await api.post('/hr/lifecycle-events', {
        ...form,
        newDepartmentId: form.newDepartmentId || undefined,
        newPositionId: form.newPositionId || undefined,
        newSalary: form.newSalary || undefined,
      });
      toast.success('Lifecycle event drafted');
      setForm({ employeeId: '', type: 'PROMOTION', effectiveDate: new Date().toISOString().slice(0, 10), reason: '', notes: '' });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not draft lifecycle event');
    }
  };

  const transition = async (event: any, status: 'SUBMITTED' | 'CANCELLED') => {
    try {
      const allowBackdated = status === 'SUBMITTED' && new Date(event.effectiveDate) < new Date(new Date().setHours(0, 0, 0, 0))
        ? window.confirm('This event is backdated. Apply it anyway?')
        : false;
      if (status === 'SUBMITTED' && allowBackdated === false && new Date(event.effectiveDate) < new Date(new Date().setHours(0, 0, 0, 0))) return;
      await api.patch(`/hr/lifecycle-events/${event.id}/status`, { status, allowBackdated });
      toast.success(status === 'SUBMITTED' ? 'Lifecycle event approved and applied' : 'Lifecycle event cancelled');
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update lifecycle event');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Employee Lifecycle" description="Draft, approve, and apply HR actions like promotion, transfer, onboarding, and separation" />
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Draft Actions" value={stats.drafts} />
        <Metric label="Applied Actions" value={stats.applied} />
        <Metric label="Cancelled Actions" value={stats.cancelled} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[430px_1fr]">
        <Card>
          <CardHeader><CardTitle>Draft Lifecycle Action</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Employee">
              <Select value={form.employeeId} onValueChange={(employeeId) => setForm((prev: any) => ({ ...prev, employeeId }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{fullName(employee)} ({employee.employeeId})</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            {selectedEmployee && (
              <div className="rounded-md border border-[#e5e2dc] bg-[#f8faf9] p-3 text-sm">
                <p className="font-semibold text-[#1f2937]">{fullName(selectedEmployee)}</p>
                <p className="text-[#6b7280]">{selectedEmployee.department?.name || 'No department'} / {selectedEmployee.position?.title || 'No position'}</p>
                <p className="text-[#6b7280]">Salary {formatCurrency(selectedEmployee.salary || 0)} · {selectedEmployee.status}</p>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Action Type">
                <Select value={form.type} onValueChange={(type) => setForm((prev: any) => ({ ...prev, type }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{eventTypes.map((type) => <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Effective Date"><Input type="date" value={form.effectiveDate} onChange={(event) => setForm((prev: any) => ({ ...prev, effectiveDate: event.target.value }))} /></Field>
            </div>
            {['TRANSFER', 'PROMOTION', 'ONBOARDING'].includes(form.type) && (
              <Field label="New Department">
                <Select value={form.newDepartmentId || ''} onValueChange={(newDepartmentId) => setForm((prev: any) => ({ ...prev, newDepartmentId }))}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            )}
            {['TRANSFER', 'PROMOTION', 'ONBOARDING'].includes(form.type) && (
              <Field label="New Position">
                <Select value={form.newPositionId || ''} onValueChange={(newPositionId) => setForm((prev: any) => ({ ...prev, newPositionId }))}>
                  <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                  <SelectContent>{positions.map((position) => <SelectItem key={position.id} value={position.id}>{position.title}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            )}
            {form.type === 'PROMOTION' && <Field label="New Salary"><Input type="number" value={form.newSalary || ''} onChange={(event) => setForm((prev: any) => ({ ...prev, newSalary: event.target.value }))} /></Field>}
            <Field label={form.type === 'SEPARATION' ? 'Separation Reason' : 'Reason'}><Textarea value={form.reason} onChange={(event) => setForm((prev: any) => ({ ...prev, reason: event.target.value }))} rows={3} /></Field>
            <Field label="Notes"><Textarea value={form.notes} onChange={(event) => setForm((prev: any) => ({ ...prev, notes: event.target.value }))} rows={2} /></Field>
            <Button onClick={create}><Plus className="mr-2 h-4 w-4" />Create Draft</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lifecycle Actions</CardTitle></CardHeader>
          <CardContent>
            <DataTable data={events} columns={[
              { key: 'employee', header: 'Employee', render: (row: any) => fullName(row.employee) },
              { key: 'type', header: 'Action', render: (row: any) => <StatusBadge status={row.type} /> },
              { key: 'effectiveDate', header: 'Effective', render: (row: any) => formatDate(row.effectiveDate) },
              { key: 'change', header: 'Change', render: (row: any) => changeSummary(row) },
              { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={statusLabel(row.status)} /> },
              { key: 'actions', header: '', render: (row: any) => row.status === 'DRAFT' ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => transition(row, 'SUBMITTED')}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Approve & Apply</Button>
                  <Button size="sm" variant="outline" onClick={() => transition(row, 'CANCELLED')}><XCircle className="mr-1 h-3.5 w-3.5" />Cancel</Button>
                </div>
              ) : null },
            ]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function changeSummary(row: any) {
  const parts = [];
  if (row.newDepartmentId) parts.push('Department');
  if (row.newPositionId) parts.push('Position');
  if (row.newSalary) parts.push(`Salary ${formatCurrency(row.newSalary)}`);
  if (row.type === 'SEPARATION') parts.push('Terminate employee');
  if (row.type === 'ONBOARDING') parts.push('Activate employee');
  return parts.join(', ') || '-';
}

function Metric({ label, value }: { label: string; value: number }) {
  return <Card><CardContent className="p-4"><p className="text-xs text-[#6b7280]">{label}</p><p className="mt-1 text-2xl font-semibold text-[#1f2937]">{value}</p></CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
