'use client';
import { useRouter } from 'next/navigation';
import { Tag, Send, CheckCircle2, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { Badge } from '@/components/ui/badge';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { SHIPMENT_STATUS } from '@/lib/wms/status';
import { formatDateTime } from '@/lib/utils';

export default function DispatchDashboardPage() {
  const router = useRouter();
  const shipments = useWmsDbSelector((s) => s.shipments);
  const stats = {
    labelCreated: shipments.filter((s) => s.status === 'label_created').length,
    inTransit: shipments.filter((s) => ['in_transit', 'picked_up', 'out_for_delivery'].includes(s.status)).length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
    rto: shipments.filter((s) => s.status === 'rto' || s.status === 'failed').length,
  };

  return (
    <div>
      <PageHeader title="Dispatch" description="Final verification, consolidation and dispatch of shipments" />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard title="Label Created" value={stats.labelCreated} icon={Tag} iconColor="text-gray-600" iconBg="bg-gray-100" />
        <StatsCard title="In Transit" value={stats.inTransit} icon={Send} />
        <StatsCard title="Delivered" value={stats.delivered} icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="RTO / Failed" value={stats.rto} icon={RotateCcw} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      <DataTable
        data={[...shipments].reverse()}
        onRowClick={(s) => router.push(`/wms/fulfillment/dispatch/${s.id}`)}
        emptyMessage="No shipments yet - shipments are created once packages are packed and consolidated"
        columns={[
          { key: 'shipmentNumber', header: 'Shipment #', render: (s) => <span className="font-medium text-[#2490ef]">{s.shipmentNumber}</span> },
          { key: 'orderType', header: 'Order', render: (s) => <span className="text-xs uppercase text-gray-500">{s.orderType}</span> },
          { key: 'carrier', header: 'Carrier' },
          { key: 'trackingNumber', header: 'Tracking', render: (s) => <span className="font-mono text-xs">{s.trackingNumber}</span> },
          { key: 'packages', header: 'Packages', render: (s) => s.packageIds.length },
          { key: 'status', header: 'Status', render: (s) => <Badge variant={SHIPMENT_STATUS.variant(s.status)}>{SHIPMENT_STATUS.label(s.status)}</Badge> },
          { key: 'created', header: 'Created', render: (s) => formatDateTime(s.createdAt) },
        ]}
      />
    </div>
  );
}
