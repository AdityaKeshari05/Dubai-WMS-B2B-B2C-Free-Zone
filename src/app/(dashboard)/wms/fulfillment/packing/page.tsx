'use client';
import { useRouter } from 'next/navigation';
import { Package, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { Badge } from '@/components/ui/badge';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { PACKAGE_STATUS } from '@/lib/wms/status';

export default function PackingDashboardPage() {
  const router = useRouter();
  const packages = useWmsDbSelector((s) => s.packages);
  const stats = {
    pending: packages.filter((p) => p.status === 'pending').length,
    verifying: packages.filter((p) => p.status === 'verifying').length,
    packed: packages.filter((p) => p.status === 'packed').length,
    readyToShip: packages.filter((p) => p.status === 'ready_to_ship').length,
  };

  return (
    <div>
      <PageHeader title="Packing" description="Packing stations, verification and shipping label generation" />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard title="Pending" value={stats.pending} icon={Clock} iconColor="text-gray-600" iconBg="bg-gray-100" />
        <StatsCard title="Verifying" value={stats.verifying} icon={Loader2} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Packed" value={stats.packed} icon={Package} />
        <StatsCard title="Ready to Ship" value={stats.readyToShip} icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>

      <DataTable
        data={[...packages].reverse()}
        onRowClick={(p) => router.push(`/wms/fulfillment/packing/${p.id}`)}
        emptyMessage="No packages yet - packages are created from an order once items are picked"
        columns={[
          { key: 'packageNumber', header: 'Package #', render: (p) => <span className="font-medium text-[#2490ef]">{p.packageNumber}</span> },
          { key: 'orderType', header: 'Order', render: (p) => <span className="text-xs uppercase text-gray-500">{p.orderType}</span> },
          { key: 'boxType', header: 'Box Type', render: (p) => <span className="capitalize">{p.boxType.replace('_', ' ')}</span> },
          { key: 'weightKg', header: 'Weight', render: (p) => `${p.weightKg} kg` },
          { key: 'label', header: 'Label', render: (p) => <span className="font-mono text-xs">{p.shippingLabel?.trackingNumber ?? '-'}</span> },
          { key: 'status', header: 'Status', render: (p) => <Badge variant={PACKAGE_STATUS.variant(p.status)}>{PACKAGE_STATUS.label(p.status)}</Badge> },
        ]}
      />
    </div>
  );
}
