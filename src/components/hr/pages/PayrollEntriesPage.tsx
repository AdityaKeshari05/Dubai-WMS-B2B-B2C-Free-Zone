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
