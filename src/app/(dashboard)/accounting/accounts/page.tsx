'use client';

import { useEffect, useState } from 'react';
import { Plus, BookOpen, Pencil, Trash2 } from 'lucide-react';
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
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';

const accountTypes: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
const typeColors: Record<AccountType, string> = {
  ASSET: 'text-blue-600 bg-blue-50',
  LIABILITY: 'text-red-600 bg-red-50',
  EQUITY: 'text-purple-600 bg-purple-50',
  REVENUE: 'text-green-600 bg-green-50',
  EXPENSE: 'text-orange-600 bg-orange-50',
};

const initialAccountForm = {
  code: '',
  name: '',
  type: 'ASSET',
  subType: '',
  parentId: '',
  description: '',
  currency: 'USD',
  isGroup: false,
  freezeAccount: false,
  frozenTillDate: '',
  isDefaultCash: false,
  isDefaultBank: false,
  isDefaultReceivable: false,
  isDefaultPayable: false,
  isDefaultTax: false,
  isDefaultRetainedEarnings: false,
  isActive: true,
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form, setForm] = useState(initialAccountForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/accounting/accounts', { params: { type: typeFilter || undefined } });
      setAccounts(res.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load chart of accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [typeFilter]);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setForm(initialAccountForm);
    setShowModal(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setForm({
      code: account.code || '',
      name: account.name || '',
      type: account.type || 'ASSET',
      subType: account.subType || '',
      parentId: account.parentId || '',
      description: account.description || '',
      currency: account.currency || 'USD',
      isGroup: Boolean(account.isGroup),
      freezeAccount: Boolean(account.freezeAccount),
      frozenTillDate: account.frozenTillDate ? new Date(account.frozenTillDate).toISOString().slice(0, 10) : '',
      isDefaultCash: Boolean(account.isDefaultCash),
      isDefaultBank: Boolean(account.isDefaultBank),
      isDefaultReceivable: Boolean(account.isDefaultReceivable),
      isDefaultPayable: Boolean(account.isDefaultPayable),
      isDefaultTax: Boolean(account.isDefaultTax),
      isDefaultRetainedEarnings: Boolean(account.isDefaultRetainedEarnings),
      isActive: account.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedCode = form.code.trim();
    const trimmedName = form.name.trim();

    if (!trimmedCode) {
      toast.error('Please enter an account code');
      return;
    }
    if (!trimmedName) {
      toast.error('Please enter an account name');
      return;
    }
    if (!form.type) {
      toast.error('Please select an account type');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        code: trimmedCode,
        name: trimmedName,
        parentId: form.parentId || null,
        frozenTillDate: form.freezeAccount && form.frozenTillDate ? form.frozenTillDate : null,
      };

      if (editingAccount) {
        await api.put(`/accounting/accounts/${editingAccount.id}`, payload);
        showApiSuccess(`Account "${trimmedCode} - ${trimmedName}" updated successfully`);
      } else {
        await api.post('/accounting/accounts', payload);
        showApiSuccess(`Account "${trimmedCode} - ${trimmedName}" created successfully`);
      }

      setShowModal(false);
      setEditingAccount(null);
      setForm(initialAccountForm);
      fetchAccounts();
    } catch (err: any) {
      showApiError(err, editingAccount ? 'Failed to update account' : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (account: Account) => {
    if (!window.confirm(`Are you sure you want to delete account "${account.code} - ${account.name}"?`)) return;
    try {
      await api.delete(`/accounting/accounts/${account.id}`);
      showApiSuccess(`Account "${account.code} - ${account.name}" deleted`);
      fetchAccounts();
    } catch (err: any) {
      showApiError(err, 'Failed to delete account. Accounts with transaction history should be marked inactive instead.');
    }
  };

  // Group accounts available for selection (prevent self-nesting)
  const groupAccounts = accounts.filter((a) => a.isGroup && (!editingAccount || a.id !== editingAccount.id));

  const columns = [
    { key: 'code', header: 'Code', render: (a: Account) => <span className="font-mono text-sm font-semibold">{a.code}</span> },
    {
      key: 'name',
      header: 'Account Name',
      render: (a: Account) => (
        <div>
          <p className="font-medium text-gray-900">{a.name}</p>
          {a.parent && <p className="text-xs text-gray-400">Parent: {a.parent.name}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (a: Account) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[a.type as AccountType] || 'text-gray-600 bg-gray-50'}`}>
          {a.type}
        </span>
      ),
    },
    { key: 'subType', header: 'Sub Type', render: (a: Account) => a.subType || '—' },
    { key: 'ledgerType', header: 'Ledger Type', render: (a: any) => (a.isGroup ? 'Group' : 'Ledger') },
    { key: 'balance', header: 'Balance', render: (a: Account) => formatCurrency(a.balance, a.currency) },
    {
      key: 'isActive',
      header: 'Status',
      render: (a: Account) => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {a.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (a: Account) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
            title="Edit Account"
            onClick={() => handleOpenEdit(a)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
            title="Delete Account"
            onClick={() => handleDelete(a)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Chart of Accounts"
        description="Manage your accounting chart of accounts"
        action={{ label: 'New Account', onClick: handleOpenCreate, icon: Plus }}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant={typeFilter === '' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('')}>
          All
        </Button>
        {accountTypes.map((t) => (
          <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(t)}>
            {t}
          </Button>
        ))}
      </div>

      {accounts.length === 0 && !isLoading ? (
        <EmptyState
          icon={BookOpen}
          title="No accounts found"
          description="Set up your chart of accounts to start tracking ledgers, journal entries, and finances."
          action={{ label: 'Add Account', onClick: handleOpenCreate }}
        />
      ) : (
        <DataTable columns={columns} data={accounts} isLoading={isLoading} />
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'New Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                required
                placeholder="e.g. 1000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="e.g. Cash in Hand"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sub Type</Label>
              <Input
                value={form.subType}
                onChange={(e) => setForm((f) => ({ ...f, subType: e.target.value }))}
                placeholder="e.g. Cash and Cash Equivalents"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Account</Label>
              <Select
                value={form.parentId || '__none__'}
                onValueChange={(v) => setForm((f) => ({ ...f, parentId: v === '__none__' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (top-level)</SelectItem>
                  {groupAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {groupAccounts.length === 0 && (
                <p className="text-[11px] text-gray-500">
                  Tip: To nest accounts, mark a parent account with &quot;Group Account&quot;.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.isActive ? 'active' : 'inactive'}
                onValueChange={(v) => setForm((f) => ({ ...f, isActive: v === 'active' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isGroup}
                  onChange={(e) => setForm((f) => ({ ...f, isGroup: e.target.checked }))}
                />{' '}
                Group Account
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.freezeAccount}
                  onChange={(e) => setForm((f) => ({ ...f, freezeAccount: e.target.checked }))}
                />{' '}
                Freeze Account
              </label>
            </div>
            {form.freezeAccount && (
              <div className="col-span-2 space-y-1.5">
                <Label>Frozen Till</Label>
                <Input
                  type="date"
                  value={form.frozenTillDate}
                  onChange={(e) => setForm((f) => ({ ...f, frozenTillDate: e.target.value }))}
                />
              </div>
            )}
            <div className="col-span-2 grid grid-cols-2 gap-2 rounded-md border border-[#e5e2dc] p-3 text-sm">
              {[
                ['isDefaultCash', 'Cash'],
                ['isDefaultBank', 'Bank'],
                ['isDefaultReceivable', 'Receivable'],
                ['isDefaultPayable', 'Payable'],
                ['isDefaultTax', 'Tax'],
                ['isDefaultRetainedEarnings', 'Retained Earnings'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  />{' '}
                  {label}
                </label>
              ))}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingAccount ? 'Save Changes' : 'Create Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
