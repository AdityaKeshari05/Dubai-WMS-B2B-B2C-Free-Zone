'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineItemGrid, LineItemRow, calculateLineSummary } from '@/components/invoicing/LineItemGrid';
import api from '@/lib/api';
import { Customer } from '@/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const initialRows: LineItemRow[] = [{ productId: '', itemCode: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 }];

export default function NewSalesInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ customerId: '', date: new Date().toISOString().slice(0, 10), dueDate: '', currency: 'USD', notes: '', terms: '' });
  const [rows, setRows] = useState<LineItemRow[]>(initialRows);
  const summary = useMemo(() => calculateLineSummary(rows), [rows]);

  useEffect(() => {
    api.get('/customers', { params: { limit: 100, isActive: true } })
      .then(res => setCustomers(res.data?.data?.items || res.data?.data || []))
      .catch(() => toast.error('Failed to load customers'));
  }, []);

  const createInvoice = async () => {
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
    if (!items.length) return toast.error('Add at least one line item');

    setIsSaving(true);
    try {
      const res = await api.post('/invoices', { ...form, items });
      const invoice = res.data?.data;
      toast.success('Draft invoice created');
      router.push(`/invoicing/sales-invoices/${invoice.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/invoicing/sales-invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back to invoices</Link>
          </Button>
          <h1 className="text-xl font-semibold text-[#1f2937]">New Sales Invoice</h1>
          <p className="text-sm text-[#6b7280]">Create a draft invoice. Totals are confirmed by the backend after save.</p>
        </div>
        <Button onClick={createInvoice} disabled={isSaving}><Save className="mr-2 h-4 w-4" />Create Draft</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={event => setForm(prev => ({ ...prev, dueDate: event.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Notes</Label><Input value={form.notes} onChange={event => setForm(prev => ({ ...prev, notes: event.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Terms</Label><Input value={form.terms} onChange={event => setForm(prev => ({ ...prev, terms: event.target.value }))} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent>
          <LineItemGrid value={rows} onChange={setRows} currency={form.currency} />
          <div className="mt-3 flex justify-end text-sm">
            <div className="rounded-md border border-[#e5e2dc] bg-[#f8faf9] px-4 py-2">
              Draft total preview: <span className="font-semibold">{formatCurrency(summary.total, form.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
