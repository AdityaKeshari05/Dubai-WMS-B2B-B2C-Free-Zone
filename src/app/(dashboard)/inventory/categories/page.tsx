'use client';

import { useEffect, useState } from 'react';
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { Category } from '@/types';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', parentId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/inventory/categories');
      setCategories(res.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm({ name: '', code: '', description: '', parentId: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name || '',
      code: cat.code || '',
      description: cat.description || '',
      parentId: cat.parentId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = form.name.trim();
    const trimmedCode = form.code.trim().toUpperCase();

    if (!trimmedName) {
      toast.error('Please enter category name');
      return;
    }
    if (!trimmedCode) {
      toast.error('Please enter category code');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        code: trimmedCode,
        description: form.description.trim() || undefined,
        parentId: form.parentId || null,
      };

      if (editingCategory) {
        await api.put(`/inventory/categories/${editingCategory.id}`, payload);
        showApiSuccess(`Category "${trimmedName}" updated successfully`);
      } else {
        await api.post('/inventory/categories', payload);
        showApiSuccess(`Category "${trimmedName}" created successfully`);
      }

      setShowModal(false);
      setEditingCategory(null);
      setForm({ name: '', code: '', description: '', parentId: '' });
      fetchCategories();
    } catch (err: any) {
      showApiError(err, editingCategory ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const productCount = cat._count?.products || 0;
    const confirmMessage = productCount > 0
      ? `Category "${cat.name}" has ${productCount} product(s) associated with it. Are you sure you want to delete it?`
      : `Are you sure you want to delete category "${cat.name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await api.delete(`/inventory/categories/${cat.id}`);
      showApiSuccess(`Category "${cat.name}" deleted successfully`);
      fetchCategories();
    } catch (err: any) {
      showApiError(err, 'Failed to delete category');
    }
  };

  const availableParents = categories.filter((c) => {
    if (!editingCategory) return !c.parentId;
    return c.id !== editingCategory.id && c.parentId !== editingCategory.id;
  });

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (c: Category) => (
        <span className="font-mono text-sm font-semibold bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">
          {c.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Category',
      render: (c: Category) => (
        <div>
          <span className={`font-medium ${c.parentId ? 'ml-4 text-gray-600' : 'text-gray-900'}`}>
            {c.parentId ? '↳ ' : ''}
            {c.name}
          </span>
          {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      render: (c: Category) => {
        const parent = categories.find((p) => p.id === c.parentId);
        return parent ? parent.name : '—';
      },
    },
    { key: 'products', header: 'Products', render: (c: Category) => c._count?.products || 0 },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c: Category) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
            title="Edit Category"
            onClick={() => handleOpenEdit(c)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
            title="Delete Category"
            onClick={() => handleDelete(c)}
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
        title="Categories"
        description="Organize product categories"
        action={{ label: 'New Category', onClick: handleOpenCreate, icon: Plus }}
      />
      {categories.length === 0 && !isLoading ? (
        <EmptyState
          icon={Tag}
          title="No categories"
          description="Create your first product category"
          action={{ label: 'Add Category', onClick: handleOpenCreate }}
        />
      ) : (
        <DataTable columns={columns} data={categories} isLoading={isLoading} />
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                placeholder="e.g. Electronics, Raw Materials"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                required
                placeholder="e.g. ELEC, RAW, PACK"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional category description..."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Category</Label>
              <Select
                value={form.parentId || '__none__'}
                onValueChange={(v) => setForm((f) => ({ ...f, parentId: v === '__none__' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (top-level)</SelectItem>
                  {availableParents.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? editingCategory
                    ? 'Saving...'
                    : 'Creating...'
                  : editingCategory
                  ? 'Save Changes'
                  : 'Create Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

