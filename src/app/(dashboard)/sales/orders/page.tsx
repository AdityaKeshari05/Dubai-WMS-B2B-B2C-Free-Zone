'use client';

import { useEffect, useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { SalesOrder } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
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

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/sales/orders/${id}/status`, { status });
      toast.success('Order updated');
      fetchOrders();
    } catch { toast.error('Failed'); }
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
        {o.status === 'CONFIRMED' && <Button size="sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(o.id, 'SHIPPED'); }}>Ship</Button>}
        {o.status === 'SHIPPED' && <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(o.id, 'DELIVERED'); }}>Deliver</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Sales Orders" description="Manage customer orders" />
      {orders.length === 0 && !isLoading ? (
        <EmptyState icon={ShoppingCart} title="No sales orders" description="Sales orders will appear here when created from quotations or directly" />
      ) : (
        <>
          <DataTable columns={columns} data={orders} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
