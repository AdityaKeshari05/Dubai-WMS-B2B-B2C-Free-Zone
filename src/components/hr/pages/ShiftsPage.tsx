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

export function ShiftsPage() {
  const employees = useEmployees();
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftForm, setShiftForm] = useState<any>({ name: '', startTime: '09:00', endTime: '18:00', graceMinutes: 10 });
  const [assignForm, setAssignForm] = useState<any>({ employeeId: '', shiftTypeId: '', startDate: new Date().toISOString().slice(0, 10) });
  useEffect(() => { api.get('/hr/shift-types').then((res) => setShifts(res.data.data || [])).catch(() => toast.error('Failed to load shifts')); }, []);
  const refresh = () => api.get('/hr/shift-types').then((res) => setShifts(res.data.data || []));
  const createShift = async () => { await api.post('/hr/shift-types', shiftForm); toast.success('Shift type created'); refresh(); };
  const assign = async () => { await api.post('/hr/shift-assignments', assignForm); toast.success('Shift assigned'); };
  return (
    <div>
      <PageHeader title="Shift Management" description="Shift types and employee shift assignments" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Create Shift</CardTitle></CardHeader><CardContent className="grid gap-3">
          <Input placeholder="Shift name" value={shiftForm.name} onChange={(e) => setShiftForm((f: any) => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3"><Input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm((f: any) => ({ ...f, startTime: e.target.value }))} /><Input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm((f: any) => ({ ...f, endTime: e.target.value }))} /><Input type="number" value={shiftForm.graceMinutes} onChange={(e) => setShiftForm((f: any) => ({ ...f, graceMinutes: e.target.value }))} /></div>
          <Button onClick={createShift}>Create Shift</Button>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Assign Shift</CardTitle></CardHeader><CardContent className="grid gap-3">
          <Select value={assignForm.employeeId} onValueChange={(v) => setAssignForm((f: any) => ({ ...f, employeeId: v }))}><SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)}</SelectItem>)}</SelectContent></Select>
          <Select value={assignForm.shiftTypeId} onValueChange={(v) => setAssignForm((f: any) => ({ ...f, shiftTypeId: v }))}><SelectTrigger><SelectValue placeholder="Shift" /></SelectTrigger><SelectContent>{shifts.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
          <Input type="date" value={assignForm.startDate} onChange={(e) => setAssignForm((f: any) => ({ ...f, startDate: e.target.value }))} />
          <Button onClick={assign}>Assign Shift</Button>
        </CardContent></Card>
      </div>
      <div className="mt-4">
        <DataTable data={shifts} columns={[
          { key: 'name', header: 'Shift' },
          { key: 'time', header: 'Time', render: (r: any) => `${r.startTime} - ${r.endTime}` },
          { key: 'graceMinutes', header: 'Grace' },
          { key: 'isActive', header: 'Status', render: (r: any) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
        ]} />
      </div>
    </div>
  );
}
