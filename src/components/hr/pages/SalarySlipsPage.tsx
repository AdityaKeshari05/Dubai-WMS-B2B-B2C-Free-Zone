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
