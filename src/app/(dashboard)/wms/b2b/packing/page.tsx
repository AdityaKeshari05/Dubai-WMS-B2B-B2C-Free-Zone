'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PackingHandlingPage() {
  const router = useRouter();
  const packages = useWmsDbSelector((s) => s.packages);
  const orders = useWmsDbSelector((s) => s.b2bOrders);

  // Only show packages/pallets for B2B orders
  const b2bPackages = useMemo(() => packages.filter(p => p.orderType === 'b2b'), [packages]);

  return (
    <div>
      <PageHeader 
        title="6.9 Pallet & Carton Handling" 
        description="Manage B2B shipments by pallet, carton, and case"
      />

      <DataTable
        data={b2bPackages}
        onRowClick={(p) => router.push(`/wms/b2b/${p.orderId}`)}
        emptyMessage="No B2B packages or pallets have been created."
        columns={[
          { key: 'tracking', header: 'Package / Tracking #', render: (p) => <span className="font-medium text-[#2490ef]">{p.trackingNumber || p.id}</span> },
          { key: 'order', header: 'Order #', render: (p) => {
            const order = orders.find(o => o.id === p.orderId);
            return <span className="text-gray-900">{order?.orderNumber || p.orderId}</span>;
          }},
          { key: 'type', header: 'Container Type', render: (p) => <Badge variant="outline" className="capitalize">{p.boxType}</Badge> },
          { key: 'weight', header: 'Weight', render: (p) => `${p.weight} kg` },
          { key: 'carrier', header: 'Carrier', render: (p) => p.carrier },
          { key: 'status', header: 'Status', render: (p) => (
            <Badge className={p.status === 'shipped' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
              {p.status.toUpperCase()}
            </Badge>
          )},
          { key: 'date', header: 'Packed Date', render: (p) => formatDate(p.packedAt) },
        ]}
      />
    </div>
  );
}
