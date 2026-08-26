'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencySelect } from '@/components/ui/currency-select';
import api from '@/lib/api';
import { Supplier } from '@/types';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    taxId: '',
    currency: 'INR',
    paymentTerms: 30,
    bankAccount: '',
    bankName: '',
    notes: '',
  });
  const limit = 20;

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/suppliers', { params: { page, limit, search: search || undefined } });
      setSuppliers(res.data?.data?.items || []);
      setTotal(res.data?.data?.total || 0);
    } catch (err: any) {
      showApiError(err, 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, search]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      taxId: '',
      currency: 'INR',
      paymentTerms: 30,
      bankAccount: '',
      bankName: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      city: s.city || '',
      country: s.country || '',
      taxId: s.taxId || '',
      currency: s.currency || 'INR',
      paymentTerms: s.paymentTerms ?? 30,
      bankAccount: s.bankAccount || '',
      bankName: s.bankName || '',
      notes: s.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      toast.error('Please enter supplier name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        name: trimmedName,
        paymentTerms: Number(form.paymentTerms || 0),
      };

      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, payload);
        showApiSuccess(`Supplier "${trimmedName}" updated successfully`);
      } else {
        await api.post('/suppliers', payload);
        showApiSuccess(`Supplier "${trimmedName}" created successfully`);
      }
      setShowModal(false);
      setEditingSupplier(null);
      fetchSuppliers();
    } catch (err: any) {
      showApiError(err, editingSupplier ? 'Failed to update supplier' : 'Failed to create supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${s.name}"?`)) return;
    try {
      await api.delete(`/suppliers/${s.id}`);
      showApiSuccess('Supplier deleted');
      fetchSuppliers();
    } catch (err: any) {
      showApiError(err, 'Failed to delete supplier');
    }
  };

  const columns = [
    { key: 'supplierNo', header: 'ID' },
    {
      key: 'name',
      header: 'Name',
      render: (s: Supplier) => <span className="font-medium text-gray-900">{s.name}</span>,
    },
    { key: 'email', header: 'Email', render: (s: Supplier) => s.email || '—' },
    { key: 'phone', header: 'Phone', render: (s: Supplier) => s.phone || '—' },
    { key: 'country', header: 'Country', render: (s: Supplier) => s.country || '—' },
    { key: 'currency', header: 'Currency' },
    {
      key: 'paymentTerms',
      header: 'Payment Terms',
      render: (s: Supplier) => `${s.paymentTerms} days`,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (s: Supplier) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
            title="Edit Supplier"
            onClick={() => handleOpenEdit(s)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
            title="Delete Supplier"
            onClick={() => handleDelete(s)}
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
        title="Suppliers"
        description="Manage your supplier accounts"
        action={{ label: 'New Supplier', onClick: handleOpenCreate, icon: Plus }}
      />
      <div className="mb-4">
        <Input
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>
      {suppliers.length === 0 && !isLoading ? (
        <EmptyState
          icon={Truck}
          title="No suppliers yet"
          description="Add your first supplier"
          action={{ label: 'Add Supplier', onClick: handleOpenCreate }}
        />
      ) : (
        <>
          <DataTable columns={columns} data={suppliers} isLoading={isLoading} />
          {total > limit && (
            <Pagination
              page={page}
              totalPages={Math.ceil(total / limit)}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'New Supplier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                placeholder="e.g. Bharat Petroleum Ltd"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="billing@supplier.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                placeholder="+91 98765 43210"
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Address</Label>
              <Input
                value={form.address}
                placeholder="Industrial Area, Phase 2"
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input
                value={form.city}
                placeholder="Mumbai"
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input
                value={form.country}
                placeholder="India"
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tax ID / GSTIN</Label>
              <Input
                value={form.taxId}
                placeholder="GSTIN/PAN"
                onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <CurrencySelect
                value={form.currency}
                onChange={(currency) => setForm((f) => ({ ...f, currency }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bank Account</Label>
              <Input
                value={form.bankAccount}
                placeholder="Account number"
                onChange={(e) => setForm((f) => ({ ...f, bankAccount: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bank Name</Label>
              <Input
                value={form.bankName}
                placeholder="e.g. HDFC Bank"
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Terms (days)</Label>
              <Input
                type="number"
                min="0"
                value={form.paymentTerms}
                onChange={(e) => setForm((f) => ({ ...f, paymentTerms: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input
                value={form.notes}
                placeholder="Internal notes"
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingSupplier ? 'Save Changes' : 'Create Supplier'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
