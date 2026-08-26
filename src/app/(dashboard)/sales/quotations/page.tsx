'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, AlertCircle, ArrowRight, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SelectEmptyState } from '@/components/shared/SelectEmptyState';
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
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [sourceQuotation, setSourceQuotation] = useState<Quotation | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [form, setForm] = useState({
    customerId: '',
    date: new Date().toISOString().slice(0, 10),
    validUntil: '',
    currency: 'USD',
    notes: '',
    terms: '',
  });
  const [rows, setRows] = useState<LineItemRow[]>([
    { productId: '', itemCode: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 },
  ]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 20;

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/sales/quotations', { params: { page, limit } });
      setQuotations(res.data?.data?.items || []);
      setTotal(res.data?.data?.total || 0);
    } catch (err: any) {
      showApiError(err, 'Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers', { params: { limit: 200, isActive: true } });
      setCustomers(res.data?.data?.items || res.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load customers');
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleConvert = async () => {
    if (!sourceQuotation || isConverting) return;
    setIsConverting(true);
    try {
      const res = await api.post(`/sales-orders/from-quotation/${sourceQuotation.id}`);
      const order = res.data?.data;
      showApiSuccess('Quotation successfully converted to Sales Order');
      setSourceQuotation(null);
      if (order?.id) {
        router.push(`/sales/orders?created=${order.id}`);
      } else {
        router.push('/sales/orders');
      }
    } catch (err: any) {
      showApiError(err, 'Failed to convert quotation to sales order');
    } finally {
      setIsConverting(false);
    }
  };

  const createQuotation = async () => {
    if (isSubmitting) return;

    if (!form.customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (!form.date) {
      toast.error('Please select a quotation date');
      return;
    }
    if (form.validUntil && new Date(form.validUntil) < new Date(form.date)) {
      toast.error('Valid Until date cannot be before Quotation date');
      return;
    }

    const items = rows
      .filter((row) => (row.itemCode && row.itemCode.trim()) || (row.description && row.description.trim()) || row.productId)
      .map((row) => ({
        productId: row.productId || undefined,
        itemCode: row.itemCode?.trim() || undefined,
        description: row.description?.trim() || undefined,
        quantity: Number(row.quantity || 0),
        unitPrice: Number(row.unitPrice || 0),
        taxTemplateId: row.taxTemplateId || undefined,
        taxRate: Number(row.taxRate || 0),
        discount: Number(row.discount || 0),
      }));

    if (!items.length) {
      toast.error('Please add at least one line item with a code or description');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].quantity <= 0) {
        toast.error(`Line ${i + 1}: Quantity must be greater than zero`);
        return;
      }
      if (items[i].unitPrice < 0) {
        toast.error(`Line ${i + 1}: Unit price cannot be negative`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (editingId) await api.put(`/sales/quotations/${editingId}`, { ...form, items });
      else await api.post('/sales/quotations', { ...form, items });
      showApiSuccess(`Quotation ${editingId ? 'updated' : 'created'} successfully`);
      setNewOpen(false);
      setForm({
        customerId: '',
        date: new Date().toISOString().slice(0, 10),
        validUntil: '',
        currency: 'USD',
        notes: '',
        terms: '',
      });
      setRows([
        { productId: '', itemCode: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 },
      ]);
      setEditingId(null);
      fetchQuotations();
    } catch (err: any) {
      showApiError(err, 'Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editQuotation = async (quotation: Quotation) => {
    try {
      const res = await api.get(`/sales/quotations/${quotation.id}`); const q = res.data?.data || quotation;
      setEditingId(q.id); setForm({ customerId: q.customerId, date: String(q.date).slice(0, 10), validUntil: q.validUntil ? String(q.validUntil).slice(0, 10) : '', currency: q.currency, notes: q.notes || '', terms: q.terms || '' });
      setRows((q.items || []).map((i: any) => ({ ...i, itemCode: i.itemCode || i.product?.sku || '', total: Number(i.total || 0) })));
      setNewOpen(true);
    } catch (err) { showApiError(err, 'Failed to load quotation for editing'); }
  };

  const columns = [
    {
      key: 'quotationNo',
      header: 'Quotation #',
      render: (q: Quotation) => <span className="font-mono text-sm font-semibold text-blue-600">{q.quotationNo}</span>,
    },
    { key: 'customer', header: 'Customer', render: (q: Quotation) => (q.customer as any)?.name || '—' },
    { key: 'date', header: 'Date', render: (q: Quotation) => formatDate(q.date) },
    {
      key: 'validUntil',
      header: 'Valid Until',
      render: (q: Quotation) => (q.validUntil ? formatDate(q.validUntil) : '—'),
    },
    {
      key: 'total',
      header: 'Total',
      render: (q: Quotation) => <span className="font-semibold">{formatCurrency(q.total, q.currency)}</span>,
    },
    { key: 'status', header: 'Status', render: (q: Quotation) => <StatusBadge status={q.status} /> },
    {
      key: 'actions',
      header: '',
      render: (q: Quotation) => <div className="flex gap-2">{q.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); editQuotation(q); }}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>}
        {q.status === 'ACCEPTED' || q.status === 'SENT' ? (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSourceQuotation(q);
            }}
          >
            Create Sales Order
          </Button>
        ) : null}</div>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quotations"
        description="Create and manage customer quotations"
        action={{ label: 'New Quotation', onClick: () => { setEditingId(null); setNewOpen(true); }, icon: Plus }}
      />
      {quotations.length === 0 && !isLoading ? (
        <EmptyState
          icon={FileText}
          title="No quotations found"
          description="Create sales quotations with pricing, taxes, and terms to send to customers."
          action={{ label: 'New Quotation', onClick: () => setNewOpen(true) }}
        />
      ) : (
        <>
          <DataTable columns={columns} data={quotations} isLoading={isLoading} />
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

      {/* Convert Quotation to Sales Order Dialog */}
      <Dialog open={!!sourceQuotation} onOpenChange={() => setSourceQuotation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Sales Order from Quotation?</DialogTitle>
          </DialogHeader>
          {sourceQuotation && (
            <div className="space-y-4">
              <div className="rounded-md border border-[#e5e2dc] bg-[#f8faf9] p-3 text-sm space-y-1">
                <p>
                  <span className="text-[#6b7280]">Source Quotation:</span>{' '}
                  <span className="font-mono font-semibold">{sourceQuotation.quotationNo}</span>
                </p>
                <p>
                  <span className="text-[#6b7280]">Customer:</span>{' '}
                  {(sourceQuotation.customer as any)?.name || sourceQuotation.customerId}
                </p>
                <p>
                  <span className="text-[#6b7280]">Items:</span> {sourceQuotation.items?.length || 0}
                </p>
                <p>
                  <span className="text-[#6b7280]">Total Amount:</span>{' '}
                  <span className="font-semibold">{formatCurrency(sourceQuotation.total, sourceQuotation.currency)}</span>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSourceQuotation(null)}>
                  Cancel
                </Button>
                <Button onClick={handleConvert} disabled={isConverting}>
                  {isConverting ? 'Converting...' : 'Confirm & Convert'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Quotation Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'New'} Quotation</DialogTitle>
          </DialogHeader>

          {customers.length === 0 && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>No customers found. You need at least one customer to create a quotation.</span>
              </div>
              <Link
                href="/customers"
                className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline shrink-0 text-xs"
              >
                <span>Create Customer</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          <div className="grid gap-4 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Customer *</Label>
                <Select
                  value={form.customerId}
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c.id === value);
                    setForm((prev) => ({
                      ...prev,
                      customerId: value,
                      currency: customer?.currency || prev.currency,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <SelectEmptyState
                        message="No customers found"
                        linkHref="/customers"
                        linkText="Create Customer"
                      />
                    ) : (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Quotation Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(event) => setForm((prev) => ({ ...prev, validUntil: event.target.value }))}
                />
              </div>
            </div>

            <LineItemGrid value={rows} onChange={setRows} currency={form.currency} />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createQuotation} disabled={isSubmitting || customers.length === 0}>
                {isSubmitting ? 'Saving Quotation...' : editingId ? 'Update Quotation' : 'Create Quotation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
