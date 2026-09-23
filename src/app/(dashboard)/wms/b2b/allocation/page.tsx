'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { B2B_ORDER_STATUS, PRIORITY_VARIANT } from '@/lib/wms/status';

export default function AllocationPage() {
  const router = useRouter();
  const allOrders = useWmsDbSelector((s) => s.b2bOrders);
  const { customers } = useWmsLookups();
  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  // Only show confirmed orders waiting to be allocated
  const orders = useMemo(() => allOrders.filter(o => o.status === 'confirmed'), [allOrders]);

  return (
    <div>
      <PageHeader 
        title="6.4 Order Allocation" 
        description="Orders awaiting inventory reservation"
      />

      <DataTable
        data={orders}
        onRowClick={(o) => router.push(`/wms/b2b/${o.id}`)}
        emptyMessage="No orders currently need allocation. Check back later."
        columns={[
          { key: 'orderNumber', header: 'Order #', render: (o) => <span className="font-medium text-[#2490ef]">{o.orderNumber}</span> },
          { key: 'customer', header: 'Customer', render: (o) => customerMap.get(o.customerId)?.name ?? '—' },
          { key: 'orderDate', header: 'Order Date', render: (o) => formatDate(o.orderDate) },
          { key: 'qty', header: 'Total Qty Needed', render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
          { key: 'priority', header: 'Priority', render: (o) => <Badge variant={PRIORITY_VARIANT[o.priority]}>{o.priority}</Badge> },
          { key: 'status', header: 'Status', render: (o) => <Badge variant={B2B_ORDER_STATUS.variant(o.status)}>{B2B_ORDER_STATUS.label(o.status)}</Badge> },
        ]}
      />
    </div>
  );
}
