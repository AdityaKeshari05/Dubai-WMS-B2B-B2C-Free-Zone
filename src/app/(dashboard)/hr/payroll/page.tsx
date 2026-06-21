'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { Payroll } from '@/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/hr/payroll', { params: { month, year, limit: 100 } });
      setPayrolls(res.data.data.items);
    } catch { toast.error('Failed to load payroll'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPayrolls(); }, [month, year]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await api.post('/hr/payroll', { month: Number(month), year: Number(year) });
      toast.success('Payroll generated');
      fetchPayrolls();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setIsGenerating(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/hr/payroll/${id}/status`, { status: 'APPROVED' });
      toast.success('Payroll approved');
      fetchPayrolls();
    } catch { toast.error('Failed'); }
  };

  const handlePay = async (id: string) => {
    try {
      await api.put(`/hr/payroll/${id}/status`, { status: 'PAID', payDate: new Date().toISOString() });
      toast.success('Payroll marked as paid');
      fetchPayrolls();
    } catch { toast.error('Failed'); }
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  const columns = [
    { key: 'employee', header: 'Employee', render: (p: Payroll) => (
      <span className="font-medium">{p.employee?.user.firstName} {p.employee?.user.lastName}</span>
    )},
    { key: 'basicSalary', header: 'Basic', render: (p: Payroll) => formatCurrency(p.basicSalary) },
    { key: 'allowances', header: 'Allowances', render: (p: Payroll) => formatCurrency(p.allowances) },
    { key: 'deductions', header: 'Deductions', render: (p: Payroll) => formatCurrency(p.deductions) },
    { key: 'tax', header: 'Tax', render: (p: Payroll) => formatCurrency(p.tax) },
    { key: 'netSalary', header: 'Net Salary', render: (p: Payroll) => <span className="font-bold text-green-700">{formatCurrency(p.netSalary)}</span> },
    { key: 'status', header: 'Status', render: (p: Payroll) => <StatusBadge status={p.status} /> },
    { key: 'actions', header: '', render: (p: Payroll) => (
      <div className="flex gap-1">
        {p.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleApprove(p.id); }}>Approve</Button>}
        {p.status === 'APPROVED' && <Button size="sm" onClick={(e) => { e.stopPropagation(); handlePay(p.id); }}>Pay</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Payroll" description="Manage employee payroll">
        <Button onClick={handleGenerate} disabled={isGenerating} variant="outline">
          {isGenerating ? 'Generating...' : 'Generate Payroll'}
        </Button>
      </PageHeader>

      <div className="flex gap-4 mb-6">
        <div className="space-y-1.5">
          <Label>Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {payrolls.length === 0 && !isLoading ? (
        <EmptyState icon={FileText} title="No payroll data" description={`No payroll generated for ${months[Number(month)-1]} ${year}`} action={{ label: 'Generate Payroll', onClick: handleGenerate }} />
      ) : (
        <DataTable columns={columns} data={payrolls} isLoading={isLoading} />
      )}
    </div>
  );
}
