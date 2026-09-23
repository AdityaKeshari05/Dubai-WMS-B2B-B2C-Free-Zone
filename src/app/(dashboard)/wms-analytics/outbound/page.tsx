'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock3,
  PackageCheck,
  Send,
  Truck,
} from 'lucide-react';

import {
  AnalyticsHeader,
  Badge,
  DataTable,
  ExportButton,
  MetricCard,
  Panel,
  ProgressBar,
  SearchField,
  SelectField,
} from '@/components/wms/analytics/AnalyticsUi';

type Batch = {
  batch: string;
  carrier: string;
  orders: number;
  cutoff: string;
  status: 'Ready' | 'Packing' | 'Picking' | 'Delayed';
};

const batches: Batch[] = [
  {
    batch: 'BAT-0182',
    carrier: 'DHL Express',
    orders: 42,
    cutoff: '11:30',
    status: 'Ready',
  },
  {
    batch: 'BAT-0183',
    carrier: 'Aramex',
    orders: 31,
    cutoff: '12:00',
    status: 'Packing',
  },
  {
    batch: 'BAT-0184',
    carrier: 'Local Fleet',
    orders: 18,
    cutoff: '13:00',
    status: 'Picking',
  },
  {
    batch: 'BAT-0185',
    carrier: 'DHL Express',
    orders: 22,
    cutoff: '13:30',
    status: 'Delayed',
  },
];

export default function OutboundDashboard() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');

  const filtered = useMemo(() => {
    return batches.filter((row) => {
      const matchesSearch =
        !search ||
        `${row.batch} ${row.carrier}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === 'All Statuses' || row.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <div className="space-y-5">
      <AnalyticsHeader
        title="Outbound Dashboard"
        description="Order fulfilment, picking, packing and dispatch status in one view."
        icon={Truck}
      >
        <ExportButton
          filename="outbound-batches"
          rows={filtered.map((row) => ({
            Batch: row.batch,
            Carrier: row.carrier,
            Orders: row.orders,
            Cutoff: row.cutoff,
            Status: row.status,
          }))}
        />
      </AnalyticsHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Orders Today"
          value="612"
          hint="B2B + B2C"
          icon={PackageCheck}
        />

        <MetricCard
          label="Ready to Dispatch"
          value="96"
          hint="12 carrier batches"
          icon={Send}
        />

        <MetricCard
          label="Avg. Fulfilment"
          value="1h 18m"
          hint="Target under 2h"
          icon={Clock3}
        />

        <MetricCard
          label="Delayed Orders"
          value="17"
          hint="6 beyond SLA"
          icon={AlertTriangle}
        />
      </div>

      <Panel
        title="Fulfilment funnel"
        description="Current open orders by operational stage"
      >
        <div className="grid gap-4 p-5 md:grid-cols-5">
          {[
            ['Allocated', 428, 100],
            ['Picking', 346, 81],
            ['Picked', 284, 66],
            ['Packed', 212, 50],
            ['Ready', 96, 22],
          ].map(([name, value, progress]) => (
            <div
              key={String(name)}
              className="rounded-lg border border-[#e5e2dc] bg-[#fbfaf8] p-4"
            >
              <p className="text-xs uppercase tracking-wide text-[#7c8591]">
                {name}
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#1f2937]">
                {value}
              </p>

              <div className="mt-3">
                <ProgressBar
                  label=""
                  value={Number(progress)}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Carrier dispatch batches"
          description="Search and filter courier handovers"
          action={
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <div className="w-full sm:w-64">
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Batch or carrier..."
                />
              </div>

              <div className="w-full sm:w-40">
                <SelectField
                  value={status}
                  onChange={setStatus}
                >
                  <option>All Statuses</option>
                  <option>Ready</option>
                  <option>Packing</option>
                  <option>Picking</option>
                  <option>Delayed</option>
                </SelectField>
              </div>
            </div>
          }
        >
          <DataTable
            rows={filtered}
            rowKey={(row) => row.batch}
            columns={[
              {
                label: 'Batch',
                render: (row) => (
                  <b className="text-[#1674c4]">
                    {row.batch}
                  </b>
                ),
              },
              {
                label: 'Carrier',
                render: (row) => row.carrier,
              },
              {
                label: 'Orders',
                render: (row) => row.orders,
              },
              {
                label: 'Cutoff',
                render: (row) => row.cutoff,
              },
              {
                label: 'Status',
                render: (row) => (
                  <Badge
                    tone={
                      row.status === 'Ready'
                        ? 'green'
                        : row.status === 'Delayed'
                        ? 'red'
                        : row.status === 'Packing'
                        ? 'blue'
                        : 'amber'
                    }
                  >
                    {row.status}
                  </Badge>
                ),
              },
            ]}
          />

          {filtered.length === 0 && (
            <div className="border-t border-[#e5e2dc] px-5 py-10 text-center">
              <p className="text-sm font-medium text-[#4b5563]">
                No dispatch batches found
              </p>

              <p className="mt-1 text-xs text-[#8a929d]">
                Try changing the search or status filter.
              </p>
            </div>
          )}
        </Panel>

        <Panel
          title="SLA by channel"
          description="Orders dispatched within promised cutoff"
        >
          <div className="space-y-5 p-5">
            <ProgressBar
              label="B2B"
              value={97}
              right="97.2%"
            />

            <ProgressBar
              label="B2C"
              value={94}
              right="94.6%"
            />

            <ProgressBar
              label="Free Zone"
              value={91}
              right="91.8%"
            />

            <ProgressBar
              label="3PL Clients"
              value={96}
              right="96.1%"
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}