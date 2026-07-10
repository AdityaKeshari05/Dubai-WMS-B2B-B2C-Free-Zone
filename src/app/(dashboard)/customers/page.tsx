'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { Customer } from '@/types';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', country: '', taxId: '', currency: 'USD', creditLimit: 0, paymentTerms: 30, notes: '' });
  const limit = 20;

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/customers', { params: { page, limit, search: search || undefined } });
      setCustomers(res.data.data.items);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load customers'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [page, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', form);
      toast.success('Customer created');
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', address: '', city: '', country: '', taxId: '', currency: 'USD', creditLimit: 0, paymentTerms: 30, notes: '' });
      fetchCustomers();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create customer'); }
  };

  const columns = [
    { key: 'customerNo', header: 'ID' },
    { key: 'name', header: 'Name', render: (c: Customer) => <span className="font-medium text-gray-900">{c.name}</span> },
    { key: 'email', header: 'Email', render: (c: Customer) => c.email || '—' },
    { key: 'phone', header: 'Phone', render: (c: Customer) => c.phone || '—' },
    { key: 'country', header: 'Country', render: (c: Customer) => c.country || '—' },
    { key: 'currency', header: 'Currency' },
    { key: 'paymentTerms', header: 'Payment Terms', render: (c: Customer) => `${c.paymentTerms} days` },
    { key: 'actions', header: '', render: (c: Customer) => (
      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>Edit</Button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Customers" description="Manage your customer accounts" action={{ label: 'New Customer', onClick: () => setShowModal(true), icon: Plus }} />

      <div className="mb-4">
        <Input placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      </div>

      {customers.length === 0 && !isLoading ? (
        <EmptyState icon={Building2} title="No customers yet" description="Add your first customer to get started" action={{ label: 'Add Customer', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={customers} isLoading={isLoading} onRowClick={customer => router.push(`/customers/${customer.id}`)} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Tax ID</Label><Input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Credit Limit</Label><Input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: Number(e.target.value) }))} /></div>
            <div className="space-y-1.5"><Label>Payment Terms (days)</Label><Input type="number" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: Number(e.target.value) }))} /></div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
