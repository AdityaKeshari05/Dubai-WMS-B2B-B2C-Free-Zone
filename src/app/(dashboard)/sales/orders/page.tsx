'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ShoppingCart, AlertCircle, ArrowRight, Pencil } from 'lucide-react';
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
import { SalesOrder } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [sourceOrder, setSourceOrder] = useState<SalesOrder | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isCreatingDelivery, setIsCreatingDelivery] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerId: '',
    date: new Date().toISOString().slice(0, 10),
    deliveryDate: '',
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

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/sales/orders', { params: { page, limit } });
      setOrders(res.data?.data?.items || []);
      setTotal(res.data?.data?.total || 0);
    } catch (err: any) {
      showApiError(err, 'Failed to load sales orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers', { params: { limit: 200, isActive: true } });
      setCustomers(res.data?.data?.items || res.data?.data || []);
    } catch (err: any) {
      showApiError(err, 'Failed to load customers list');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(id);
    try {
      await api.put(`/sales/orders/${id}/status`, { status });
      showApiSuccess(`Order status updated to ${status}`);
      fetchOrders();
    } catch (err: any) {
      showApiError(err, 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const createInvoiceFromOrder = async () => {
    if (!sourceOrder || isCreatingInvoice) return;
    setIsCreatingInvoice(true);
    try {
      const res = await api.post(`/invoices/from-sales-order/${sourceOrder.id}`);
      const invoice = res.data?.data;
      showApiSuccess('Draft sales invoice created from order');
      setSourceOrder(null);
      if (invoice?.id) {
        router.push(`/invoicing/sales-invoices/${invoice.id}`);
      }
    } catch (err: any) {
      showApiError(err, 'Failed to create invoice from sales order');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const createDeliveryFromOrder = async (order: SalesOrder) => {
    if (isCreatingDelivery) return;
    setIsCreatingDelivery(true);
    try {
      const res = await api.post(`/delivery-notes/from-sales-order/${order.id}`);
      showApiSuccess('Draft delivery note created from order');
      router.push(`/invoicing/delivery-notes?created=${res.data?.data?.id || ''}`);
    } catch (err: any) {
      showApiError(err, 'Failed to create delivery note from sales order');
    } finally {
      setIsCreatingDelivery(false);
    }
  };

  const createOrder = async () => {
    if (isSubmitting) return;

    if (!form.customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (!form.date) {
      toast.error('Please select an order date');
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
      if (editingId) await api.put(`/sales/orders/${editingId}`, { ...form, items });
      else await api.post('/sales/orders', { ...form, items });
      showApiSuccess(`Sales order ${editingId ? 'updated' : 'created'} successfully`);
      setNewOpen(false);
      setForm({
        customerId: '',
        date: new Date().toISOString().slice(0, 10),
        deliveryDate: '',
        currency: 'USD',
        notes: '',
        terms: '',
      });
      setRows([
        { productId: '', itemCode: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 },
      ]);
      setEditingId(null);
      fetchOrders();
    } catch (err: any) {
      showApiError(err, 'Failed to create sales order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editOrder = async (order: SalesOrder) => {
    try {
      const res = await api.get(`/sales/orders/${order.id}`); const row = res.data?.data || order;
      setEditingId(row.id);
      setForm({ customerId: row.customerId, date: String(row.date).slice(0, 10), deliveryDate: row.deliveryDate ? String(row.deliveryDate).slice(0, 10) : '', currency: row.currency, notes: row.notes || '', terms: row.terms || '' });
      setRows((row.items || []).map((i: any) => ({ ...i, itemCode: i.itemCode || i.product?.sku || '', total: Number(i.total || 0) })));
      setNewOpen(true);
    } catch (err) { showApiError(err, 'Failed to load sales order for editing'); }
  };

  const columns = [
    {
      key: 'orderNo',
      header: 'Order #',
      render: (o: SalesOrder) => <span className="font-mono text-sm font-semibold text-blue-600">{o.orderNo}</span>,
    },
    { key: 'customer', header: 'Customer', render: (o: SalesOrder) => (o.customer as any)?.name || '—' },
    { key: 'date', header: 'Date', render: (o: SalesOrder) => formatDate(o.date) },
    {
      key: 'deliveryDate',
      header: 'Delivery Date',
      render: (o: SalesOrder) => (o.deliveryDate ? formatDate(o.deliveryDate) : '—'),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o: SalesOrder) => <span className="font-semibold">{formatCurrency(o.total, o.currency)}</span>,
    },
    { key: 'status', header: 'Status', render: (o: SalesOrder) => <StatusBadge status={o.status} /> },
    {
      key: 'actions',
      header: '',
      render: (o: SalesOrder) => (
        <div className="flex gap-1">
          {o.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); editOrder(o); }}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>}
          {o.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="outline"
              disabled={updatingOrderId === o.id}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(o.id, 'CONFIRMED');
              }}
            >
              {updatingOrderId === o.id ? 'Updating...' : 'Confirm'}
            </Button>
          )}
          {['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status) && (
            <Button
              size="sm"
              variant="outline"
              disabled={isCreatingDelivery}
              onClick={(e) => {
                e.stopPropagation();
                createDeliveryFromOrder(o);
              }}
            >
              Create Delivery
            </Button>
          )}
          {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status) && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSourceOrder(o);
              }}
            >
              Create Invoice
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales Orders"
        description="Manage and track customer sales orders"
        action={{ label: 'New Sales Order', onClick: () => { setEditingId(null); setNewOpen(true); }, icon: Plus }}
      />
      {orders.length === 0 && !isLoading ? (
        <EmptyState
          icon={ShoppingCart}
          title="No sales orders found"
          description="Sales orders will appear here when created directly or converted from accepted quotations."
          action={{ label: 'New Sales Order', onClick: () => setNewOpen(true) }}
        />
      ) : (
        <>
          <DataTable columns={columns} data={orders} isLoading={isLoading} />
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

      {/* Convert to Invoice Confirmation Dialog */}
      <Dialog open={!!sourceOrder} onOpenChange={() => setSourceOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice from Sales Order</DialogTitle>
          </DialogHeader>
          {sourceOrder && (
            <div className="space-y-4">
              <div className="rounded-md border border-[#e5e2dc] bg-[#f8faf9] p-3 text-sm space-y-1">
                <p>
                  <span className="text-[#6b7280]">Source Order:</span>{' '}
                  <span className="font-mono font-semibold">{sourceOrder.orderNo}</span>
                </p>
                <p>
                  <span className="text-[#6b7280]">Customer:</span>{' '}
                  {(sourceOrder.customer as any)?.name || sourceOrder.customerId}
                </p>
                <p>
                  <span className="text-[#6b7280]">Items:</span> {sourceOrder.items?.length || 0}
                </p>
                <p>
                  <span className="text-[#6b7280]">Total Amount:</span>{' '}
                  <span className="font-semibold">{formatCurrency(sourceOrder.total, sourceOrder.currency)}</span>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSourceOrder(null)}>
                  Cancel
                </Button>
                <Button onClick={createInvoiceFromOrder} disabled={isCreatingInvoice}>
                  {isCreatingInvoice ? 'Creating Invoice...' : 'Confirm & Create Invoice'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Sales Order Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'New'} Sales Order</DialogTitle>
          </DialogHeader>

          {customers.length === 0 && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>No customers found. You need at least one customer to create a sales order.</span>
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
                <Label>Order Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, deliveryDate: event.target.value }))}
                />
              </div>
            </div>

            <LineItemGrid value={rows} onChange={setRows} currency={form.currency} />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createOrder} disabled={isSubmitting || customers.length === 0}>
                {isSubmitting ? 'Saving Order...' : editingId ? 'Update Sales Order' : 'Create Sales Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
