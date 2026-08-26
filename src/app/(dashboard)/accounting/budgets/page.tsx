'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Pencil, Plus, Trash2, WalletCards } from 'lucide-react';
import api from '@/lib/api';
import { Account } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { SelectEmptyState } from '@/components/shared/SelectEmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ fiscalYearId: '', accountId: '', costCenterId: '', amount: '' });

  const load = async () => {
    setIsLoading(true);
    try {
      const [b, a, y, cc] = await Promise.all([
        api.get('/accounting/budgets'),
        api.get('/accounting/accounts'),
        api.get('/accounting/fiscal-years'),
        api.get('/accounting/cost-centers').catch(() => ({ data: { data: [] } })),
      ]);
      setBudgets(b.data?.data || []);
      setAccounts(a.data?.data || []);
      setYears(y.data?.data || []);
      setCostCenters(cc.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setForm({ fiscalYearId: years[0]?.id || '', accountId: '', costCenterId: '', amount: '' });
    setShowEditModal(true);
  };

  const handleOpenEdit = (budget: any) => {
    setEditingBudget(budget);
    setForm({
      fiscalYearId: budget.fiscalYearId || '',
      accountId: budget.accountId || '',
      costCenterId: budget.costCenterId || '',
      amount: String(budget.amount ?? ''),
    });
    setShowEditModal(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!form.fiscalYearId) {
      toast.error('Please select a fiscal year');
      return;
    }
    if (!form.accountId) {
      toast.error('Please select an account');
      return;
    }
    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a budget amount greater than zero');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fiscalYearId: form.fiscalYearId,
        accountId: form.accountId,
        costCenterId: form.costCenterId || null,
        amount: amountNum,
      };

      if (editingBudget) {
        await api.put(`/accounting/budgets/${editingBudget.id}`, payload);
        showApiSuccess('Budget updated successfully');
      } else {
        await api.post('/accounting/budgets', payload);
        showApiSuccess('Budget created successfully');
      }
      setShowEditModal(false);
      setEditingBudget(null);
      setForm({ fiscalYearId: '', accountId: '', costCenterId: '', amount: '' });
      load();
    } catch (err: any) {
      showApiError(err, editingBudget ? 'Failed to update budget' : 'Failed to create budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (budget: any) => {
    if (!window.confirm('Are you sure you want to delete this budget allocation?')) return;
    try {
      await api.delete(`/accounting/budgets/${budget.id}`);
      showApiSuccess('Budget allocation deleted');
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to delete budget');
    }
  };

  const activeAccounts = accounts.filter((a) => a.isActive && !a.isGroup);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Budgets"
        description="Budget versus actual control by account and fiscal year"
        action={{ label: 'New Budget', onClick: handleOpenCreate, icon: Plus }}
      />

      {/* Warning banner if prerequisite resources are missing */}
      {!isLoading && (years.length === 0 || activeAccounts.length === 0) && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {years.length === 0 && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>No fiscal years found. Create a fiscal year to set budgets.</span>
              </div>
              <Link
                href="/accounting/fiscal-years"
                className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline shrink-0 text-xs"
              >
                <span>Create Fiscal Year</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
          {activeAccounts.length === 0 && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>No ledger accounts found. Set up accounts in Chart of Accounts first.</span>
              </div>
              <Link
                href="/accounting/accounts"
                className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline shrink-0 text-xs"
              >
                <span>Create Account</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* QUICK ADD CARD */}
      <div className="grid gap-3 rounded-md border border-[#e5e2dc] bg-white p-4 md:grid-cols-5 shadow-xs">
        <div>
          <Label>Fiscal Year *</Label>
          <Select
            value={form.fiscalYearId}
            onValueChange={(fiscalYearId) => setForm((f) => ({ ...f, fiscalYearId }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.length === 0 ? (
                <SelectEmptyState
                  message="No fiscal years found"
                  linkHref="/accounting/fiscal-years"
                  linkText="Create Fiscal Year"
                />
              ) : (
                years.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Account *</Label>
          <Select
            value={form.accountId}
            onValueChange={(accountId) => setForm((f) => ({ ...f, accountId }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {activeAccounts.length === 0 ? (
                <SelectEmptyState
                  message="No accounts found"
                  linkHref="/accounting/accounts"
                  linkText="Create Account"
                />
              ) : (
                activeAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Cost Center (Optional)</Label>
          <Select
            value={form.costCenterId || '__all__'}
            onValueChange={(costCenterId) => setForm((f) => ({ ...f, costCenterId: costCenterId === '__all__' ? '' : costCenterId }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cost Centers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Cost Centers</SelectItem>
              {costCenters.map((cc) => (
                <SelectItem key={cc.id} value={cc.id}>
                  {cc.code} - {cc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount *</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={() => handleSave()}
            disabled={isSubmitting || years.length === 0 || activeAccounts.length === 0}
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : 'Set Budget'}
          </Button>
        </div>
      </div>

      {budgets.length === 0 && !isLoading ? (
        <EmptyState
          icon={WalletCards}
          title="No budgets configured"
          description="Allocate budget limits to your accounts by fiscal year for variance tracking."
        />
      ) : (
        <DataTable
          data={budgets}
          isLoading={isLoading}
          columns={[
            {
              key: 'year',
              header: 'Fiscal Year',
              render: (row: any) => row.fiscalYear?.name || row.fiscalYearId,
            },
            {
              key: 'account',
              header: 'Account',
              render: (row: any) =>
                row.account ? `${row.account.code} - ${row.account.name}` : row.accountId,
            },
            {
              key: 'costCenter',
              header: 'Cost Center',
              render: (row: any) => row.costCenter ? `${row.costCenter.code} - ${row.costCenter.name}` : 'All Cost Centers',
            },
            {
              key: 'amount',
              header: 'Budget Amount',
              render: (row: any) => formatCurrency(row.amount),
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'text-right',
              render: (row: any) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                    title="Edit Budget"
                    onClick={() => handleOpenEdit(row)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                    title="Delete Budget"
                    onClick={() => handleDelete(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* EDIT BUDGET DIALOG */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Budget' : 'New Budget'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Fiscal Year *</Label>
              <Select
                value={form.fiscalYearId}
                onValueChange={(fiscalYearId) => setForm((f) => ({ ...f, fiscalYearId }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Account *</Label>
              <Select
                value={form.accountId}
                onValueChange={(accountId) => setForm((f) => ({ ...f, accountId }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cost Center (Optional)</Label>
              <Select
                value={form.costCenterId || '__all__'}
                onValueChange={(costCenterId) => setForm((f) => ({ ...f, costCenterId: costCenterId === '__all__' ? '' : costCenterId }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Cost Centers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Cost Centers</SelectItem>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.code} - {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Budget Amount *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingBudget ? 'Save Changes' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
