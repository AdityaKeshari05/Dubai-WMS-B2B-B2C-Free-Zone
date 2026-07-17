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
