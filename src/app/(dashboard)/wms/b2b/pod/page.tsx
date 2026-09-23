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

export default function ProofOfDeliveryPage() {
  const router = useRouter();
  const allOrders = useWmsDbSelector((s) => s.b2bOrders);
  const { customers } = useWmsLookups();
  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  // Show dispatched or delivered orders for POD management
  const orders = useMemo(() => allOrders.filter(o => o.status === 'dispatched' || o.status === 'delivered'), [allOrders]);

  return (
    <div>
      <PageHeader 
        title="6.11 Proof of Delivery" 
        description="Capture and view delivery confirmations for completed B2B shipments"
      />

      <DataTable
        data={orders}
        onRowClick={(o) => router.push(`/wms/b2b/${o.id}`)}
        emptyMessage="No dispatched or delivered orders require POD."
        columns={[
          { key: 'orderNumber', header: 'Order #', render: (o) => <span className="font-medium text-[#2490ef]">{o.orderNumber}</span> },
          { key: 'customer', header: 'Customer', render: (o) => customerMap.get(o.customerId)?.name ?? '—' },
          { key: 'deliveryDate', header: 'Delivery Date', render: (o) => formatDate(o.expectedDelivery) },
          { key: 'podStatus', header: 'POD Status', render: (o) => (
            <Badge className={o.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
              {o.status === 'delivered' ? 'Signed & Confirmed' : 'Awaiting POD'}
            </Badge>
          )},
          { key: 'status', header: 'Order Status', render: (o) => <Badge variant={B2B_ORDER_STATUS.variant(o.status)}>{B2B_ORDER_STATUS.label(o.status)}</Badge> },
        ]}
      />
    </div>
  );
}
