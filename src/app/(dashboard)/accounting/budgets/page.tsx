'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Account } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [form, setForm] = useState({ fiscalYearId: '', accountId: '', amount: '' });
  const load = async () => {
    const [b, a, y] = await Promise.all([api.get('/accounting/budgets'), api.get('/accounting/accounts'), api.get('/accounting/fiscal-years')]);
    setBudgets(b.data.data || []); setAccounts(a.data.data || []); setYears(y.data.data || []);
  };
  useEffect(() => { load().catch(() => toast.error('Failed to load budgets')); }, []);
  const create = async () => { await api.post('/accounting/budgets', { ...form, amount: Number(form.amount) }); toast.success('Budget created'); setForm({ fiscalYearId: '', accountId: '', amount: '' }); load(); };
  return <div className="space-y-4"><PageHeader title="Budgets" description="Budget versus actual control by account and fiscal year" /><div className="grid gap-3 rounded-md border border-[#e5e2dc] p-4 md:grid-cols-4"><div><Label>Fiscal Year</Label><Select value={form.fiscalYearId} onValueChange={(fiscalYearId) => setForm((f) => ({ ...f, fiscalYearId }))}><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger><SelectContent>{years.map((y) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Account</Label><Select value={form.accountId} onValueChange={(accountId) => setForm((f) => ({ ...f, accountId }))}><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger><SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div><div className="flex items-end"><Button onClick={create}>Create</Button></div></div><DataTable data={budgets} columns={[{ key: 'year', header: 'Fiscal Year', render: (row: any) => row.fiscalYearId }, { key: 'account', header: 'Account', render: (row: any) => row.account ? `${row.account.code} - ${row.account.name}` : row.accountId }, { key: 'amount', header: 'Budget', render: (row: any) => formatCurrency(row.amount) }]} /></div>;
}
