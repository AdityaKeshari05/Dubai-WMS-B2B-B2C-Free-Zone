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

export function HRDeskPage() {
  const [stats, setStats] = useState<any>({});
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dash, me, att] = await Promise.all([
        api.get('/hr/dashboard'),
        api.get('/hr/me'),
        api.get('/hr/me/attendance'),
      ]);
      setStats(dash.data.data || {});
      setProfile(me.data.data);
      setAttendance(att.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load HR desk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const check = async (logType: 'IN' | 'OUT') => {
    try {
      await api.post('/hr/me/checkins', { logType });
      toast.success(logType === 'IN' ? 'Checked in' : 'Checked out');
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  return (
    <div>
      <PageHeader title="HR Desk" description="Employee self-service, attendance, leave, and payroll operations">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => check('IN')}><Clock className="mr-2 h-4 w-4" />Check In</Button>
          <Button onClick={() => check('OUT')}><BadgeCheck className="mr-2 h-4 w-4" />Check Out</Button>
        </div>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-4">
        <DeskStat label="Active Employees" value={stats.employees || 0} icon={UserRoundCheck} />
        <DeskStat label="Pending Leaves" value={stats.pendingLeaves || 0} icon={ClipboardList} />
        <DeskStat label="Open Payrolls" value={stats.openPayrolls || 0} icon={Landmark} />
        <DeskStat label="Departments" value={stats.activeDepartments || 0} icon={BriefcaseBusiness} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>My Employment</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-[#6b7280]">Name</p>
              <p className="font-medium">{fullName(profile)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-[#6b7280]">Employee ID</p><p>{profile?.employeeId || '-'}</p></div>
              <div><p className="text-xs text-[#6b7280]">Status</p><StatusBadge status={profile?.status || 'ACTIVE'} /></div>
              <div><p className="text-xs text-[#6b7280]">Department</p><p>{profile?.department?.name || '-'}</p></div>
              <div><p className="text-xs text-[#6b7280]">Position</p><p>{profile?.position?.title || '-'}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
          <CardContent>
            <DataTable
              isLoading={loading}
              data={attendance.slice(0, 8)}
              columns={[
                { key: 'date', header: 'Date', render: (r: any) => formatDate(r.date) },
                { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                { key: 'checkIn', header: 'In', render: (r: any) => r.checkIn ? formatDateTime(r.checkIn) : '-' },
                { key: 'checkOut', header: 'Out', render: (r: any) => r.checkOut ? formatDateTime(r.checkOut) : '-' },
                { key: 'hoursWorked', header: 'Hours', render: (r: any) => r.hoursWorked ? Number(r.hoursWorked).toFixed(2) : '-' },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hr/me')
      .then((res) => { setProfile(res.data.data); setForm(res.data.data || {}); })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      const res = await api.patch('/hr/me', form);
      setProfile(res.data.data);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" description="Your employee master, contact, emergency, and bank details">
        <Button onClick={save}>Save Profile</Button>
      </PageHeader>
      <Card>
        <CardHeader><CardTitle>{loading ? 'Loading...' : `${fullName(profile)} (${profile?.employeeId || '-'})`}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {['personalEmail','phone','address','city','country','emergencyName','emergencyPhone','bankName','bankAccount'].map((field) => (
            <div className="space-y-1.5" key={field}>
              <Label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</Label>
              <Input value={form?.[field] || ''} onChange={(e) => setForm((f: any) => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
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
      <PageHeader title="Leave Ledger" description="Frappe-style leave balances with allocation and consumption history">
        <Button onClick={allocate}><Plus className="mr-2 h-4 w-4" />Allocate Leave</Button>
      </PageHeader>
      <Card className="mb-4">
        <CardHeader><CardTitle>New Allocation</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Select value={form.employeeId} onValueChange={(v) => setForm((f: any) => ({ ...f, employeeId: v }))}>
            <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
            <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.leaveTypeId} onValueChange={(v) => setForm((f: any) => ({ ...f, leaveTypeId: v }))}>
            <SelectTrigger><SelectValue placeholder="Leave type" /></SelectTrigger>
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

export function SalaryStructuresPage() {
  const employees = useEmployees();
  const [components, setComponents] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [componentForm, setComponentForm] = useState<any>({ name: '', type: 'EARNING', defaultAmount: 0 });
  const [structureForm, setStructureForm] = useState<any>({ name: '', currency: 'USD', componentId: '', amount: 0 });
  const [assignForm, setAssignForm] = useState<any>({ employeeId: '', salaryStructureId: '', baseSalary: 0, fromDate: new Date().toISOString().slice(0, 10) });

  const fetchAll = async () => {
    const [c, s] = await Promise.all([api.get('/hr/salary-components'), api.get('/hr/salary-structures')]);
    setComponents(c.data.data || []);
    setStructures(s.data.data || []);
  };
  useEffect(() => { fetchAll().catch(() => toast.error('Failed to load salary structures')); }, []);

  const createComponent = async () => {
    await api.post('/hr/salary-components', componentForm);
    toast.success('Component created');
    setComponentForm({ name: '', type: 'EARNING', defaultAmount: 0 });
    fetchAll();
  };

  const createStructure = async () => {
    await api.post('/hr/salary-structures', {
      name: structureForm.name,
      currency: structureForm.currency,
      components: [{ salaryComponentId: structureForm.componentId, amount: Number(structureForm.amount || 0) }],
    });
    toast.success('Structure created');
    fetchAll();
  };

  const assign = async () => {
    await api.post('/hr/salary-structure-assignments', assignForm);
    toast.success('Salary structure assigned');
  };

  return (
    <div>
      <PageHeader title="Salary Structures" description="Reusable salary components, structures, and employee assignments" />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card><CardHeader><CardTitle>Component</CardTitle></CardHeader><CardContent className="space-y-3">
          <Input placeholder="Component name" value={componentForm.name} onChange={(e) => setComponentForm((f: any) => ({ ...f, name: e.target.value }))} />
          <Select value={componentForm.type} onValueChange={(v) => setComponentForm((f: any) => ({ ...f, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['EARNING','DEDUCTION','TAX','BENEFIT'].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" placeholder="Default amount" value={componentForm.defaultAmount} onChange={(e) => setComponentForm((f: any) => ({ ...f, defaultAmount: e.target.value }))} />
          <Button onClick={createComponent}>Create Component</Button>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Structure</CardTitle></CardHeader><CardContent className="space-y-3">
          <Input placeholder="Structure name" value={structureForm.name} onChange={(e) => setStructureForm((f: any) => ({ ...f, name: e.target.value }))} />
          <Select value={structureForm.componentId} onValueChange={(v) => setStructureForm((f: any) => ({ ...f, componentId: v }))}>
            <SelectTrigger><SelectValue placeholder="Component" /></SelectTrigger><SelectContent>{components.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" placeholder="Amount" value={structureForm.amount} onChange={(e) => setStructureForm((f: any) => ({ ...f, amount: e.target.value }))} />
          <Button onClick={createStructure}>Create Structure</Button>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Assignment</CardTitle></CardHeader><CardContent className="space-y-3">
          <Select value={assignForm.employeeId} onValueChange={(v) => setAssignForm((f: any) => ({ ...f, employeeId: v }))}>
            <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={assignForm.salaryStructureId} onValueChange={(v) => setAssignForm((f: any) => ({ ...f, salaryStructureId: v }))}>
            <SelectTrigger><SelectValue placeholder="Structure" /></SelectTrigger><SelectContent>{structures.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" placeholder="Base salary" value={assignForm.baseSalary} onChange={(e) => setAssignForm((f: any) => ({ ...f, baseSalary: e.target.value }))} />
          <Button onClick={assign}>Assign</Button>
        </CardContent></Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <DataTable data={components} columns={[
          { key: 'name', header: 'Component' },
          { key: 'type', header: 'Type', render: (r: any) => <StatusBadge status={r.type} /> },
          { key: 'defaultAmount', header: 'Default' },
        ]} />
        <DataTable data={structures} columns={[
          { key: 'name', header: 'Structure' },
          { key: 'currency', header: 'Currency' },
          { key: 'components', header: 'Components', render: (r: any) => r.components?.length || 0 },
          { key: 'assignments', header: 'Assignments', render: (r: any) => r._count?.assignments || 0 },
        ]} />
      </div>
    </div>
  );
}

export function PayrollEntriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const fetchAll = async () => {
    const res = await api.get('/hr/payroll-entries', { params: { month, year } });
    setItems(res.data.data || []);
  };
  useEffect(() => { fetchAll().catch(() => toast.error('Failed to load payroll entries')); }, [month, year]);

  const generate = async () => {
    const res = await api.post('/hr/payroll-entries', { month: Number(month), year: Number(year) });
    toast.success(res.data.message || 'Payroll generated');
    fetchAll();
  };
  const setStatus = async (id: string, status: string) => {
    await api.patch(`/hr/payroll-entries/${id}/status`, { status });
    toast.success('Payroll updated');
    fetchAll();
  };

  return (
    <div>
      <PageHeader title="Payroll Entries" description="Generate payroll as a document, then submit or mark paid">
        <Button onClick={generate}><RefreshCcw className="mr-2 h-4 w-4" />Generate</Button>
      </PageHeader>
      <div className="mb-4 flex gap-3">
        <Input className="w-28" type="number" value={month} onChange={(e) => setMonth(e.target.value)} />
        <Input className="w-32" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
      </div>
      <DataTable data={items} columns={[
        { key: 'payrollNo', header: 'Payroll No' },
        { key: 'period', header: 'Period', render: (r: any) => `${r.month}/${r.year}` },
        { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        { key: 'salarySlips', header: 'Slips', render: (r: any) => r.salarySlips?.length || 0 },
        { key: 'totalGross', header: 'Gross', render: (r: any) => formatCurrency(num(r.totalGross)) },
        { key: 'totalNet', header: 'Net', render: (r: any) => <span className="font-semibold">{formatCurrency(num(r.totalNet))}</span> },
        { key: 'actions', header: '', render: (r: any) => <div className="flex gap-1">{r.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, 'SUBMITTED')}>Submit</Button>}{r.status === 'SUBMITTED' && <Button size="sm" onClick={() => setStatus(r.id, 'PAID')}>Mark Paid</Button>}</div> },
      ]} />
    </div>
  );
}

export function SalarySlipsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get('/hr/salary-slips')
      .then((res) => setItems(res.data.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load salary slips'));
  }, []);
  return (
    <div>
      <PageHeader title="Salary Slips" description="Employee-wise payroll output generated from payroll entries" />
      {items.length === 0 ? <EmptyState icon={FileText} title="No salary slips" description="Generate a payroll entry to create salary slips" /> : (
        <DataTable data={items} columns={[
          { key: 'slipNo', header: 'Slip No' },
          { key: 'employee', header: 'Employee', render: (r: any) => fullName(r.employee) },
          { key: 'period', header: 'Period', render: (r: any) => `${r.month}/${r.year}` },
          { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'grossPay', header: 'Gross', render: (r: any) => formatCurrency(num(r.grossPay), r.currency) },
          { key: 'netPay', header: 'Net', render: (r: any) => <span className="font-semibold">{formatCurrency(num(r.netPay), r.currency)}</span> },
        ]} />
      )}
    </div>
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
