'use client';

import { useMemo, useState } from 'react';
import {
  Boxes,
  Building2,
  Clock3,
  ShoppingCart,
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

type Order = {
  order: string;
  customer: string;
  cases: number;
  pallets: number;
  window: string;
  status: 'Picking' | 'Allocated' | 'Packed' | 'Delayed';
};

const orders: Order[] = [
  {
    order: 'SO-B2B-1821',
    customer: 'Retail Group LLC',
    cases: 248,
    pallets: 6,
    window: '10:00–12:00',
    status: 'Picking',
  },
  {
    order: 'SO-B2B-1824',
    customer: 'Dubai Stores PJSC',
    cases: 390,
    pallets: 9,
    window: '12:00–14:00',
    status: 'Allocated',
  },
  {
    order: 'SO-B2B-1828',
    customer: 'Metro Trading',
    cases: 112,
    pallets: 3,
    window: '14:00–16:00',
    status: 'Packed',
  },
  {
    order: 'SO-B2B-1831',
    customer: 'Gulf Wholesale',
    cases: 184,
    pallets: 5,
    window: '16:00–18:00',
    status: 'Delayed',
  },
];

export default function B2BDashboard() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');

  const filtered = useMemo(() => {
    return orders.filter((row) => {
      const matchesSearch =
        !search ||
        `${row.order} ${row.customer}`
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
        title="B2B Dashboard"
        description="Bulk customer orders, pallet/carton workload and customer SLA performance."
        icon={Building2}
      >
        <ExportButton
          filename="b2b-orders"
          rows={filtered.map((row) => ({
            Order: row.order,
            Customer: row.customer,
            Cases: row.cases,
            Pallets: row.pallets,
            DeliveryWindow: row.window,
            Status: row.status,
          }))}
        />
      </AnalyticsHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Open B2B Orders"
          value="84"
          hint="18 priority orders"
          icon={ShoppingCart}
        />

        <MetricCard
          label="Pallets Planned"
          value="126"
          hint="Across open orders"
          icon={Boxes}
        />

        <MetricCard
          label="Deliveries Today"
          value="39"
          hint="8 scheduled windows"
          icon={Truck}
        />

        <MetricCard
          label="On-time SLA"
          value="97.1%"
          hint="Target 96%"
          icon={Clock3}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel
          title="Customer order queue"
          description="Search and filter B2B fulfilment"
          action={
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <div className="w-full sm:w-64">
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Order or customer..."
                />
              </div>

              <div className="w-full sm:w-40">
                <SelectField
                  value={status}
                  onChange={setStatus}
                >
                  <option>All Statuses</option>
                  <option>Picking</option>
                  <option>Allocated</option>
                  <option>Packed</option>
                  <option>Delayed</option>
                </SelectField>
              </div>
            </div>
          }
        >
          <DataTable
            rows={filtered}
            rowKey={(row) => row.order}
            columns={[
              {
                label: 'Order',
                render: (row) => (
                  <b className="text-[#1674c4]">
                    {row.order}
                  </b>
                ),
              },
              {
                label: 'Customer',
                render: (row) => row.customer,
              },
              {
                label: 'Cases',
                render: (row) => row.cases,
              },
              {
                label: 'Pallets',
                render: (row) => row.pallets,
              },
              {
                label: 'Delivery Window',
                render: (row) => row.window,
              },
              {
                label: 'Status',
                render: (row) => (
                  <Badge
                    tone={
                      row.status === 'Packed'
                        ? 'green'
                        : row.status === 'Delayed'
                        ? 'red'
                        : row.status === 'Picking'
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
                No B2B orders found
              </p>

              <p className="mt-1 text-xs text-[#8a929d]">
                Try changing the search or status filter.
              </p>
            </div>
          )}
        </Panel>

        <Panel
          title="Top customer SLA"
          description="Fulfilment performance"
        >
          <div className="space-y-5 p-5">
            <ProgressBar
              label="Retail Group LLC"
              value={99}
              right="99.1%"
            />

            <ProgressBar
              label="Dubai Stores PJSC"
              value={97}
              right="97.4%"
            />

            <ProgressBar
              label="Metro Trading"
              value={95}
              right="95.8%"
            />

            <ProgressBar
              label="Gulf Wholesale"
              value={92}
              right="92.6%"
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}