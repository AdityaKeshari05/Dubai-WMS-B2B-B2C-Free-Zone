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

export default function DeliverySchedulingPage() {
  const router = useRouter();
  const allOrders = useWmsDbSelector((s) => s.b2bOrders);
  const { customers } = useWmsLookups();
  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  // Show packed or dispatched orders for delivery scheduling
  const orders = useMemo(() => allOrders.filter(o => o.status === 'packed' || o.status === 'dispatched'), [allOrders]);

  return (
    <div>
      <PageHeader 
        title="6.10 Delivery Scheduling" 
        description="Schedule and manage customer delivery dates and time windows"
      />

      <DataTable
        data={orders}
        onRowClick={(o) => router.push(`/wms/b2b/${o.id}`)}
        emptyMessage="No packed or dispatched orders waiting for delivery."
        columns={[
          { key: 'orderNumber', header: 'Order #', render: (o) => <span className="font-medium text-[#2490ef]">{o.orderNumber}</span> },
          { key: 'customer', header: 'Customer', render: (o) => customerMap.get(o.customerId)?.name ?? '—' },
          { key: 'expected', header: 'Scheduled Delivery', render: (o) => <span className="font-medium text-gray-900">{formatDate(o.expectedDelivery)}</span> },
          { key: 'status', header: 'Status', render: (o) => <Badge variant={B2B_ORDER_STATUS.variant(o.status)}>{B2B_ORDER_STATUS.label(o.status)}</Badge> },
        ]}
      />
    </div>
  );
}
