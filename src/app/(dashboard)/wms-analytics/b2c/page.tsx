'use client';

import { useMemo, useState } from 'react';
import {
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Tag,
} from 'lucide-react';

import {
  AnalyticsHeader,
  Badge,
  DataTable,
  ExportButton,
  MetricCard,
  Panel,
  SearchField,
  SelectField,
  TrendBars,
} from '@/components/wms/analytics/AnalyticsUi';

type Wave = {
  wave: string;
  orders: number;
  items: number;
  picker: string;
  status: 'Picking' | 'Queued' | 'Packing' | 'Planned';
};

const waves: Wave[] = [
  {
    wave: 'WAVE-091',
    orders: 42,
    items: 108,
    picker: 'Team A',
    status: 'Picking',
  },
  {
    wave: 'WAVE-092',
    orders: 36,
    items: 84,
    picker: 'Team B',
    status: 'Queued',
  },
  {
    wave: 'WAVE-093',
    orders: 51,
    items: 133,
    picker: 'Team C',
    status: 'Packing',
  },
  {
    wave: 'WAVE-094',
    orders: 28,
    items: 69,
    picker: 'Unassigned',
    status: 'Planned',
  },
];

export default function B2CDashboard() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');

  const filtered = useMemo(() => {
    return waves.filter((row) => {
      const matchesSearch =
        !search ||
        `${row.wave} ${row.picker}`
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
        title="B2C Dashboard"
        description="E-commerce order volume, pick waves, packing and return-to-origin performance."
        icon={ShoppingBag}
      >
        <ExportButton
          filename="b2c-waves"
          rows={filtered.map((row) => ({
            Wave: row.wave,
            Orders: row.orders,
            Items: row.items,
            Picker: row.picker,
            Status: row.status,
          }))}
        />
      </AnalyticsHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Orders Today"
          value="528"
          hint="+12.4% vs yesterday"
          icon={ShoppingCart}
        />

        <MetricCard
          label="Items Picked"
          value="1,342"
          hint="98.7% accuracy"
          icon={PackageCheck}
        />

        <MetricCard
          label="Active Waves"
          value="7"
          hint="184 orders in progress"
          icon={Tag}
        />

        <MetricCard
          label="RTO Rate"
          value="2.8%"
          hint="15 orders this week"
          icon={RotateCcw}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Hourly order intake"
          description="Consumer orders received today"
        >
          <div className="p-5">
            <TrendBars
              values={[26, 39, 54, 47, 68, 76, 62, 88, 93, 82, 70, 58]}
              labels={[
                '08',
                '09',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                '19',
              ]}
            />
          </div>
        </Panel>

        <Panel
          title="Pick waves"
          description="Search and filter batch picking workload"
          action={
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <div className="w-full sm:w-64">
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Wave or picker..."
                />
              </div>

              <div className="w-full sm:w-40">
                <SelectField
                  value={status}
                  onChange={setStatus}
                >
                  <option>All Statuses</option>
                  <option>Picking</option>
                  <option>Queued</option>
                  <option>Packing</option>
                  <option>Planned</option>
                </SelectField>
              </div>
            </div>
          }
        >
          <DataTable
            rows={filtered}
            rowKey={(row) => row.wave}
            columns={[
              {
                label: 'Wave',
                render: (row) => (
                  <b className="text-[#1674c4]">
                    {row.wave}
                  </b>
                ),
              },
              {
                label: 'Orders',
                render: (row) => row.orders,
              },
              {
                label: 'Items',
                render: (row) => row.items,
              },
              {
                label: 'Picker',
                render: (row) => row.picker,
              },
              {
                label: 'Status',
                render: (row) => (
                  <Badge
                    tone={
                      row.status === 'Packing'
                        ? 'green'
                        : row.status === 'Picking'
                        ? 'blue'
                        : row.status === 'Queued'
                        ? 'amber'
                        : 'gray'
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
                No pick waves found
              </p>

              <p className="mt-1 text-xs text-[#8a929d]">
                Try changing the search or status filter.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}