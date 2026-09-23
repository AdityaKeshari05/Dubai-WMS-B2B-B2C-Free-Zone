'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Clock, Loader2, CheckCircle2, Monitor, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { PACKAGE_STATUS } from '@/lib/wms/status';
import { packingStationService } from '@/lib/wms/services/packingStationService';

export default function PackingDashboardPage() {
  const router = useRouter();
  const packages = useWmsDbSelector((s) => s.packages);
  const stations = useWmsDbSelector((s) => s.packingStations);
  const [operatorInputs, setOperatorInputs] = useState<Record<string, string>>({});

  const queue = packages.filter((p) => (p.status === 'pending' || p.status === 'verifying') && !p.stationId);

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

      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Monitor className="h-4 w-4" />Packing Stations</h2>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stations.map((station) => {
          const current = packages.find((p) => p.id === station.currentPackageId);
          return (
            <Card key={station.id}>
              <CardContent className="pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{station.stationNumber}</span>
                  {current ? <Badge variant={PACKAGE_STATUS.variant(current.status)}>{PACKAGE_STATUS.label(current.status)}</Badge> : <Badge variant="secondary">Idle</Badge>}
                </div>

                {station.operator ? (
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
                    <span>Operator: <span className="font-medium text-gray-900">{station.operator}</span></span>
                    <button onClick={() => packingStationService.assignOperator(station.id, '')} className="text-gray-400 hover:text-red-600" title="Sign out">
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="mb-2 flex items-center gap-1.5">
                    <Input
                      placeholder="Operator name"
                      value={operatorInputs[station.id] ?? ''}
                      onChange={(e) => setOperatorInputs((prev) => ({ ...prev, [station.id]: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Button size="sm" onClick={() => operatorInputs[station.id] && packingStationService.assignOperator(station.id, operatorInputs[station.id])}>Sign In</Button>
                  </div>
                )}

                {current ? (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => router.push(`/wms/fulfillment/packing/${current.id}`)}>
                    {current.packageNumber} — Continue
                  </Button>
                ) : queue.length > 0 && station.operator ? (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => packingStationService.claimPackage(station.id, queue[0].id)}>
                    Claim Next ({queue.length} in queue)
                  </Button>
                ) : (
                  <p className="text-center text-xs text-gray-400">{station.operator ? 'Queue empty' : 'Sign in to claim work'}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DataTable
        data={[...packages].reverse()}
        onRowClick={(p) => router.push(`/wms/fulfillment/packing/${p.id}`)}
        emptyMessage="No packages yet - packages are created from an order once items are picked"
        columns={[
          { key: 'packageNumber', header: 'Package #', render: (p) => <span className="font-medium text-[#2490ef]">{p.packageNumber}</span> },
          { key: 'orderType', header: 'Order', render: (p) => <span className="text-xs uppercase text-gray-500">{p.orderType}</span> },
          { key: 'station', header: 'Station', render: (p) => stations.find((s) => s.id === p.stationId)?.stationNumber ?? <span className="text-gray-400">Unassigned</span> },
          { key: 'boxType', header: 'Box Type', render: (p) => <span className="capitalize">{p.boxType.replace('_', ' ')}</span> },
          { key: 'weightKg', header: 'Weight', render: (p) => `${p.weightKg} kg` },
          { key: 'label', header: 'Label', render: (p) => <span className="font-mono text-xs">{p.shippingLabel?.trackingNumber ?? '-'}</span> },
          { key: 'status', header: 'Status', render: (p) => <Badge variant={PACKAGE_STATUS.variant(p.status)}>{PACKAGE_STATUS.label(p.status)}</Badge> },
        ]}
      />
    </div>
  );
}
