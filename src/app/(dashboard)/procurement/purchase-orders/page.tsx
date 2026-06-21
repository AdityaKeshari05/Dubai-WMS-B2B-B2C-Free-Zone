'use client';

import { useEffect, useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { PurchaseOrder, Supplier, Product } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface LineItem { productId: string; quantity: number; unitPrice: number; taxRate: number; discount: number; total: number; }

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ supplierId: '', date: new Date().toISOString().split('T')[0], expectedDate: '', currency: 'USD', notes: '' });
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0, total: 0 }]);
  const limit = 20;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [ordRes, suppRes, prodRes] = await Promise.all([
        api.get('/procurement/purchase-orders', { params: { page, limit } }),
        api.get('/suppliers', { params: { limit: 100 } }),
        api.get('/inventory/products', { params: { limit: 100 } }),
      ]);
      setOrders(ordRes.data.data.items);
      setTotal(ordRes.data.data.total);
      setSuppliers(suppRes.data.data.items);
      setProducts(prodRes.data.data.items);
    } catch { toast.error('Failed to load purchase orders'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [page]);

  const updateItem = (idx: number, field: keyof LineItem, val: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    updated[idx].total = updated[idx].quantity * updated[idx].unitPrice;
    setItems(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/procurement/purchase-orders', { ...form, items });
      toast.success('Purchase order created');
      setShowModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/procurement/purchase-orders/${id}/status`, { status });
      toast.success('Status updated');
      fetchAll();
    } catch { toast.error('Failed to update'); }
  };

  const columns = [
    { key: 'orderNo', header: 'Order #', render: (o: PurchaseOrder) => <span className="font-mono text-sm font-semibold text-blue-600">{o.orderNo}</span> },
    { key: 'supplier', header: 'Supplier', render: (o: PurchaseOrder) => (o.supplier as any)?.name || '—' },
    { key: 'date', header: 'Date', render: (o: PurchaseOrder) => formatDate(o.date) },
    { key: 'expectedDate', header: 'Expected', render: (o: PurchaseOrder) => o.expectedDate ? formatDate(o.expectedDate) : '—' },
    { key: 'total', header: 'Total', render: (o: PurchaseOrder) => <span className="font-semibold">{formatCurrency(o.total, o.currency)}</span> },
    { key: 'status', header: 'Status', render: (o: PurchaseOrder) => <StatusBadge status={o.status} /> },
    { key: 'actions', header: '', render: (o: PurchaseOrder) => (
      <div className="flex gap-1">
        {o.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(o.id, 'SENT'); }}>Send</Button>}
        {o.status === 'CONFIRMED' && <Button size="sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(o.id, 'RECEIVED'); }}>Mark Received</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Purchase Orders" description="Manage procurement orders" action={{ label: 'New PO', onClick: () => setShowModal(true), icon: Plus }} />
      {orders.length === 0 && !isLoading ? (
        <EmptyState icon={ShoppingBag} title="No purchase orders" description="Create your first purchase order" action={{ label: 'New PO', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={orders} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <Select value={form.supplierId} onValueChange={v => setForm(f => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label>Expected Date</Label><Input type="date" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { productId: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0, total: 0 }])}>+ Add Item</Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end mb-2">
                  <div className="col-span-5">
                    <Select value={item.productId} onValueChange={v => {
                      const prod = products.find(p => p.id === v);
                      const updated = [...items];
                      updated[idx] = { ...updated[idx], productId: v, unitPrice: prod?.costPrice || 0, total: updated[idx].quantity * (prod?.costPrice || 0) };
                      setItems(updated);
                    }}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Product" /></SelectTrigger>
                      <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} /></div>
                  <div className="col-span-3"><Input className="h-8 text-xs" type="number" placeholder="Unit Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} /></div>
                  <div className="col-span-1 text-sm text-right">${item.total.toFixed(0)}</div>
                  <div className="col-span-1"><Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => setItems(items.filter((_, i) => i !== idx))}>×</Button></div>
                </div>
              ))}
              <div className="text-right text-sm font-semibold">Total: {formatCurrency(items.reduce((s, i) => s + i.total, 0))}</div>
            </div>
            <div className="space-y-1.5"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.supplierId}>Create PO</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
