'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
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
};

const componentTypes = ['EARNING', 'DEDUCTION', 'TAX', 'BENEFIT'];

function fullName(employee?: EmployeeOption) {
  return `${employee?.user?.firstName || ''} ${employee?.user?.lastName || ''}`.trim() || 'Employee';
}

export function SalaryStructuresPage() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [componentForm, setComponentForm] = useState<any>({ name: '', type: 'EARNING', defaultAmount: '', formula: '', isTaxable: false, description: '' });
  const [structureForm, setStructureForm] = useState<any>({ name: '', description: '', currency: 'USD' });
  const [structureRows, setStructureRows] = useState<any[]>([{ salaryComponentId: '', amount: '', formula: '' }]);
  const [assignForm, setAssignForm] = useState<any>({ employeeId: '', salaryStructureId: '', baseSalary: '', fromDate: new Date().toISOString().slice(0, 10) });

  const selectedEmployee = employees.find((employee) => employee.id === assignForm.employeeId);
  const structurePreview = useMemo(() => {
    return structureRows.reduce((acc, row) => {
      const component = components.find((item) => item.id === row.salaryComponentId);
      const amount = Number(row.amount || component?.defaultAmount || 0);
      if (['EARNING', 'BENEFIT'].includes(component?.type)) acc.gross += amount;
      if (['DEDUCTION', 'TAX'].includes(component?.type)) acc.deduction += amount;
      return acc;
    }, { gross: 0, deduction: 0 });
  }, [structureRows, components]);

  const fetchAll = async () => {
    const [employeeRes, componentRes, structureRes] = await Promise.all([
      api.get('/hr/employees', { params: { limit: 500 } }),
      api.get('/hr/salary-components'),
      api.get('/hr/salary-structures'),
    ]);
    setEmployees(employeeRes.data.data.items || []);
    setComponents(componentRes.data.data || []);
    setStructures(structureRes.data.data || []);
  };

  useEffect(() => { fetchAll().catch(() => toast.error('Failed to load salary setup')); }, []);

  const createComponent = async () => {
    if (!componentForm.name.trim()) return toast.error('Component name is required');
    try {
      await api.post('/hr/salary-components', {
        ...componentForm,
        defaultAmount: componentForm.defaultAmount === '' ? undefined : Number(componentForm.defaultAmount),
      });
      toast.success('Salary component created');
      setComponentForm({ name: '', type: 'EARNING', defaultAmount: '', formula: '', isTaxable: false, description: '' });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create component');
    }
  };

  const createStructure = async () => {
    const rows = structureRows.filter((row) => row.salaryComponentId);
    if (!structureForm.name.trim()) return toast.error('Structure name is required');
    if (!rows.length) return toast.error('Add at least one component');
    try {
      await api.post('/hr/salary-structures', {
        ...structureForm,
        components: rows.map((row) => ({
          salaryComponentId: row.salaryComponentId,
          amount: row.amount === '' ? 0 : Number(row.amount),
          formula: row.formula || undefined,
        })),
      });
      toast.success('Salary structure created');
      setStructureForm({ name: '', description: '', currency: 'USD' });
      setStructureRows([{ salaryComponentId: '', amount: '', formula: '' }]);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create structure');
    }
  };

  const assign = async () => {
    if (!assignForm.employeeId || !assignForm.salaryStructureId || !assignForm.fromDate) return toast.error('Employee, structure and from date are required');
    try {
      await api.post('/hr/salary-structure-assignments', {
        ...assignForm,
        baseSalary: assignForm.baseSalary === '' ? selectedEmployee?.salary || 0 : Number(assignForm.baseSalary),
      });
      toast.success('Salary structure assigned');
      setAssignForm({ employeeId: '', salaryStructureId: '', baseSalary: '', fromDate: new Date().toISOString().slice(0, 10) });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not assign structure');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Salary Structures" description="Define salary components, build reusable salary structures, and assign them to employees" />

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader><CardTitle>Salary Component Master</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Component Name"><Input value={componentForm.name} onChange={(event) => setComponentForm((prev: any) => ({ ...prev, name: event.target.value }))} placeholder="Basic, HRA, PF, Income Tax..." /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select value={componentForm.type} onValueChange={(type) => setComponentForm((prev: any) => ({ ...prev, type }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{componentTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Default Amount"><Input type="number" value={componentForm.defaultAmount} onChange={(event) => setComponentForm((prev: any) => ({ ...prev, defaultAmount: event.target.value }))} /></Field>
            </div>
            <Field label="Formula"><Input value={componentForm.formula} onChange={(event) => setComponentForm((prev: any) => ({ ...prev, formula: event.target.value }))} placeholder="base * 0.4, gross * 0.12" /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={componentForm.isTaxable} onChange={(event) => setComponentForm((prev: any) => ({ ...prev, isTaxable: event.target.checked }))} /> Taxable component</label>
            <Field label="Description"><Textarea rows={2} value={componentForm.description} onChange={(event) => setComponentForm((prev: any) => ({ ...prev, description: event.target.value }))} /></Field>
            <Button onClick={createComponent}>Create Component</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Build Salary Structure</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Structure Name"><Input value={structureForm.name} onChange={(event) => setStructureForm((prev: any) => ({ ...prev, name: event.target.value }))} /></Field>
              <Field label="Currency"><Input value={structureForm.currency} onChange={(event) => setStructureForm((prev: any) => ({ ...prev, currency: event.target.value.toUpperCase() }))} /></Field>
              <Field label="Description"><Input value={structureForm.description} onChange={(event) => setStructureForm((prev: any) => ({ ...prev, description: event.target.value }))} /></Field>
            </div>
            <div className="rounded-md border border-[#e5e2dc]">
              <table className="w-full text-sm">
                <thead className="bg-[#f8faf9] text-xs uppercase text-[#6b7280]"><tr><th className="px-3 py-2 text-left">Component</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-left">Formula Override</th><th /></tr></thead>
                <tbody>
                  {structureRows.map((row, index) => (
                    <tr key={index} className="border-t border-[#ece8e1]">
                      <td className="px-3 py-2">
                        <Select value={row.salaryComponentId} onValueChange={(salaryComponentId) => setStructureRows((prev) => prev.map((item, i) => i === index ? { ...item, salaryComponentId } : item))}>
                          <SelectTrigger><SelectValue placeholder="Select component" /></SelectTrigger>
                          <SelectContent>{components.map((component) => <SelectItem key={component.id} value={component.id}>{component.name} ({component.type})</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-2"><Input className="text-right" type="number" value={row.amount} onChange={(event) => setStructureRows((prev) => prev.map((item, i) => i === index ? { ...item, amount: event.target.value } : item))} placeholder="0 means base/default for earnings" /></td>
                      <td className="px-3 py-2"><Input value={row.formula} onChange={(event) => setStructureRows((prev) => prev.map((item, i) => i === index ? { ...item, formula: event.target.value } : item))} placeholder="base * 0.5" /></td>
                      <td className="px-3 py-2 text-right"><Button variant="ghost" size="sm" onClick={() => setStructureRows((prev) => prev.filter((_, i) => i !== index))}>Remove</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <Button variant="outline" onClick={() => setStructureRows((prev) => [...prev, { salaryComponentId: '', amount: '', formula: '' }])}><Plus className="mr-2 h-4 w-4" />Add Component</Button>
              <div className="text-sm text-[#4b5563]">Preview Gross {formatCurrency(structurePreview.gross)} / Deduction {formatCurrency(structurePreview.deduction)}</div>
              <Button onClick={createStructure}>Create Structure</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Assign Structure to Employee</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1.4fr_1.4fr_1fr_1fr_auto]">
          <Field label="Employee">
            <Select value={assignForm.employeeId} onValueChange={(employeeId) => setAssignForm((prev: any) => ({ ...prev, employeeId, baseSalary: employees.find((item) => item.id === employeeId)?.salary || '' }))}>
              <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
              <SelectContent>{employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{fullName(employee)} ({employee.employeeId})</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Salary Structure">
            <Select value={assignForm.salaryStructureId} onValueChange={(salaryStructureId) => setAssignForm((prev: any) => ({ ...prev, salaryStructureId }))}>
              <SelectTrigger><SelectValue placeholder="Structure" /></SelectTrigger>
              <SelectContent>{structures.map((structure) => <SelectItem key={structure.id} value={structure.id}>{structure.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Base Salary"><Input type="number" value={assignForm.baseSalary} onChange={(event) => setAssignForm((prev: any) => ({ ...prev, baseSalary: event.target.value }))} /></Field>
          <Field label="From Date"><Input type="date" value={assignForm.fromDate} onChange={(event) => setAssignForm((prev: any) => ({ ...prev, fromDate: event.target.value }))} /></Field>
          <div className="flex items-end"><Button onClick={assign}>Assign</Button></div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <DataTable data={components} columns={[
          { key: 'name', header: 'Component' },
          { key: 'type', header: 'Type', render: (row: any) => <StatusBadge status={row.type} /> },
          { key: 'defaultAmount', header: 'Default', render: (row: any) => row.defaultAmount ? formatCurrency(Number(row.defaultAmount)) : '-' },
          { key: 'formula', header: 'Formula', render: (row: any) => row.formula || '-' },
          { key: 'isTaxable', header: 'Taxable', render: (row: any) => row.isTaxable ? 'Yes' : 'No' },
        ]} />
        <DataTable data={structures} columns={[
          { key: 'name', header: 'Structure' },
          { key: 'currency', header: 'Currency' },
          { key: 'components', header: 'Components', render: (row: any) => row.components?.length || 0 },
          { key: 'assignments', header: 'Assignments', render: (row: any) => row._count?.assignments || 0 },
        ]} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
