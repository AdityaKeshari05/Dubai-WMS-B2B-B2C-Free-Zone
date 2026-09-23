'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Boxes, LayoutDashboard, PackageCheck, Truck } from 'lucide-react';
import {
  AnalyticsHeader,
  Badge,
  DataTable,
  ExportButton,
  MetricCard,
  Panel,
  ProgressBar,
  SelectField,
  TrendBars,
} from '@/components/wms/analytics/AnalyticsUi';

type WarehouseRow = { warehouse: string; sla: number; picked: number; dispatched: number; exceptions: number };

const data: WarehouseRow[] = [
  { warehouse: 'Dubai Main Warehouse', sla: 96.4, picked: 1248, dispatched: 1102, exceptions: 3 },
  { warehouse: 'Free Zone Warehouse', sla: 88.1, picked: 642, dispatched: 598, exceptions: 7 },
  { warehouse: 'Overflow Storage', sla: 94.2, picked: 209, dispatched: 188, exceptions: 1 },
];

export default function WmsAnalyticsPage() {
  const [range, setRange] = useState('Today');
  const [warehouse, setWarehouse] = useState('All Warehouses');

  const rows = useMemo(
    () => (warehouse === 'All Warehouses' ? data : data.filter((row) => row.warehouse === warehouse)),
    [warehouse]
  );

  const picked = rows.reduce((sum, row) => sum + row.picked, 0);
  const dispatched = rows.reduce((sum, row) => sum + row.dispatched, 0);
  const exceptions = rows.reduce((sum, row) => sum + row.exceptions, 0);
  const avgSla = rows.length ? rows.reduce((sum, row) => sum + row.sla, 0) / rows.length : 0;

  return (
    <div className="space-y-5">
      <AnalyticsHeader title="WMS Dashboard" description="Operational picture across warehouses, inventory and fulfilment." icon={LayoutDashboard}>
        <SelectField value={range} onChange={setRange} ariaLabel="Date range">
          <option>Today</option><option>Last 7 days</option><option>This month</option>
        </SelectField>
        <SelectField value={warehouse} onChange={setWarehouse} ariaLabel="Warehouse">
          <option>All Warehouses</option>{data.map((row) => <option key={row.warehouse}>{row.warehouse}</option>)}
        </SelectField>
        <ExportButton
          filename="wms-dashboard"
          rows={rows.map((row) => ({ Warehouse: row.warehouse, SLA: `${row.sla}%`, Picked: row.picked, Dispatched: row.dispatched, Exceptions: row.exceptions }))}
        />
      </AnalyticsHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Picked Units" value={picked.toLocaleString()} hint={`${range} throughput`} icon={PackageCheck} />
        <MetricCard label="Dispatched Units" value={dispatched.toLocaleString()} hint="Completed outbound" icon={Truck} />
        <MetricCard label="Dispatch SLA" value={`${avgSla.toFixed(1)}%`} hint="Target 95%" icon={Boxes} />
        <MetricCard label="Open Exceptions" value={String(exceptions)} hint="Requires attention" icon={AlertTriangle} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Panel title="Hourly throughput" description={`${range} · received, picked and dispatched units`}>
          <div className="p-5"><TrendBars values={[38,52,67,74,61,88,94,81,73,89,76,55]} labels={['08','09','10','11','12','13','14','15','16','17','18','19']} /></div>
        </Panel>
        <Panel title="Operation completion" description="Current workload by stage">
          <div className="space-y-5 p-5">
            <ProgressBar label="Receiving" value={84} right="126 / 150" />
            <ProgressBar label="Putaway" value={71} right="92 / 130" />
            <ProgressBar label="Picking" value={89} right="267 / 300" />
            <ProgressBar label="Packing" value={76} right="181 / 238" />
            <ProgressBar label="Dispatch" value={63} right="95 / 150" />
          </div>
        </Panel>
      </div>

      <Panel title="Warehouse performance" description="Filtered KPI snapshot by location">
        <DataTable
          rows={rows}
          rowKey={(row) => row.warehouse}
          columns={[
            { label: 'Warehouse', render: (row) => <span className="font-medium text-[#1674c4]">{row.warehouse}</span> },
            { label: 'Order SLA', render: (row) => `${row.sla}%` },
            { label: 'Picked Units', render: (row) => row.picked.toLocaleString() },
            { label: 'Dispatched', render: (row) => row.dispatched.toLocaleString() },
            { label: 'Exceptions', render: (row) => row.exceptions },
            { label: 'Health', render: (row) => <Badge tone={row.sla >= 95 ? 'green' : row.sla >= 90 ? 'amber' : 'red'}>{row.sla >= 95 ? 'Healthy' : row.sla >= 90 ? 'Watch' : 'At Risk'}</Badge> },
          ]}
        />
      </Panel>
    </div>
  );
}
