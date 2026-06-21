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
import { SalesInvoice, Customer, Product, InvoiceStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface LineItem { productId: string; description: string; quantity: number; unitPrice: number; taxRate: number; discount: number; total: number; }

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [form, setForm] = useState({ customerId: '', date: new Date().toISOString().split('T')[0], dueDate: '', currency: 'USD', notes: '', terms: '' });
  const [items, setItems] = useState<LineItem[]>([{ productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0, total: 0 }]);
  const limit = 20;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [invRes, custRes, prodRes] = await Promise.all([
        api.get('/invoicing/sales-invoices', { params: { page, limit, search: search || undefined, status: statusFilter || undefined } }),
        api.get('/customers', { params: { limit: 100 } }),
        api.get('/inventory/products', { params: { limit: 100 } }),
      ]);
      setInvoices(invRes.data.data.items);
      setTotal(invRes.data.data.total);
      setCustomers(custRes.data.data.items);
      setProducts(prodRes.data.data.items);
    } catch { toast.error('Failed to load invoices'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [page, search, statusFilter]);

  const updateItem = (idx: number, field: keyof LineItem, val: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    const i = updated[idx];
    i.total = i.quantity * i.unitPrice * (1 - i.discount / 100);
    setItems(updated);
  };

  const addItem = () => setItems([...items, { productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0, total: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const discount = 0;
      await api.post('/invoicing/sales-invoices', { ...form, items, discount });
      toast.success('Invoice created');
      setShowModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create invoice'); }
  };

  const handleSend = async (id: string) => {
    try {
      await api.put(`/invoicing/sales-invoices/${id}/status`, { status: 'SENT' });
      toast.success('Invoice marked as sent');
      fetchAll();
    } catch { toast.error('Failed to update status'); }
  };

  const handlePayment = async (id: string) => {
    try {
      await api.post('/invoicing/payments', { invoiceId: id, amount: Number(payAmount), date: new Date().toISOString(), type: 'RECEIVED', method: 'BANK_TRANSFER' });
      toast.success('Payment recorded');
      setShowPayModal(null);
      setPayAmount('');
      fetchAll();
    } catch { toast.error('Failed to record payment'); }
  };

  const statuses: InvoiceStatus[] = ['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE'];

  const columns = [
    { key: 'invoiceNo', header: 'Invoice #', render: (i: SalesInvoice) => <span className="font-mono text-sm font-semibold text-blue-600">{i.invoiceNo}</span> },
    { key: 'customer', header: 'Customer', render: (i: SalesInvoice) => (i.customer as any)?.name || '—' },
    { key: 'date', header: 'Date', render: (i: SalesInvoice) => formatDate(i.date) },
    { key: 'dueDate', header: 'Due Date', render: (i: SalesInvoice) => i.dueDate ? formatDate(i.dueDate) : '—' },
    { key: 'total', header: 'Total', render: (i: SalesInvoice) => <span className="font-semibold">{formatCurrency(i.total, i.currency)}</span> },
    { key: 'amountPaid', header: 'Paid', render: (i: SalesInvoice) => formatCurrency(i.amountPaid, i.currency) },
    { key: 'status', header: 'Status', render: (i: SalesInvoice) => <StatusBadge status={i.status} /> },
    { key: 'actions', header: '', render: (i: SalesInvoice) => (
      <div className="flex gap-1">
        {i.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSend(i.id); }}>Send</Button>}
        {['SENT','PARTIAL','OVERDUE'].includes(i.status) && (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); setShowPayModal(i.id); }}>Pay</Button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Sales Invoices" description="Manage your sales invoices" action={{ label: 'New Invoice', onClick: () => setShowModal(true), icon: Plus }} />

      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="Search invoices..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
        <div className="flex gap-1 flex-wrap">
          <Button variant={statusFilter === '' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('')}>All</Button>
          {statuses.map(s => <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>{s}</Button>)}
        </div>
      </div>

      {invoices.length === 0 && !isLoading ? (
        <EmptyState icon={FileText} title="No invoices yet" description="Create your first sales invoice" action={{ label: 'New Invoice', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={invoices} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}

      {/* Create Invoice Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>New Sales Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Customer *</Label>
                <Select value={form.customerId} onValueChange={v => setForm(f => ({ ...f, customerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Add Item</Button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Select value={item.productId} onValueChange={v => {
                        const prod = products.find(p => p.id === v);
                        if (prod) { const updated = [...items]; updated[idx] = { ...updated[idx], productId: v, description: prod.name, unitPrice: prod.salePrice, taxRate: prod.taxRate, total: updated[idx].quantity * prod.salePrice }; setItems(updated); }
                        else updateItem(idx, 'productId', v);
                      }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Product" /></SelectTrigger>
                        <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} /></div>
                    <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} /></div>
                    <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Tax%" value={item.taxRate} onChange={e => updateItem(idx, 'taxRate', Number(e.target.value))} /></div>
                    <div className="col-span-1 text-sm font-medium text-gray-700 text-right">${item.total.toFixed(2)}</div>
                    <div className="col-span-1"><Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => removeItem(idx)}>×</Button></div>
                  </div>
                ))}
              </div>
              <div className="text-right mt-2 text-sm font-semibold text-gray-700">
                Total: {formatCurrency(items.reduce((s, i) => s + i.total, 0))}
              </div>
            </div>

            <div className="space-y-1.5"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.customerId}>Create Invoice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={!!showPayModal} onOpenChange={() => setShowPayModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label>Amount</Label><Input type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPayModal(null)}>Cancel</Button>
              <Button onClick={() => showPayModal && handlePayment(showPayModal)}>Record Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
