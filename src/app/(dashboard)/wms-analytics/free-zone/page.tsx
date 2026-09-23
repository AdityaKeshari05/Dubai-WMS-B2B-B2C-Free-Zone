'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  FileText,
  ShieldCheck,
  Warehouse,
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

type Movement = {
  ref: string;
  movement: string;
  route: string;
  units: number;
  customs: string;
  status: 'Cleared' | 'Processing' | 'Duty Pending' | 'Blocked';
};

const movements: Movement[] = [
  {
    ref: 'FZ-TR-00481',
    movement: 'FZ → FZ',
    route: 'JAFZA A → JAFZA B',
    units: 420,
    customs: 'DEC-884191',
    status: 'Cleared',
  },
  {
    ref: 'FZ-OUT-00218',
    movement: 'Re-export',
    route: 'Free Zone → Export',
    units: 180,
    customs: 'DEC-884207',
    status: 'Processing',
  },
  {
    ref: 'FZ-MAIN-00164',
    movement: 'FZ → Mainland',
    route: 'Free Zone → Dubai Main',
    units: 96,
    customs: 'DEC-884212',
    status: 'Duty Pending',
  },
  {
    ref: 'FZ-TR-00482',
    movement: 'FZ → FZ',
    route: 'JAFZA B → JAFZA A',
    units: 60,
    customs: 'DEC-884218',
    status: 'Blocked',
  },
];

export default function FreeZoneDashboard() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');

  const filtered = useMemo(() => {
    return movements.filter((row) => {
      const matchesSearch =
        !search ||
        `${row.ref} ${row.customs} ${row.movement} ${row.route}`
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
        title="Free Zone Dashboard"
        description="Customs-controlled inventory, duty status and free-zone movement visibility."
        icon={Warehouse}
      >
        <ExportButton
          filename="free-zone-movements"
          rows={filtered.map((row) => ({
            Reference: row.ref,
            Movement: row.movement,
            Route: row.route,
            Units: row.units,
            CustomsReference: row.customs,
            Status: row.status,
          }))}
        />
      </AnalyticsHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Bonded Units"
          value="18,420"
          hint="Under customs control"
          icon={ShieldCheck}
        />

        <MetricCard
          label="Open Customs Refs"
          value="37"
          hint="Declarations & shipments"
          icon={FileText}
        />

        <MetricCard
          label="Transfers In Transit"
          value="9"
          hint="Free zone movements"
          icon={ArrowLeftRight}
        />

        <MetricCard
          label="Reconciliation Issues"
          value="3"
          hint="Requires customs review"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
        <Panel
          title="Duty status"
          description="Controlled stock classification"
        >
          <div className="space-y-5 p-5">
            <ProgressBar
              label="Bonded / Duty Unpaid"
              value={68}
              right="18,420 units"
            />

            <ProgressBar
              label="Duty Paid"
              value={21}
              right="5,690 units"
            />

            <ProgressBar
              label="Re-export Reserved"
              value={8}
              right="2,166 units"
            />

            <ProgressBar
              label="Quarantine"
              value={3}
              right="812 units"
            />
          </div>
        </Panel>

        <Panel
          title="Customs movement register"
          description="Search and filter controlled-stock transactions"
          action={
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <div className="w-full sm:w-64">
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Reference or customs..."
                />
              </div>

              <div className="w-full sm:w-40">
                <SelectField
                  value={status}
                  onChange={setStatus}
                >
                  <option>All Statuses</option>
                  <option>Cleared</option>
                  <option>Processing</option>
                  <option>Duty Pending</option>
                  <option>Blocked</option>
                </SelectField>
              </div>
            </div>
          }
        >
          <DataTable
            rows={filtered}
            rowKey={(row) => row.ref}
            columns={[
              {
                label: 'Reference',
                render: (row) => (
                  <b className="text-[#1674c4]">{row.ref}</b>
                ),
              },
              {
                label: 'Movement',
                render: (row) => row.movement,
              },
              {
                label: 'From / To',
                render: (row) => row.route,
              },
              {
                label: 'Units',
                render: (row) => row.units,
              },
              {
                label: 'Customs Ref',
                render: (row) => row.customs,
              },
              {
                label: 'Status',
                render: (row) => (
                  <Badge
                    tone={
                      row.status === 'Cleared'
                        ? 'green'
                        : row.status === 'Processing'
                        ? 'blue'
                        : row.status === 'Duty Pending'
                        ? 'amber'
                        : 'red'
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
                No customs movements found
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