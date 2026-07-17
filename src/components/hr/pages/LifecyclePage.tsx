'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BadgeCheck, BriefcaseBusiness, CalendarClock, ClipboardList, Clock,
  FileText, Landmark, Plus, RefreshCcw, UserRoundCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
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
  user?: { firstName: string; lastName: string; email?: string };
  department?: { name: string };
  position?: { title: string };
  status?: string;
};

type Option = { id: string; name?: string; title?: string; code?: string };

function fullName(employee?: EmployeeOption) {
  return `${employee?.user?.firstName || ''} ${employee?.user?.lastName || ''}`.trim() || 'Employee';
}

function num(value: any) {
  return Number(value || 0);
}

function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  useEffect(() => {
    api.get('/hr/employees', { params: { limit: 300 } })
      .then((res) => setEmployees(res.data.data.items || []))
      .catch(() => setEmployees([]));
  }, []);
  return employees;
}

function DeskStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef6ff] text-[#1674c4]">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-[#6b7280]">{label}</p>
          <p className="text-xl font-semibold text-[#1f2937]">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LifecyclePage() {
  const employees = useEmployees();
  const [departments, setDepartments] = useState<Option[]>([]);
  const [positions, setPositions] = useState<Option[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ employeeId: '', type: 'PROMOTION', effectiveDate: new Date().toISOString().slice(0, 10), reason: '' });

  const fetchAll = async () => {
    const [d, p, e] = await Promise.all([api.get('/hr/departments'), api.get('/hr/positions'), api.get('/hr/lifecycle-events')]);
    setDepartments(d.data.data || []);
    setPositions(p.data.data || []);
    setEvents(e.data.data || []);
  };
  useEffect(() => { fetchAll().catch(() => toast.error('Failed to load lifecycle')); }, []);

  const create = async () => {
    await api.post('/hr/lifecycle-events', form);
    toast.success('Lifecycle event drafted');
    fetchAll();
  };
  const submit = async (id: string) => {
    await api.patch(`/hr/lifecycle-events/${id}/status`, { status: 'SUBMITTED' });
    toast.success('Lifecycle event submitted');
    fetchAll();
  };

  return (
    <div>
      <PageHeader title="Employee Lifecycle" description="Onboarding, promotion, transfer, and separation documents">
        <Button onClick={create}><Plus className="mr-2 h-4 w-4" />Create Event</Button>
      </PageHeader>
      <Card className="mb-4"><CardContent className="grid gap-3 p-4 md:grid-cols-4">
        <Select value={form.employeeId} onValueChange={(v) => setForm((f: any) => ({ ...f, employeeId: v }))}><SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)}</SelectItem>)}</SelectContent></Select>
        <Select value={form.type} onValueChange={(v) => setForm((f: any) => ({ ...f, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['ONBOARDING','PROMOTION','TRANSFER','SEPARATION'].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
        <Select value={form.newDepartmentId || ''} onValueChange={(v) => setForm((f: any) => ({ ...f, newDepartmentId: v }))}><SelectTrigger><SelectValue placeholder="New department" /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
        <Select value={form.newPositionId || ''} onValueChange={(v) => setForm((f: any) => ({ ...f, newPositionId: v }))}><SelectTrigger><SelectValue placeholder="New position" /></SelectTrigger><SelectContent>{positions.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent></Select>
        <Input type="date" value={form.effectiveDate} onChange={(e) => setForm((f: any) => ({ ...f, effectiveDate: e.target.value }))} />
        <Input type="number" placeholder="New salary" onChange={(e) => setForm((f: any) => ({ ...f, newSalary: e.target.value }))} />
        <Textarea className="md:col-span-2" placeholder="Reason / notes" value={form.reason} onChange={(e) => setForm((f: any) => ({ ...f, reason: e.target.value }))} />
      </CardContent></Card>
      <DataTable data={events} columns={[
        { key: 'employee', header: 'Employee', render: (r: any) => fullName(r.employee) },
        { key: 'type', header: 'Type', render: (r: any) => <StatusBadge status={r.type} /> },
        { key: 'effectiveDate', header: 'Effective', render: (r: any) => formatDate(r.effectiveDate) },
        { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        { key: 'reason', header: 'Reason' },
        { key: 'actions', header: '', render: (r: any) => r.status === 'DRAFT' ? <Button size="sm" onClick={() => submit(r.id)}>Submit</Button> : null },
      ]} />
    </div>
  );
}
