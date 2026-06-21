'use client';

import { useEffect, useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { Account, AccountType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const accountTypes: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
const typeColors: Record<AccountType, string> = {
  ASSET: 'text-blue-600 bg-blue-50',
  LIABILITY: 'text-red-600 bg-red-50',
  EQUITY: 'text-purple-600 bg-purple-50',
  REVENUE: 'text-green-600 bg-green-50',
  EXPENSE: 'text-orange-600 bg-orange-50',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', type: 'ASSET', subType: '', parentId: '', description: '', currency: 'USD' });

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/accounting/accounts', { params: { type: typeFilter || undefined } });
      setAccounts(res.data.data);
    } catch { toast.error('Failed to load accounts'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, [typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/accounting/accounts', { ...form, parentId: form.parentId || undefined });
      toast.success('Account created');
      setShowModal(false);
      fetchAccounts();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'code', header: 'Code', render: (a: Account) => <span className="font-mono text-sm font-semibold">{a.code}</span> },
    { key: 'name', header: 'Account Name', render: (a: Account) => (
      <div>
        <p className="font-medium text-gray-900">{a.name}</p>
        {a.parent && <p className="text-xs text-gray-400">Parent: {a.parent.name}</p>}
      </div>
    )},
    { key: 'type', header: 'Type', render: (a: Account) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[a.type as AccountType]}`}>{a.type}</span>
    )},
    { key: 'subType', header: 'Sub Type', render: (a: Account) => a.subType || '—' },
    { key: 'balance', header: 'Balance', render: (a: Account) => formatCurrency(a.balance, a.currency) },
    { key: 'isActive', header: 'Status', render: (a: Account) => (
      <span className={`text-xs px-2 py-0.5 rounded-full ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {a.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
  ];

  return (
    <div>
      <PageHeader title="Chart of Accounts" description="Manage your accounting chart of accounts" action={{ label: 'New Account', onClick: () => setShowModal(true), icon: Plus }} />

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant={typeFilter === '' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('')}>All</Button>
        {accountTypes.map(t => (
          <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(t)}>{t}</Button>
        ))}
      </div>

      {accounts.length === 0 && !isLoading ? (
        <EmptyState icon={BookOpen} title="No accounts" description="Set up your chart of accounts" action={{ label: 'Add Account', onClick: () => setShowModal(true) }} />
      ) : (
        <DataTable columns={columns} data={accounts} isLoading={isLoading} />
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New Account</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-1.5"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required placeholder="1000" /></div>
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{accountTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Sub Type</Label><Input value={form.subType} onChange={e => setForm(f => ({ ...f, subType: e.target.value }))} placeholder="e.g. Cash and Cash Equivalents" /></div>
            <div className="space-y-1.5">
              <Label>Parent Account</Label>
              <Select value={form.parentId} onValueChange={v => setForm(f => ({ ...f, parentId: v }))}>
                <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
