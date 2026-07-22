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

export function LeaveLedgerPage() {
  const employees = useEmployees();
  const [leaveTypes, setLeaveTypes] = useState<Option[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ employeeId: '', leaveTypeId: '', allocated: 12, fromDate: `${new Date().getFullYear()}-01-01`, toDate: `${new Date().getFullYear()}-12-31` });

  const fetchAll = async () => {
    const [types, alloc, led] = await Promise.all([
      api.get('/hr/leave-types'),
      api.get('/hr/leave-allocations'),
      api.get('/hr/leave-ledger'),
    ]);
    setLeaveTypes(types.data.data || []);
    setAllocations(alloc.data.data || []);
    setLedger(led.data.data || []);
  };

  useEffect(() => { fetchAll().catch(() => toast.error('Failed to load leave ledger')); }, []);

  const allocate = async () => {
    try {
      await api.post('/hr/leave-allocations', form);
      toast.success('Leave allocated');
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Allocation failed');
    }
  };

  return (
    <div>
      <PageHeader title="Leave Ledger" description="Leave balances generated from allocations and approved leave requests">
        <Button onClick={allocate}><Plus className="mr-2 h-4 w-4" />Allocate Leave</Button>
      </PageHeader>
      <Card className="mb-4">
        <CardHeader><CardTitle>New Leave Allocation</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Select value={form.employeeId} onValueChange={(v) => setForm((f: any) => ({ ...f, employeeId: v }))}>
            <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
            <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.leaveTypeId} onValueChange={(v) => setForm((f: any) => ({ ...f, leaveTypeId: v }))}>
            <SelectTrigger><SelectValue placeholder="Leave type master" /></SelectTrigger>
            <SelectContent>{leaveTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" value={form.allocated} onChange={(e) => setForm((f: any) => ({ ...f, allocated: e.target.value }))} />
          <Input type="date" value={form.fromDate} onChange={(e) => setForm((f: any) => ({ ...f, fromDate: e.target.value }))} />
          <Input type="date" value={form.toDate} onChange={(e) => setForm((f: any) => ({ ...f, toDate: e.target.value }))} />
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTable data={allocations} columns={[
          { key: 'employee', header: 'Employee', render: (r: any) => fullName(r.employee) },
          { key: 'leaveType', header: 'Type', render: (r: any) => r.leaveType?.name },
          { key: 'allocated', header: 'Allocated' },
          { key: 'used', header: 'Used' },
          { key: 'balance', header: 'Balance', render: (r: any) => <span className="font-semibold">{r.balance}</span> },
        ]} />
        <DataTable data={ledger} columns={[
          { key: 'transactionDate', header: 'Date', render: (r: any) => formatDate(r.transactionDate) },
          { key: 'employee', header: 'Employee', render: (r: any) => fullName(r.employee) },
          { key: 'entryType', header: 'Type', render: (r: any) => <StatusBadge status={r.entryType} /> },
          { key: 'leaves', header: 'Leaves' },
          { key: 'balanceAfter', header: 'Balance' },
        ]} />
      </div>
    </div>
  );
}
