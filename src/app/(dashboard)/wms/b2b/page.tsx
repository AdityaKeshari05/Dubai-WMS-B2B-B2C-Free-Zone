'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ClipboardList, Clock, Boxes, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { B2B_ORDER_STATUS, PRIORITY_VARIANT } from '@/lib/wms/status';
import { formatDate } from '@/lib/utils';
import { CreateB2BOrderModal } from '@/components/wms/b2b/CreateB2BOrderModal';
import type { B2BOrderStatus } from '@/types';

export default function B2BOrdersPage() {
  const router = useRouter();
  const orders = useWmsDbSelector((s) => s.b2bOrders);
  const { customers } = useWmsLookups();
  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return [...orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((o) => {
        if (status !== 'ALL' && o.status !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          const customerName = customerMap.get(o.customerId)?.name ?? '';
          if (!o.orderNumber.toLowerCase().includes(q) && !customerName.toLowerCase().includes(q)) return false;
        }
        return true;
      });
  }, [orders, status, search, customerMap]);

  const stats = useMemo(() => {
    const count = (s: string) => orders.filter((o) => o.status === s).length;
    return {
      total: orders.length,
      pending: count('draft') + count('confirmed'),
      allocated: count('allocated'),
      picking: count('picking'),
      partial: count('partially_fulfilled'),
      backordered: count('backordered'),
      completed: count('delivered'),
    };
  }, [orders]);

  return (
    <div>
      <PageHeader title="B2B Orders" description="Manage business customer orders and fulfillment" action={{ label: 'Create Order', onClick: () => setCreateOpen(true), icon: Plus }} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatsCard title="Total" value={stats.total} icon={ClipboardList} />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} iconColor="text-gray-600" iconBg="bg-gray-100" />
        <StatsCard title="Allocated" value={stats.allocated} icon={Boxes} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Picking" value={stats.picking} icon={Truck} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Partial" value={stats.partial} icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Backordered" value={stats.backordered} icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Input placeholder="Search order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {(['draft', 'confirmed', 'allocated', 'partially_fulfilled', 'backordered', 'picking', 'packed', 'dispatched', 'delivered', 'cancelled'] as B2BOrderStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{B2B_ORDER_STATUS.label(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filtered}
        onRowClick={(o) => router.push(`/wms/b2b/${o.id}`)}
        emptyMessage="No B2B orders found"
        columns={[
          { key: 'orderNumber', header: 'Order #', render: (o) => <span className="font-medium text-[#2490ef]">{o.orderNumber}</span> },
          { key: 'customer', header: 'Customer', render: (o) => customerMap.get(o.customerId)?.name ?? '—' },
          { key: 'orderDate', header: 'Order Date', render: (o) => formatDate(o.orderDate) },
          { key: 'items', header: 'Items', render: (o) => o.items.length },
          { key: 'qty', header: 'Total Qty', render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
          { key: 'allocated', header: 'Allocated', render: (o) => o.items.reduce((s, i) => s + i.allocatedQty, 0) },
          { key: 'priority', header: 'Priority', render: (o) => <Badge variant={PRIORITY_VARIANT[o.priority]}>{o.priority}</Badge> },
          { key: 'status', header: 'Status', render: (o) => <Badge variant={B2B_ORDER_STATUS.variant(o.status)}>{B2B_ORDER_STATUS.label(o.status)}</Badge> },
          { key: 'delivery', header: 'Delivery Date', render: (o) => formatDate(o.expectedDelivery) },
        ]}
      />

      <CreateB2BOrderModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
