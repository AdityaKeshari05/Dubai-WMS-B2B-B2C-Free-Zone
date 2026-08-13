'use client';

import { useEffect, useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
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
import { SalesOrder } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [sourceOrder, setSourceOrder] = useState<SalesOrder | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', date: new Date().toISOString().slice(0, 10), deliveryDate: '', currency: 'USD', notes: '', terms: '' });
  const [rows, setRows] = useState<LineItemRow[]>([{ productId: '', itemCode: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 }]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 20;

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/sales/orders', { params: { page, limit } });
      setOrders(res.data.data.items);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load orders'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page]);
  useEffect(() => {
    api.get('/customers', { params: { limit: 200, isActive: true } }).then(res => setCustomers(res.data?.data?.items || res.data?.data || [])).catch(() => toast.error('Failed to load customers'));
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/sales/orders/${id}/status`, { status });
      toast.success('Order updated');
      fetchOrders();
    } catch { toast.error('Failed'); }
  };

  const createInvoiceFromOrder = async () => {
    if (!sourceOrder) return;
    try {
      const res = await api.post(`/invoices/from-sales-order/${sourceOrder.id}`);
      const invoice = res.data?.data;
      toast.success('Draft invoice created');
      router.push(`/invoicing/sales-invoices/${invoice.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const createDeliveryFromOrder = async (order: SalesOrder) => {
    try {
      const res = await api.post(`/delivery-notes/from-sales-order/${order.id}`);
      toast.success('Draft delivery note created');
      router.push(`/invoicing/delivery-notes?created=${res.data?.data?.id || ''}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create delivery note');
    }
  };

  const createOrder = async () => {
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
      await api.post('/sales/orders', { ...form, items });
      toast.success('Sales order created');
      setNewOpen(false);
      setRows([{ productId: '', itemCode: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0, total: 0 }]);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create sales order');
    }
  };

  const columns = [
    { key: 'orderNo', header: 'Order #', render: (o: SalesOrder) => <span className="font-mono text-sm font-semibold text-blue-600">{o.orderNo}</span> },
    { key: 'customer', header: 'Customer', render: (o: SalesOrder) => (o.customer as any)?.name || '—' },
    { key: 'date', header: 'Date', render: (o: SalesOrder) => formatDate(o.date) },
    { key: 'deliveryDate', header: 'Delivery', render: (o: SalesOrder) => o.deliveryDate ? formatDate(o.deliveryDate) : '—' },
    { key: 'total', header: 'Total', render: (o: SalesOrder) => <span className="font-semibold">{formatCurrency(o.total, o.currency)}</span> },
    { key: 'status', header: 'Status', render: (o: SalesOrder) => <StatusBadge status={o.status} /> },
    { key: 'actions', header: '', render: (o: SalesOrder) => (
      <div className="flex gap-1">
        {o.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(o.id, 'CONFIRMED'); }}>Confirm</Button>}
        {['CONFIRMED','PROCESSING','SHIPPED'].includes(o.status) && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); createDeliveryFromOrder(o); }}>Create Delivery</Button>}
        {['CONFIRMED','PROCESSING','SHIPPED','DELIVERED'].includes(o.status) && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSourceOrder(o); }}>Create Invoice</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Sales Orders" description="Manage customer orders" action={{ label: 'New Sales Order', onClick: () => setNewOpen(true), icon: Plus }} />
      {orders.length === 0 && !isLoading ? (
        <EmptyState icon={ShoppingCart} title="No sales orders" description="Sales orders will appear here when created from quotations or directly" />
      ) : (
        <>
          <DataTable columns={columns} data={orders} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={!!sourceOrder} onOpenChange={() => setSourceOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create invoice from sales order?</DialogTitle></DialogHeader>
          {sourceOrder && (
            <div className="space-y-4">
              <div className="rounded-md border border-[#e5e2dc] bg-[#f8faf9] p-3 text-sm">
                <p><span className="text-[#6b7280]">Source:</span> <span className="font-mono font-semibold">{sourceOrder.orderNo}</span></p>
                <p><span className="text-[#6b7280]">Customer:</span> {sourceOrder.customer?.name || sourceOrder.customerId}</p>
                <p><span className="text-[#6b7280]">Items:</span> {sourceOrder.items?.length || 0}</p>
                <p><span className="text-[#6b7280]">Total:</span> {formatCurrency(sourceOrder.total, sourceOrder.currency)}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSourceOrder(null)}>Cancel</Button>
                <Button onClick={createInvoiceFromOrder}>Confirm & Create</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader><DialogTitle>New Sales Order</DialogTitle></DialogHeader>
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
              <div className="space-y-1.5"><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={event => setForm(prev => ({ ...prev, deliveryDate: event.target.value }))} /></div>
            </div>
            <LineItemGrid value={rows} onChange={setRows} currency={form.currency} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button onClick={createOrder}>Create Order</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
