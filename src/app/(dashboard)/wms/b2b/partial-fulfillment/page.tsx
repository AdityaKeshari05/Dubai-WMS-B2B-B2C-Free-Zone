'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { B2B_ORDER_STATUS } from '@/lib/wms/status';

export default function PartialFulfillmentPage() {
  const router = useRouter();
  const allOrders = useWmsDbSelector((s) => s.b2bOrders);
  const { customers } = useWmsLookups();
  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  // Only show partially fulfilled orders
  const orders = useMemo(() => allOrders.filter(o => o.status === 'partially_fulfilled'), [allOrders]);

  return (
    <div>
      <PageHeader 
        title="6.5 Partial Fulfillment" 
        description="Orders that have been partially shipped due to missing stock"
      />

      <DataTable
        data={orders}
        onRowClick={(o) => router.push(`/wms/b2b/${o.id}`)}
        emptyMessage="No partially fulfilled orders."
        columns={[
          { key: 'orderNumber', header: 'Order #', render: (o) => <span className="font-medium text-[#2490ef]">{o.orderNumber}</span> },
          { key: 'customer', header: 'Customer', render: (o) => customerMap.get(o.customerId)?.name ?? '—' },
          { key: 'orderDate', header: 'Order Date', render: (o) => formatDate(o.orderDate) },
          { key: 'qty', header: 'Total Qty Ordered', render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
          { key: 'fulfilled', header: 'Fulfilled Qty', render: (o) => <span className="text-green-600 font-medium">{o.items.reduce((s, i) => s + i.allocatedQty, 0)}</span> },
          { key: 'missing', header: 'Missing Qty', render: (o) => {
            const ordered = o.items.reduce((s, i) => s + i.quantity, 0);
            const fulfilled = o.items.reduce((s, i) => s + i.allocatedQty, 0);
            return <span className="text-red-600 font-medium">{ordered - fulfilled}</span>;
          }},
          { key: 'status', header: 'Status', render: (o) => <Badge variant={B2B_ORDER_STATUS.variant(o.status)}>{B2B_ORDER_STATUS.label(o.status)}</Badge> },
        ]}
      />
    </div>
  );
}
