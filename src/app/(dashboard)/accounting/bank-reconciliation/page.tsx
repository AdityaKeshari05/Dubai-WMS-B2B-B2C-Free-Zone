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
import { formatCurrency, formatDate } from '@/lib/utils';

export default function BankReconciliationPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [gl, setGl] = useState<any[]>([]);
  const [form, setForm] = useState({ accountId: '', statementDate: new Date().toISOString().slice(0, 10), description: '', debit: '', credit: '', reference: '' });
  const load = async () => {
    const [a, l, g] = await Promise.all([api.get('/accounting/accounts'), api.get('/accounting/bank-statement-lines'), api.get('/accounting/gl-entries', { params: { limit: 100 } })]);
    setAccounts(a.data.data || []); setLines(l.data.data || []); setGl(g.data.data.items || []);
  };
  useEffect(() => { load().catch(() => toast.error('Failed to load reconciliation')); }, []);
  const create = async () => { await api.post('/accounting/bank-statement-lines', { ...form, debit: Number(form.debit || 0), credit: Number(form.credit || 0) }); toast.success('Statement line added'); load(); };
  const reconcile = async (lineId: string, ledgerEntryId: string) => { await api.put(`/accounting/bank-statement-lines/${lineId}/reconcile`, { ledgerEntryId }); toast.success('Reconciled'); load(); };
  return <div className="space-y-4"><PageHeader title="Bank Reconciliation" description="Match bank statement lines against bank/cash GL entries" /><div className="grid gap-3 rounded-md border border-[#e5e2dc] p-4 md:grid-cols-6"><div><Label>Account</Label><Select value={form.accountId} onValueChange={(accountId) => setForm((f) => ({ ...f, accountId }))}><SelectTrigger><SelectValue placeholder="Bank account" /></SelectTrigger><SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Date</Label><Input type="date" value={form.statementDate} onChange={(e) => setForm((f) => ({ ...f, statementDate: e.target.value }))} /></div><div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div><div><Label>Debit</Label><Input type="number" value={form.debit} onChange={(e) => setForm((f) => ({ ...f, debit: e.target.value }))} /></div><div><Label>Credit</Label><Input type="number" value={form.credit} onChange={(e) => setForm((f) => ({ ...f, credit: e.target.value }))} /></div><div className="flex items-end"><Button onClick={create}>Add Line</Button></div></div><DataTable data={lines} columns={[{ key: 'date', header: 'Date', render: (r: any) => formatDate(r.statementDate) }, { key: 'account', header: 'Account', render: (r: any) => r.account?.name }, { key: 'description', header: 'Description' }, { key: 'amount', header: 'Amount', render: (r: any) => formatCurrency(Number(r.debit || 0) - Number(r.credit || 0)) }, { key: 'status', header: 'Status', render: (r: any) => r.isReconciled ? 'Reconciled' : 'Open' }, { key: 'match', header: 'Match GL', render: (r: any) => r.isReconciled ? '-' : <Select onValueChange={(id) => reconcile(r.id, id)}><SelectTrigger><SelectValue placeholder="Select GL" /></SelectTrigger><SelectContent>{gl.filter((e) => e.reconciliationStatus !== 'RECONCILED').map((e) => <SelectItem key={e.id} value={e.id}>{formatDate(e.postingDate)} {e.account?.name} {formatCurrency(Number(e.debitBase || 0) - Number(e.creditBase || 0))}</SelectItem>)}</SelectContent></Select> }]} /></div>;
}
