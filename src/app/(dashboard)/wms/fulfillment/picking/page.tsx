'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { PICKING_STATUS, PRIORITY_VARIANT } from '@/lib/wms/status';
import type { PickingTask, PickingTaskStatus } from '@/types';

function taskZones(task: PickingTask, locationMap: Map<string, { zone: string }>): string[] {
  return Array.from(new Set(task.items.map((i) => locationMap.get(i.locationId)?.zone).filter((z): z is string => !!z)));
}

export default function PickingDashboardPage() {
  const router = useRouter();
  const tasks = useWmsDbSelector((s) => s.pickingTasks);
  const locations = useWmsDbSelector((s) => s.locations);
  const { warehouses } = useWmsLookups();
  const warehouseMap = new Map(warehouses.map((w) => [w.id, w]));
  const locationMap = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const [status, setStatus] = useState('ALL');
  const [zone, setZone] = useState('ALL');

  const allZones = useMemo(() => Array.from(new Set(locations.map((l) => l.zone))).sort(), [locations]);

  const filtered = tasks.filter((t) => {
    if (status !== 'ALL' && t.status !== status) return false;
    if (zone !== 'ALL' && !taskZones(t, locationMap).includes(zone)) return false;
    return true;
  });

  const stats = {
    pending: tasks.filter((t) => t.status === 'pending' || t.status === 'assigned').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'picked' || t.status === 'completed').length,
    exceptions: tasks.filter((t) => t.status === 'exception').length,
  };

  return (
    <div>
      <PageHeader title="Picking" description="Picking tasks generated from allocated B2B and B2C orders" />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard title="Pending" value={stats.pending} icon={Clock} iconColor="text-gray-600" iconBg="bg-gray-100" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Loader2} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Exceptions" value={stats.exceptions} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      <div className="mb-3 flex gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {(['pending', 'assigned', 'in_progress', 'picked', 'exception', 'completed'] as PickingTaskStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{PICKING_STATUS.label(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={zone} onValueChange={setZone}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Zones</SelectItem>
            {allZones.map((z) => <SelectItem key={z} value={z}>Zone {z}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={[...filtered].reverse()}
        onRowClick={(t) => router.push(`/wms/fulfillment/picking/${t.id}`)}
        emptyMessage="No picking tasks - tasks are generated automatically once an order is allocated"
        columns={[
          { key: 'taskNumber', header: 'Task #', render: (t) => <span className="font-medium text-[#2490ef]">{t.taskNumber}</span> },
          { key: 'order', header: 'Order', render: (t) => <span className="text-xs text-gray-500">{t.orderNumber} <span className="uppercase text-gray-400">({t.orderType})</span></span> },
          { key: 'type', header: 'Type', render: (t) => <span className="capitalize">{t.type}</span> },
          { key: 'warehouse', header: 'Warehouse', render: (t) => warehouseMap.get(t.warehouseId)?.name ?? '—' },
          { key: 'zone', header: 'Zone', render: (t) => taskZones(t, locationMap).map((z) => <Badge key={z} variant="outline" className="mr-1">{z}</Badge>) },
          { key: 'picker', header: 'Picker', render: (t) => t.picker ?? <span className="text-gray-400">Unassigned</span> },
          { key: 'items', header: 'Items', render: (t) => t.items.length },
          { key: 'priority', header: 'Priority', render: (t) => <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge> },
          { key: 'status', header: 'Status', render: (t) => <Badge variant={PICKING_STATUS.variant(t.status)}>{PICKING_STATUS.label(t.status)}</Badge> },
        ]}
      />
    </div>
  );
}
