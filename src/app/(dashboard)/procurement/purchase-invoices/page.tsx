'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
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
import { PurchaseInvoice, Supplier, Product } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface LineItem { productId: string; description: string; quantity: number; unitPrice: number; taxRate: number; }

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ supplierId: '', date: new Date().toISOString().split('T')[0], dueDate: '', currency: 'USD', notes: '' });
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]);
  const limit = 20;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [invRes, supRes, prodRes] = await Promise.all([
        api.get('/procurement/purchase-invoices', { params: { page, limit, status: statusFilter || undefined } }),
        api.get('/suppliers', { params: { limit: 200 } }),
        api.get('/inventory/products', { params: { limit: 200 } }),
      ]);
      setInvoices(invRes.data.data.items);
      setTotal(invRes.data.data.total);
      setSuppliers(supRes.data.data.items);
      setProducts(prodRes.data.data.items);
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [page, statusFilter]);

  const addLine = () => setLines(l => [...l, { productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]);
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, key: keyof LineItem, val: string | number) => setLines(l => l.map((line, idx) => idx === i ? { ...line, [key]: val } : line));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/procurement/purchase-invoices', { ...form, items: lines });
      toast.success('Purchase invoice created');
      setShowModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/procurement/purchase-invoices/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'invoiceNo', header: 'Invoice #', render: (i: PurchaseInvoice) => <span className="font-mono text-sm font-semibold">{i.invoiceNo}</span> },
    { key: 'supplier', header: 'Supplier', render: (i: PurchaseInvoice) => <span className="font-medium">{i.supplier?.name}</span> },
    { key: 'date', header: 'Date', render: (i: PurchaseInvoice) => formatDate(i.date) },
    { key: 'total', header: 'Total', render: (i: PurchaseInvoice) => formatCurrency(i.total, i.currency) },
    { key: 'status', header: 'Status', render: (i: PurchaseInvoice) => <StatusBadge status={i.status} /> },
    { key: 'actions', header: '', render: (i: PurchaseInvoice) => (
      <div className="flex gap-1">
        {i.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(i.id, 'SENT')}>Send</Button>}
        {i.status === 'SENT' && <Button size="sm" variant="success" onClick={() => handleStatusUpdate(i.id, 'PAID')}>Mark Paid</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Purchase Invoices" description="Track supplier invoices" action={{ label: 'New Invoice', onClick: () => setShowModal(true), icon: Plus }} />
      <div className="flex gap-2 mb-4">
        {['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </Button>
        ))}
      </div>
      {invoices.length === 0 && !isLoading ? (
        <EmptyState icon={FileText} title="No purchase invoices" description="Create your first purchase invoice" action={{ label: 'New Invoice', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={invoices} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>New Purchase Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <Select value={form.supplierId} onValueChange={v => setForm(f => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Invoice Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2">Product</th>
                  <th className="text-left px-3 py-2">Description</th>
                  <th className="text-right px-3 py-2 w-20">Qty</th>
                  <th className="text-right px-3 py-2 w-28">Unit Price</th>
                  <th className="text-right px-3 py-2 w-20">Tax %</th>
                  <th className="w-10"></th>
                </tr></thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1.5">
                        <Select value={line.productId} onValueChange={v => {
                          const p = products.find(p => p.id === v);
                          updateLine(i, 'productId', v);
                          if (p) { updateLine(i, 'description', p.name); updateLine(i, 'unitPrice', Number(p.costPrice)); }
                        }}>
                          <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5"><Input value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} className="h-8" /></td>
                      <td className="px-2 py-1.5"><Input type="number" min="1" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} className="h-8 text-right" /></td>
                      <td className="px-2 py-1.5"><Input type="number" step="0.01" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', Number(e.target.value))} className="h-8 text-right" /></td>
                      <td className="px-2 py-1.5"><Input type="number" min="0" max="100" value={line.taxRate} onChange={e => updateLine(i, 'taxRate', Number(e.target.value))} className="h-8 text-right" /></td>
                      <td className="px-2"><Button type="button" variant="ghost" size="sm" onClick={() => removeLine(i)} className="h-8 w-8 p-0 text-red-500">×</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 border-t bg-gray-50">
                <Button type="button" variant="outline" size="sm" onClick={addLine}>+ Add Line</Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
