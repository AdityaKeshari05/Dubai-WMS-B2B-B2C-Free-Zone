'use client';

import { useEffect, useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';

export default function CostCentersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCenter, setEditingCenter] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    parentId: '',
    isGroup: false,
    isActive: true,
  });

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/accounting/cost-centers');
      setItems(res.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load cost centers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenCreate = () => {
    setEditingCenter(null);
    setForm({ code: '', name: '', parentId: '', isGroup: false, isActive: true });
    setShowEditModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingCenter(item);
    setForm({
      code: item.code || '',
      name: item.name || '',
      parentId: item.parentId || '',
      isGroup: Boolean(item.isGroup),
      isActive: item.isActive ?? true,
    });
    setShowEditModal(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const trimmedCode = form.code.trim();
    const trimmedName = form.name.trim();

    if (!trimmedCode) {
      toast.error('Please enter a cost center code');
      return;
    }
    if (!trimmedName) {
      toast.error('Please enter a cost center name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: trimmedCode,
        name: trimmedName,
        parentId: form.parentId || null,
        isGroup: form.isGroup,
        isActive: form.isActive,
      };

      if (editingCenter) {
        await api.put(`/accounting/cost-centers/${editingCenter.id}`, payload);
        showApiSuccess(`Cost center "${trimmedCode} - ${trimmedName}" updated successfully`);
      } else {
        await api.post('/accounting/cost-centers', payload);
        showApiSuccess(`Cost center "${trimmedCode} - ${trimmedName}" created successfully`);
      }
      setShowEditModal(false);
      setEditingCenter(null);
      setForm({ code: '', name: '', parentId: '', isGroup: false, isActive: true });
      load();
    } catch (err: any) {
      showApiError(err, editingCenter ? 'Failed to update cost center' : 'Failed to create cost center');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Are you sure you want to delete cost center "${item.code} - ${item.name}"?`)) return;
    try {
      await api.delete(`/accounting/cost-centers/${item.id}`);
      showApiSuccess(`Cost center "${item.code} - ${item.name}" deleted`);
      load();
    } catch (err: any) {
      showApiError(err, 'Failed to delete cost center. Ensure it has no ledger entries or sub-centers.');
    }
  };

  const groupOptions = items.filter((x) => x.isGroup && (!editingCenter || x.id !== editingCenter.id));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cost Centers"
        description="Track accounting by department, branch, project, or team"
        action={{ label: 'New Cost Center', onClick: handleOpenCreate, icon: Plus }}
      />

      {items.length === 0 && !isLoading ? (
        <EmptyState
          icon={Building2}
          title="No cost centers found"
          description="Create departments, branches, or project cost centers to track expenses accurately."
          action={{ label: 'Add Cost Center', onClick: handleOpenCreate }}
        />
      ) : (
        <DataTable
          data={items}
          isLoading={isLoading}
          columns={[
            {
              key: 'code',
              header: 'Code',
              render: (row: any) => <span className="font-mono font-medium">{row.code}</span>,
            },
            {
              key: 'name',
              header: 'Name',
              render: (row: any) => (
                <div>
                  <p className="font-medium text-gray-900">{row.name}</p>
                  {row.parent && <p className="text-xs text-gray-400">Parent: {row.parent.name}</p>}
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Type',
              render: (row: any) => (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.isGroup ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {row.isGroup ? 'Group' : 'Ledger'}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row: any) => (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {row.isActive ? 'Active' : 'Inactive'}
                </span>
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
                    title="Edit Cost Center"
                    onClick={() => handleOpenEdit(row)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                    title="Delete Cost Center"
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

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCenter ? 'Edit Cost Center' : 'New Cost Center'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input
                value={form.code}
                placeholder="e.g. CC-SALES"
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                placeholder="e.g. Sales Department"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Cost Center</Label>
              <Select
                value={form.parentId || '__none__'}
                onValueChange={(v) => setForm((f) => ({ ...f, parentId: v === '__none__' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (Top-Level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (Top-Level)</SelectItem>
                  {groupOptions.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.code} - {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3 items-center pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isGroup}
                  onChange={(e) => setForm((f) => ({ ...f, isGroup: e.target.checked }))}
                />{' '}
                Group Center
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />{' '}
                Active
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingCenter ? 'Save Changes' : 'Create Cost Center'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
