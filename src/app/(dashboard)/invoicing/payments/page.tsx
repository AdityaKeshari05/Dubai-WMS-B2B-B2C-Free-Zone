'use client';

import { useEffect, useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
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
import { Payment, SalesInvoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const methods = ['CASH','BANK_TRANSFER','CREDIT_CARD','CHEQUE','ONLINE'];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: 'BANK_TRANSFER', date: new Date().toISOString().split('T')[0], reference: '' });
  const limit = 20;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [payRes, invRes] = await Promise.all([
        api.get('/invoicing/payments', { params: { page, limit } }),
        api.get('/invoicing/sales-invoices', { params: { limit: 200 } }),
      ]);
      setPayments(payRes.data.data.items);
      setTotal(payRes.data.data.total);
      setInvoices(invRes.data.data.items.filter((i: SalesInvoice) => ['SENT','OVERDUE','PARTIAL'].includes(i.status)));
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/invoicing/payments', { ...form, amount: Number(form.amount), type: 'RECEIVED' });
      toast.success('Payment recorded');
      setShowModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'paymentNo', header: 'Payment #', render: (p: Payment) => <span className="font-mono text-sm font-semibold">{p.paymentNo}</span> },
    { key: 'date', header: 'Date', render: (p: Payment) => formatDate(p.date) },
    { key: 'amount', header: 'Amount', render: (p: Payment) => <span className="font-semibold text-green-700">{formatCurrency(p.amount, p.currency)}</span> },
    { key: 'method', header: 'Method', render: (p: Payment) => <StatusBadge status={p.method} /> },
    { key: 'type', header: 'Type', render: (p: Payment) => <StatusBadge status={p.type} /> },
    { key: 'reference', header: 'Reference', render: (p: Payment) => p.reference || '—' },
  ];

  return (
    <div>
      <PageHeader title="Payments" description="Track received and made payments" action={{ label: 'Record Payment', onClick: () => setShowModal(true), icon: Plus }} />
      {payments.length === 0 && !isLoading ? (
        <EmptyState icon={CreditCard} title="No payments" description="No payments recorded yet" action={{ label: 'Record Payment', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={payments} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Invoice *</Label>
              <Select value={form.invoiceId} onValueChange={v => setForm(f => ({ ...f, invoiceId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                <SelectContent>
                  {invoices.map(i => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.invoiceNo} — {i.customer?.name} — {formatCurrency(i.total - i.amountPaid, i.currency)} due
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></div>
              <div className="space-y-1.5">
                <Label>Method *</Label>
                <Select value={form.method} onValueChange={v => setForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{methods.map(m => <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label>Reference</Label><Input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Record Payment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
