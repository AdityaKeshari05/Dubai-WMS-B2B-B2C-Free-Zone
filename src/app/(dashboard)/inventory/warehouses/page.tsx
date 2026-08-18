'use client';

import { useEffect, useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { Warehouse } from '@/types';
import toast from 'react-hot-toast';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', address: '', city: '', country: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/inventory/warehouses');
      setWarehouses(res.data.data);
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post('/inventory/warehouses', { ...form, name: form.name.trim(), code: form.code.trim() });
      toast.success('Warehouse created');
      setShowModal(false);
      setForm({ name: '', code: '', address: '', city: '', country: '' });
      fetchWarehouses();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { key: 'code', header: 'Code', render: (w: Warehouse) => <span className="font-mono text-sm">{w.code}</span> },
    { key: 'name', header: 'Warehouse', render: (w: Warehouse) => <span className="font-medium">{w.name}</span> },
    { key: 'address', header: 'Address', render: (w: Warehouse) => w.address || '—' },
    { key: 'location', header: 'Location', render: (w: Warehouse) => [w.city, w.country].filter(Boolean).join(', ') || '—' },
    { key: 'isActive', header: 'Status', render: (w: Warehouse) => (
      <span className={`text-xs px-2 py-0.5 rounded-full ${w.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {w.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
  ];

  return (
    <div>
      <PageHeader title="Warehouses" description="Manage storage locations" action={{ label: 'New Warehouse', onClick: () => setShowModal(true), icon: Plus }} />
      {warehouses.length === 0 && !isLoading ? (
        <EmptyState icon={Building2} title="No warehouses" description="Add your first warehouse location" action={{ label: 'Add Warehouse', onClick: () => setShowModal(true) }} />
      ) : (
        <DataTable columns={columns} data={warehouses} isLoading={isLoading} />
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Warehouse</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required placeholder="WH-001" /></div>
            <div className="space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Warehouse'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
