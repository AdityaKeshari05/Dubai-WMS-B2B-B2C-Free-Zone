'use client';

import { useEffect, useState } from 'react';
import { Plus, CalendarRange, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';

export default function FiscalYearsPage() {
  const [years, setYears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingPeriodId, setTogglingPeriodId] = useState<string | null>(null);
  const [editingYear, setEditingYear] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isClosed: false,
  });

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/accounting/fiscal-years');
      setYears(res.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load fiscal years');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenCreate = () => {
    setEditingYear(null);
    setForm({ name: '', startDate: '', endDate: '', isClosed: false });
    setShowEditModal(true);
  };

  const handleOpenEdit = (year: any) => {
    setEditingYear(year);
    setForm({
      name: year.name || '',
      startDate: year.startDate ? new Date(year.startDate).toISOString().slice(0, 10) : '',
      endDate: year.endDate ? new Date(year.endDate).toISOString().slice(0, 10) : '',
      isClosed: Boolean(year.isClosed),
    });
    setShowEditModal(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      toast.error('Please enter a fiscal year name (e.g. FY 2026)');
      return;
    }
    if (!form.startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!form.endDate) {
      toast.error('Please select an end date');
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingYear) {
        await api.put(`/accounting/fiscal-years/${editingYear.id}`, {
          name: trimmedName,
          startDate: form.startDate,
          endDate: form.endDate,
          isClosed: form.isClosed,
        });
        showApiSuccess(`Fiscal year "${trimmedName}" updated successfully`);
      } else {
        await api.post('/accounting/fiscal-years', {
          name: trimmedName,
          startDate: form.startDate,
          endDate: form.endDate,
        });
        showApiSuccess(`Fiscal year "${trimmedName}" created successfully`);
      }
      setShowEditModal(false);
      setEditingYear(null);
      setForm({ name: '', startDate: '', endDate: '', isClosed: false });
      load();
    } catch (err: any) {
      showApiError(err, editingYear ? 'Failed to update fiscal year' : 'Failed to create fiscal year');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (year: any) => {
    if (!window.confirm(`Are you sure you want to delete fiscal year "${year.name}"?`)) return;
    try {
      await api.delete(`/accounting/fiscal-years/${year.id}`);
      showApiSuccess(`Fiscal year "${year.name}" deleted`);
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to delete fiscal year. Cannot delete years with posted transactions.');
    }
  };

  const togglePeriod = async (period: any) => {
    if (togglingPeriodId) return;
    setTogglingPeriodId(period.id);
    try {
      await api.put(`/accounting/periods/${period.id}`, { isClosed: !period.isClosed });
      showApiSuccess(period.isClosed ? `Period "${period.name}" reopened` : `Period "${period.name}" closed`);
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to update period status');
    } finally {
      setTogglingPeriodId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fiscal Years"
        description="Control fiscal years and lock accounting periods"
        action={{ label: 'New Fiscal Year', onClick: handleOpenCreate, icon: Plus }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Add Fiscal Year</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={form.name}
              placeholder="e.g. FY 2026"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Start Date *</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>End Date *</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => handleSave()} disabled={isSubmitting} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {years.length === 0 && !isLoading ? (
        <EmptyState
          icon={CalendarRange}
          title="No fiscal years found"
          description="Create fiscal years and define reporting periods for your accounting operations."
          action={{ label: 'Add Fiscal Year', onClick: handleOpenCreate }}
        />
      ) : (
        <DataTable
          data={years}
          isLoading={isLoading}
          columns={[
            {
              key: 'name',
              header: 'Fiscal Year',
              render: (row: any) => <span className="font-medium text-gray-900">{row.name}</span>,
            },
            { key: 'startDate', header: 'Start', render: (row: any) => formatDate(row.startDate) },
            { key: 'endDate', header: 'End', render: (row: any) => formatDate(row.endDate) },
            {
              key: 'status',
              header: 'Status',
              render: (row: any) => <StatusBadge status={row.isClosed ? 'CANCELLED' : 'ACTIVE'} />,
            },
            {
              key: 'periods',
              header: 'Periods',
              render: (row: any) => (
                <div className="flex flex-wrap gap-1">
                  {row.periods?.map((p: any) => (
                    <Button
                      key={p.id}
                      size="sm"
                      variant={p.isClosed ? 'outline' : 'secondary'}
                      disabled={togglingPeriodId === p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePeriod(p);
                      }}
                    >
                      {p.name}: {p.isClosed ? 'Closed' : 'Open'}
                    </Button>
                  ))}
                </div>
              ),
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
                    title="Edit Fiscal Year"
                    onClick={() => handleOpenEdit(row)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                    title="Delete Fiscal Year"
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

      {/* EDIT FISCAL YEAR MODAL */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingYear ? 'Edit Fiscal Year' : 'New Fiscal Year'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Fiscal Year Name *</Label>
              <Input
                value={form.name}
                placeholder="e.g. FY 2026"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            {editingYear && (
              <label className="flex items-center gap-2 text-sm pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isClosed}
                  onChange={(e) => setForm((f) => ({ ...f, isClosed: e.target.checked }))}
                />{' '}
                Mark Fiscal Year as Closed
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingYear ? 'Save Changes' : 'Create Fiscal Year'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
