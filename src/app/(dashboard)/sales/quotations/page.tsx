'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { LineItemGrid, LineItemRow } from '@/components/invoicing/LineItemGrid';
import api from '@/lib/api';
import { Quotation } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [sourceQuotation, setSourceQuotation] = useState<Quotation | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', date: new Date().toISOString().slice(0, 10), validUntil: '', currency: 'USD', notes: '', terms: '' });
  const [rows, setRows] = useState<LineItemRow[]>([{ productId: '', itemCode: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 }]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 20;

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/sales/quotations', { params: { page, limit } });
      setQuotations(res.data.data.items);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load quotations'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchQuotations(); }, [page]);
  useEffect(() => {
    api.get('/customers', { params: { limit: 200, isActive: true } }).then(res => setCustomers(res.data?.data?.items || res.data?.data || [])).catch(() => toast.error('Failed to load customers'));
  }, []);

  const handleConvert = async () => {
    if (!sourceQuotation) return;
    try {
      const res = await api.post(`/sales-orders/from-quotation/${sourceQuotation.id}`);
      const order = res.data?.data;
      toast.success('Quotation converted to sales order');
      router.push('/sales/orders');
      if (order?.id) router.push(`/sales/orders?created=${order.id}`);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const createQuotation = async () => {
    if (!form.customerId) return toast.error('Select a customer');
    const items = rows.filter(row => row.productId || row.itemCode || row.description).map(row => ({
      productId: row.productId,
      itemCode: row.itemCode,
      description: row.description,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      taxTemplateId: row.taxTemplateId,
      taxRate: row.taxRate,
      discount: row.discount,
    }));
    if (!items.length) return toast.error('Add at least one item');
    try {
      await api.post('/sales/quotations', { ...form, items });
      toast.success('Quotation created');
      setNewOpen(false);
      setRows([{ productId: '', itemCode: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 }]);
      fetchQuotations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create quotation');
    }
  };

  const columns = [
    { key: 'quotationNo', header: 'Quotation #', render: (q: Quotation) => <span className="font-mono text-sm font-semibold text-blue-600">{q.quotationNo}</span> },
    { key: 'customer', header: 'Customer', render: (q: Quotation) => (q.customer as any)?.name || '—' },
    { key: 'date', header: 'Date', render: (q: Quotation) => formatDate(q.date) },
    { key: 'validUntil', header: 'Valid Until', render: (q: Quotation) => q.validUntil ? formatDate(q.validUntil) : '—' },
    { key: 'total', header: 'Total', render: (q: Quotation) => <span className="font-semibold">{formatCurrency(q.total, q.currency)}</span> },
    { key: 'status', header: 'Status', render: (q: Quotation) => <StatusBadge status={q.status} /> },
    { key: 'actions', header: '', render: (q: Quotation) => (
      q.status === 'ACCEPTED' || q.status === 'SENT' ? (
        <Button size="sm" onClick={(e) => { e.stopPropagation(); setSourceQuotation(q); }}>Create Sales Order</Button>
      ) : null
    )},
  ];

  return (
    <div>
      <PageHeader title="Quotations" description="Manage sales quotations" action={{ label: 'New Quotation', onClick: () => setNewOpen(true), icon: Plus }} />
      {quotations.length === 0 && !isLoading ? (
        <EmptyState icon={FileText} title="No quotations" description="Quotations will appear here" />
      ) : (
        <>
          <DataTable columns={columns} data={quotations} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={!!sourceQuotation} onOpenChange={() => setSourceQuotation(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create sales order from quotation?</DialogTitle></DialogHeader>
          {sourceQuotation && (
            <div className="space-y-4">
              <div className="rounded-md border border-[#e5e2dc] bg-[#f8faf9] p-3 text-sm">
                <p><span className="text-[#6b7280]">Source:</span> <span className="font-mono font-semibold">{sourceQuotation.quotationNo}</span></p>
                <p><span className="text-[#6b7280]">Customer:</span> {sourceQuotation.customer?.name || sourceQuotation.customerId}</p>
                <p><span className="text-[#6b7280]">Items:</span> {sourceQuotation.items?.length || 0}</p>
                <p><span className="text-[#6b7280]">Total:</span> {formatCurrency(sourceQuotation.total, sourceQuotation.currency)}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSourceQuotation(null)}>Cancel</Button>
                <Button onClick={handleConvert}>Confirm & Create</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader><DialogTitle>New Quotation</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Customer</Label>
                <Select value={form.customerId} onValueChange={value => {
                  const customer = customers.find(c => c.id === value);
                  setForm(prev => ({ ...prev, customerId: value, currency: customer?.currency || prev.currency }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.map(customer => <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={event => setForm(prev => ({ ...prev, currency: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={event => setForm(prev => ({ ...prev, date: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Valid Until</Label><Input type="date" value={form.validUntil} onChange={event => setForm(prev => ({ ...prev, validUntil: event.target.value }))} /></div>
            </div>
            <LineItemGrid value={rows} onChange={setRows} currency={form.currency} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button onClick={createQuotation}>Create Quotation</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
