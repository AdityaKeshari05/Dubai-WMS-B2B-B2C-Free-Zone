'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { formatDate } from '@/lib/utils';

export default function ASNPage() {
  const asns = useWmsDbSelector((s) => s.asns);
  const orders = useWmsDbSelector((s) => s.b2bOrders);
  const { customers } = useWmsLookups();
  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);

  return (
    <div>
      <PageHeader title="Advance Shipment Notices" description="ASNs issued to B2B customers" />
      
      <DataTable
        data={asns}
        columns={[
          { key: 'asnNumber', header: 'ASN #', render: (a) => <span className="font-medium text-gray-900">{a.asnNumber}</span> },
          { key: 'order', header: 'Order', render: (a) => {
            const order = orders.find((o) => o.id === a.orderId);
            return (
              <Link href={`/wms/b2b/${a.orderId}`} className="text-[#2490ef] hover:underline">
                {order?.orderNumber}
              </Link>
            );
          }},
          { key: 'customer', header: 'Customer', render: (a) => customerMap.get(a.customerId)?.name },
          { key: 'dispatch', header: 'Expected Dispatch', render: (a) => <span className="text-xs text-gray-500">{formatDate(a.expectedDispatch)}</span> },
          { key: 'delivery', header: 'Expected Delivery', render: (a) => <span className="text-xs text-gray-500">{formatDate(a.expectedDelivery)}</span> },
          { key: 'status', header: 'Status', render: (a) => <Badge variant="secondary">{a.status}</Badge> },
        ]}
        emptyMessage="No ASNs issued. Create an ASN from a B2B order detail page."
      />
    </div>
  );
}
