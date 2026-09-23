'use client';

import { useState } from 'react';
import {
  Plus, Search, Upload, FileText, X, CheckCircle2, AlertTriangle,
  BarChart3, Package, Globe, Shield, ArrowRightLeft, TrendingUp,
  Building2, FileCheck2, Clock, Warehouse, Eye, Download
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// ─────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#6b7280]">{label}</label>
      {children}
    </div>
  );
}

function Sel({ placeholder, options }: { placeholder: string; options: string[] }) {
  return (
    <select className="h-10 w-full rounded-md border border-[#e5e2dc] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2490ef]/30">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function Inp({ placeholder, type = 'text' }: { placeholder: string; type?: string }) {
  return <Input type={type} placeholder={placeholder} />;
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={99} className="py-10 text-center text-sm text-[#9ca3af]">No records found</td>
    </tr>
  );
}

interface Col { key: string; label: string }
function Table({ cols, rows }: { cols: Col[]; rows: Record<string, React.ReactNode>[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-[#e5e2dc]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e5e2dc] bg-[#f8faf9]">
            {cols.map(c => (
              <th key={c.key} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase text-[#7c8591]">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow /> : rows.map((r, i) => (
            <tr key={i} className="border-b border-[#f0ede8] hover:bg-[#fbfaf8]">
              {cols.map(c => (
                <td key={c.key} className="px-4 py-2.5">{r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.0 FZ Dashboard
// ─────────────────────────────────────────────────────────
const monthlyFZ = [
  { m: 'Apr', in: 24, out: 18 }, { m: 'May', in: 31, out: 22 },
  { m: 'Jun', in: 28, out: 25 }, { m: 'Jul', in: 40, out: 30 },
  { m: 'Aug', in: 35, out: 28 }, { m: 'Sep', in: 42, out: 38 },
];
const recentActivity = [
  { ref: 'FZ-IN-0045', type: 'Inbound', goods: 'Electronic Components', qty: '500 PCS', status: 'CUSTOMS_CLEARED', date: '23 Sep 2026' },
  { ref: 'FZ-OUT-0031', type: 'Outbound', goods: 'Textile Rolls', qty: '80 ROL', status: 'RELEASED', date: '22 Sep 2026' },
  { ref: 'FZ-TR-0019', type: 'FZ Transfer', goods: 'Industrial Parts', qty: '200 PCS', status: 'IN_TRANSIT_FZ', date: '22 Sep 2026' },
  { ref: 'FZ-RE-0008', type: 'Re-Export', goods: 'Machinery Spares', qty: '12 CTN', status: 'RE_EXPORT', date: '21 Sep 2026' },
  { ref: 'FZ-ML-0022', type: 'FZ → Mainland', goods: 'Consumer Goods', qty: '300 PCS', status: 'MAINLAND_BOUND', date: '21 Sep 2026' },
];

export function FreeZoneDashboardPage() {
  const barMax = 50;
  return (
    <div className="space-y-5">
      <PageHeader title="Free Zone Dashboard" description="Overview of all free zone and bonded warehouse operations" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total FZ Stock Items" value="1,284" subtitle="across 3 warehouses" icon={Package} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Under Customs Control" value="347" subtitle="awaiting clearance" icon={Shield} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatsCard title="Pending Clearances" value="23" subtitle="open customs cases" icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Re-Exports (Sep)" value="18" subtitle="shipments this month" icon={Globe} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly FZ Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-3 px-2">
              {monthlyFZ.map(row => (
                <div key={row.m} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end gap-1" style={{ height: '140px' }}>
                    <div
                      className="flex-1 rounded-t bg-[#2490ef]"
                      style={{ height: `${(row.in / barMax) * 140}px` }}
                      title={`Inbound: ${row.in}`}
                    />
                    <div
                      className="flex-1 rounded-t bg-[#0f9d58]"
                      style={{ height: `${(row.out / barMax) * 140}px` }}
                      title={`Outbound: ${row.out}`}
                    />
                  </div>
                  <span className="text-[11px] text-[#7c8591]">{row.m}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-[#7c8591]">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-[#2490ef]" />Inbound</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-[#0f9d58]" />Outbound</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Duty Status Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Duty Free', value: 38, color: 'bg-emerald-500' },
              { label: 'Duty Applicable', value: 24, color: 'bg-orange-500' },
              { label: 'Suspended', value: 15, color: 'bg-yellow-500' },
              { label: 'Under Customs', value: 23, color: 'bg-violet-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[#4b5563]">{item.label}</span>
                  <span className="font-semibold text-[#1f2937]">{item.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f0ede8]">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent FZ Activity</CardTitle></CardHeader>
        <CardContent>
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'type', label: 'Type' },
              { key: 'goods', label: 'Goods' }, { key: 'qty', label: 'Qty' },
              { key: 'status', label: 'Status' }, { key: 'date', label: 'Date' },
            ]}
            rows={recentActivity.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.1 Warehouse Configuration
// ─────────────────────────────────────────────────────────
const warehouseSeed = [
  { code: 'JAFZA-01', name: 'JAFZA Main Store', zone: 'Jebel Ali FZ', type: 'Free Zone', customsCode: 'JAF-001', status: 'ACTIVE', locations: 24 },
  { code: 'DAFZA-01', name: 'DAFZA Bonded Bay', zone: 'Dubai Airport FZ', type: 'Bonded', customsCode: 'DAF-002', status: 'ACTIVE', locations: 12 },
  { code: 'DMCC-01', name: 'DMCC Secure Store', zone: 'DMCC', type: 'Free Zone', customsCode: 'DMC-003', status: 'ACTIVE', locations: 8 },
];

export function WarehouseConfigPage() {
  const [open, setOpen] = useState(false);
  const [rows] = useState(warehouseSeed);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Warehouse Configuration"
        description="Configure warehouses and locations specifically for free-zone operations"
        action={{ label: 'Add Warehouse', onClick: () => setOpen(true), icon: Plus }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(w => (
          <Card key={w.code} className="transition hover:border-[#d5d0c8] hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef6fd]">
                  <Warehouse className="h-5 w-5 text-[#1674c4]" />
                </div>
                <StatusBadge status={w.status} />
              </div>
              <p className="font-semibold text-[#1f2937]">{w.name}</p>
              <p className="mt-0.5 text-xs text-[#7c8591]">{w.code} · {w.zone}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-[#f8faf9] p-2">
                  <p className="text-[#7c8591]">Type</p>
                  <p className="font-medium text-[#1f2937]">{w.type}</p>
                </div>
                <div className="rounded-md bg-[#f8faf9] p-2">
                  <p className="text-[#7c8591]">Customs Code</p>
                  <p className="font-medium text-[#1f2937]">{w.customsCode}</p>
                </div>
                <div className="rounded-md bg-[#f8faf9] p-2 col-span-2">
                  <p className="text-[#7c8591]">Active Locations</p>
                  <p className="font-medium text-[#1f2937]">{w.locations} locations configured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Free Zone Warehouse</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Warehouse Name"><Inp placeholder="e.g. JAFZA North Wing" /></Field>
            <Field label="Warehouse Code"><Inp placeholder="e.g. JAFZA-02" /></Field>
            <Field label="Free Zone / Zone"><Sel placeholder="Select zone" options={['Jebel Ali FZ (JAFZA)', 'Dubai Airport FZ (DAFZA)', 'DMCC', 'DIFC', 'Dubai South', 'Sharjah Airport FZ']} /></Field>
            <Field label="Warehouse Type"><Sel placeholder="Select type" options={['Free Zone', 'Bonded', 'Customs Bonded', 'Transit']} /></Field>
            <Field label="Customs Code"><Inp placeholder="Customs-issued code" /></Field>
            <Field label="Number of Locations" type="number"><Inp placeholder="0" type="number" /></Field>
            <Field label="Address / Location" ><Inp placeholder="Street, Building" /></Field>
            <Field label="Responsible Officer"><Inp placeholder="Name" /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Warehouse</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.2 Bonded / Customs Stock
// ─────────────────────────────────────────────────────────
const bondedSeed = [
  { sku: 'SKU-1001', name: 'Electronic PCB Assembly', qty: 500, uom: 'PCS', warehouse: 'JAFZA-01', declRef: 'DEC-2026-4411', dutyStatus: 'BONDED', entered: '10 Sep 2026' },
  { sku: 'SKU-2034', name: 'Industrial Hydraulic Pumps', qty: 20, uom: 'UNT', warehouse: 'DAFZA-01', declRef: 'DEC-2026-4398', dutyStatus: 'UNDER_CUSTOMS', entered: '12 Sep 2026' },
  { sku: 'SKU-3210', name: 'Textile Raw Material', qty: 1200, uom: 'KG', warehouse: 'DMCC-01', declRef: 'DEC-2026-4355', dutyStatus: 'PENDING_CLEARANCE', entered: '15 Sep 2026' },
  { sku: 'SKU-4001', name: 'Pharmaceutical Compounds', qty: 300, uom: 'KG', warehouse: 'JAFZA-01', declRef: 'DEC-2026-4290', dutyStatus: 'CUSTOMS_CLEARED', entered: '08 Sep 2026' },
  { sku: 'SKU-5521', name: 'Luxury Watch Components', qty: 80, uom: 'PCS', warehouse: 'DMCC-01', declRef: 'DEC-2026-4201', dutyStatus: 'DUTY_FREE', entered: '05 Sep 2026' },
];

export function BondedStockPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const statuses = ['ALL', 'BONDED', 'UNDER_CUSTOMS', 'PENDING_CLEARANCE', 'CUSTOMS_CLEARED', 'DUTY_FREE'];
  const filtered = bondedSeed.filter(r =>
    (filter === 'ALL' || r.dutyStatus === filter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Bonded / Customs Stock" description="Inventory under customs control across all free zone warehouses" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard title="Total Bonded Items" value="5" icon={Package} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatsCard title="Under Customs" value="1" icon={Shield} iconBg="bg-violet-50" iconColor="text-violet-600" />
        <StatsCard title="Pending Clearance" value="1" icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Cleared" value="2" icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search by SKU or product name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 w-full rounded-md border border-[#e5e2dc] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2490ef]/30"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${filter === s ? 'bg-[#2490ef] text-white' : 'bg-[#f0ede8] text-[#4b5563] hover:bg-[#e5e2dc]'}`}
                >
                  {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <Table
            cols={[
              { key: 'sku', label: 'SKU' }, { key: 'name', label: 'Product' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'warehouse', label: 'Warehouse' }, { key: 'declRef', label: 'Declaration Ref' },
              { key: 'dutyStatus', label: 'Status' }, { key: 'entered', label: 'Entry Date' },
            ]}
            rows={filtered.map(r => ({ ...r, dutyStatus: <StatusBadge status={r.dutyStatus} /> }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.3 Customs Inventory Tracking
// ─────────────────────────────────────────────────────────
const trackingSeed = [
  { ref: 'CIT-001', product: 'Electronic PCB Assembly', sku: 'SKU-1001', qty: 500, warehouse: 'JAFZA-01', entryDate: '10 Sep 2026', expectedClearance: '25 Sep 2026', officer: 'Ahmed Al Mansoori', status: 'UNDER_CUSTOMS' },
  { ref: 'CIT-002', product: 'Hydraulic Pumps', sku: 'SKU-2034', qty: 20, warehouse: 'DAFZA-01', entryDate: '12 Sep 2026', expectedClearance: '27 Sep 2026', officer: 'Fatima Al Rashid', status: 'PENDING_CLEARANCE' },
  { ref: 'CIT-003', product: 'Textile Raw Material', sku: 'SKU-3210', qty: 1200, warehouse: 'DMCC-01', entryDate: '15 Sep 2026', expectedClearance: '30 Sep 2026', officer: 'Khalid Hassan', status: 'BONDED' },
];

export function InventoryTrackingPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Customs Inventory Tracking" description="Track stock subject to customs and free-zone controls" />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Active Tracking Entries" value="3" icon={BarChart3} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Overdue Clearances" value="0" icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" />
        <StatsCard title="Cleared This Month" value="8" icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Tracking Ref' }, { key: 'product', label: 'Product' },
              { key: 'sku', label: 'SKU' }, { key: 'qty', label: 'Qty' },
              { key: 'warehouse', label: 'Warehouse' }, { key: 'entryDate', label: 'Entry Date' },
              { key: 'expectedClearance', label: 'Expected Clearance' },
              { key: 'officer', label: 'Customs Officer' }, { key: 'status', label: 'Status' },
            ]}
            rows={trackingSeed.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.4 Customs Reference Management
// ─────────────────────────────────────────────────────────
const refSeed = [
  { id: 'REF-001', declarationNo: 'DEC-2026-4411', shipmentNo: 'SHP-2026-1122', customsRef: 'CUS-JAF-0091', product: 'Electronic PCB Assembly', date: '10 Sep 2026', status: 'DECLARED' },
  { id: 'REF-002', declarationNo: 'DEC-2026-4398', shipmentNo: 'SHP-2026-1098', customsRef: 'CUS-DAF-0045', product: 'Hydraulic Pumps', date: '12 Sep 2026', status: 'UNDER_CUSTOMS' },
  { id: 'REF-003', declarationNo: 'DEC-2026-4355', shipmentNo: 'SHP-2026-1077', customsRef: 'CUS-DMC-0033', product: 'Textile Raw Material', date: '15 Sep 2026', status: 'PENDING_CLEARANCE' },
  { id: 'REF-004', declarationNo: 'DEC-2026-4290', shipmentNo: 'SHP-2026-1050', customsRef: 'CUS-JAF-0088', product: 'Pharmaceutical Compounds', date: '08 Sep 2026', status: 'CUSTOMS_CLEARED' },
];

export function CustomsReferencePage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Customs Reference Management"
        description="Store declaration, shipment and customs reference numbers against inventory"
        action={{ label: 'Add Reference', onClick: () => setOpen(true), icon: Plus }}
      />
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'id', label: 'ID' }, { key: 'declarationNo', label: 'Declaration No' },
              { key: 'shipmentNo', label: 'Shipment No' }, { key: 'customsRef', label: 'Customs Ref' },
              { key: 'product', label: 'Product' }, { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ]}
            rows={refSeed.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Customs Reference</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Declaration Number"><Inp placeholder="DEC-YYYY-NNNN" /></Field>
            <Field label="Shipment Number"><Inp placeholder="SHP-YYYY-NNNN" /></Field>
            <Field label="Customs Reference"><Inp placeholder="CUS-XXX-NNNN" /></Field>
            <Field label="Bill of Lading / AWB"><Inp placeholder="BOL / AWB number" /></Field>
            <Field label="Linked Product / SKU"><Inp placeholder="Product name or SKU" /></Field>
            <Field label="Warehouse"><Sel placeholder="Select warehouse" options={['JAFZA-01', 'DAFZA-01', 'DMCC-01']} /></Field>
            <Field label="Declaration Date" ><Inp placeholder="" type="date" /></Field>
            <Field label="Customs Authority"><Sel placeholder="Select authority" options={['Dubai Customs', 'Abu Dhabi Customs', 'Sharjah Customs', 'JAFZA Authority']} /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Reference</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.5 Duty Status Tracking
// ─────────────────────────────────────────────────────────
const dutySeed = [
  { sku: 'SKU-1001', product: 'Electronic PCB Assembly', hsCode: '8534.00.00', dutyRate: '0%', status: 'DUTY_FREE', lastUpdated: '10 Sep 2026' },
  { sku: 'SKU-2034', product: 'Hydraulic Pumps', hsCode: '8413.60.00', dutyRate: '5%', status: 'DUTY_APPLICABLE', lastUpdated: '12 Sep 2026' },
  { sku: 'SKU-3210', product: 'Textile Raw Material', hsCode: '5201.00.00', dutyRate: '0%', status: 'SUSPENDED', lastUpdated: '15 Sep 2026' },
  { sku: 'SKU-4001', product: 'Pharmaceutical Compounds', hsCode: '2941.90.00', dutyRate: '0%', status: 'DUTY_FREE', lastUpdated: '08 Sep 2026' },
  { sku: 'SKU-5521', product: 'Luxury Watch Components', hsCode: '9114.90.00', dutyRate: '5%', status: 'BONDED', lastUpdated: '05 Sep 2026' },
];

export function DutyStatusPage() {
  const [filter, setFilter] = useState('ALL');
  const statuses = ['ALL', 'DUTY_FREE', 'DUTY_APPLICABLE', 'SUSPENDED', 'BONDED', 'RELEASED'];
  const filtered = dutySeed.filter(r => filter === 'ALL' || r.status === filter);

  return (
    <div className="space-y-5">
      <PageHeader title="Duty Status Tracking" description="Track whether inventory is subject to duty/tax or remains under customs control" />
      <div className="flex flex-wrap gap-2">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${filter === s ? 'bg-[#2490ef] text-white' : 'bg-[#f0ede8] text-[#4b5563] hover:bg-[#e5e2dc]'}`}
          >
            {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'sku', label: 'SKU' }, { key: 'product', label: 'Product' },
              { key: 'hsCode', label: 'HS Code' }, { key: 'dutyRate', label: 'Duty Rate' },
              { key: 'status', label: 'Duty Status' }, { key: 'lastUpdated', label: 'Last Updated' },
            ]}
            rows={filtered.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.6 FZ Inbound
// ─────────────────────────────────────────────────────────
const inboundSeed = [
  { ref: 'FZ-IN-0043', goods: 'Electronic Components', qty: 500, uom: 'PCS', origin: 'China', carrier: 'Emirates SkyCargo', bol: 'BOL-2026-4411', warehouse: 'JAFZA-01', arrival: '10 Sep 2026', docRef: 'DEC-2026-4411', status: 'CUSTOMS_CLEARED' },
  { ref: 'FZ-IN-0044', goods: 'Hydraulic Pumps', qty: 20, uom: 'UNT', origin: 'Germany', carrier: 'Lufthansa Cargo', bol: 'BOL-2026-4398', warehouse: 'DAFZA-01', arrival: '12 Sep 2026', docRef: 'DEC-2026-4398', status: 'UNDER_CUSTOMS' },
  { ref: 'FZ-IN-0045', goods: 'Textile Raw Material', qty: 1200, uom: 'KG', origin: 'India', carrier: 'Air India Cargo', bol: 'BOL-2026-4355', warehouse: 'DMCC-01', arrival: '15 Sep 2026', docRef: 'DEC-2026-4355', status: 'PENDING_CLEARANCE' },
];

export function InboundPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader
        title="FZ Inbound"
        description="Receive goods entering the free zone and record relevant documentation"
        action={{ label: 'Record Inbound', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Total Inbound (Sep)" value="45" icon={Package} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Pending Customs" value="2" icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Cleared" value="43" icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods Description' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'origin', label: 'Origin Country' }, { key: 'carrier', label: 'Carrier' },
              { key: 'bol', label: 'Bill of Lading' }, { key: 'warehouse', label: 'FZ Warehouse' },
              { key: 'arrival', label: 'Arrival Date' }, { key: 'docRef', label: 'Customs Doc' },
              { key: 'status', label: 'Status' },
            ]}
            rows={inboundSeed.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Record FZ Inbound Movement</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Goods Description"><Inp placeholder="Description of goods" /></Field>
            <Field label="HS Code"><Inp placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Quantity"><Inp placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL', 'LTR', 'MTR']} /></Field>
            <Field label="Country of Origin"><Inp placeholder="e.g. China" /></Field>
            <Field label="Country of Export"><Inp placeholder="e.g. Singapore" /></Field>
            <Field label="Carrier / Airline"><Inp placeholder="Carrier name" /></Field>
            <Field label="Bill of Lading / AWB"><Inp placeholder="BOL-YYYY-NNNN" /></Field>
            <Field label="Vessel / Flight No."><Inp placeholder="e.g. EK-8714" /></Field>
            <Field label="Arrival Date" ><Inp type="date" placeholder="" /></Field>
            <Field label="FZ Warehouse"><Sel placeholder="Select warehouse" options={['JAFZA-01', 'DAFZA-01', 'DMCC-01']} /></Field>
            <Field label="Location / Bay"><Inp placeholder="e.g. Bay A-12" /></Field>
            <Field label="Customs Declaration No."><Inp placeholder="DEC-YYYY-NNNN" /></Field>
            <Field label="Customs Duty Status"><Sel placeholder="Select status" options={['Duty Free', 'Duty Applicable', 'Bonded', 'Suspended', 'Under Customs']} /></Field>
            <Field label="Estimated Value (AED)"><Inp placeholder="0.00" type="number" /></Field>
            <Field label="Net Weight (KG)"><Inp placeholder="0.00" type="number" /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Record Inbound</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.7 FZ Outbound
// ─────────────────────────────────────────────────────────
const outboundSeed = [
  { ref: 'FZ-OUT-0029', goods: 'Finished Electronic Boards', qty: 300, uom: 'PCS', destination: 'USA', exitDocRef: 'EXP-2026-3311', carrier: 'FedEx', exitDate: '18 Sep 2026', warehouse: 'JAFZA-01', status: 'RELEASED' },
  { ref: 'FZ-OUT-0030', goods: 'Textile Rolls', qty: 80, uom: 'ROL', destination: 'UK', exitDocRef: 'EXP-2026-3298', carrier: 'DHL Express', exitDate: '20 Sep 2026', warehouse: 'DMCC-01', status: 'CUSTOMS_CLEARED' },
  { ref: 'FZ-OUT-0031', goods: 'Machine Spare Parts', qty: 15, uom: 'UNT', destination: 'KSA', exitDocRef: 'EXP-2026-3277', carrier: 'Aramex', exitDate: '22 Sep 2026', warehouse: 'DAFZA-01', status: 'PENDING_CLEARANCE' },
];

export function OutboundPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader
        title="FZ Outbound"
        description="Process goods leaving the free zone with required operational references"
        action={{ label: 'Record Outbound', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Total Outbound (Sep)" value="31" icon={Package} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatsCard title="Pending Exit Clearance" value="1" icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Successfully Released" value="30" icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'destination', label: 'Destination' }, { key: 'exitDocRef', label: 'Exit Doc Ref' },
              { key: 'carrier', label: 'Carrier' }, { key: 'exitDate', label: 'Exit Date' },
              { key: 'warehouse', label: 'Warehouse' }, { key: 'status', label: 'Status' },
            ]}
            rows={outboundSeed.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Record FZ Outbound Movement</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Goods Description"><Inp placeholder="Description of goods" /></Field>
            <Field label="HS Code"><Inp placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Quantity"><Inp placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL', 'LTR', 'MTR']} /></Field>
            <Field label="FZ Warehouse (Source)"><Sel placeholder="Select warehouse" options={['JAFZA-01', 'DAFZA-01', 'DMCC-01']} /></Field>
            <Field label="Destination Country"><Inp placeholder="e.g. USA" /></Field>
            <Field label="Carrier"><Inp placeholder="Carrier / Freight company" /></Field>
            <Field label="Exit Document Reference"><Inp placeholder="EXP-YYYY-NNNN" /></Field>
            <Field label="Export Declaration No."><Inp placeholder="EDC-YYYY-NNNN" /></Field>
            <Field label="Exit Date" ><Inp type="date" placeholder="" /></Field>
            <Field label="Delivery / Consignee Reference"><Inp placeholder="Consignee ref" /></Field>
            <Field label="Net Weight (KG)"><Inp placeholder="0.00" type="number" /></Field>
            <Field label="FOB Value (AED)"><Inp placeholder="0.00" type="number" /></Field>
            <Field label="Remarks"><Inp placeholder="Optional notes" /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Record Outbound</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.8 FZ → FZ Transfer
// ─────────────────────────────────────────────────────────
const fzTransferSeed = [
  { ref: 'FZ-TR-0017', goods: 'Electronic Components', qty: 200, uom: 'PCS', sourceFZ: 'JAFZA-01', destFZ: 'DAFZA-01', transitRef: 'TR-CUS-2026-0191', date: '19 Sep 2026', status: 'CUSTOMS_CLEARED' },
  { ref: 'FZ-TR-0018', goods: 'Industrial Spare Parts', qty: 50, uom: 'UNT', sourceFZ: 'DMCC-01', destFZ: 'JAFZA-01', transitRef: 'TR-CUS-2026-0185', date: '20 Sep 2026', status: 'IN_TRANSIT_FZ' },
  { ref: 'FZ-TR-0019', goods: 'Pharmaceutical Compounds', qty: 150, uom: 'KG', sourceFZ: 'DAFZA-01', destFZ: 'DMCC-01', transitRef: 'TR-CUS-2026-0180', date: '21 Sep 2026', status: 'PENDING_CLEARANCE' },
];

export function FZTransferPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader
        title="FZ → FZ Transfer"
        description="Transfer stock between free-zone locations while retaining full customs traceability"
        action={{ label: 'Record Transfer', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Transfers (Sep)" value="19" icon={ArrowRightLeft} iconBg="bg-sky-50" iconColor="text-sky-600" />
        <StatsCard title="In Transit" value="1" icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Completed" value="17" icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'sourceFZ', label: 'Source FZ' }, { key: 'destFZ', label: 'Destination FZ' },
              { key: 'transitRef', label: 'Transit Customs Ref' }, { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ]}
            rows={fzTransferSeed.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record FZ → FZ Transfer</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Source Free Zone Warehouse"><Sel placeholder="Select source" options={['JAFZA-01', 'DAFZA-01', 'DMCC-01']} /></Field>
            <Field label="Destination Free Zone Warehouse"><Sel placeholder="Select destination" options={['JAFZA-01', 'DAFZA-01', 'DMCC-01']} /></Field>
            <Field label="Goods Description"><Inp placeholder="Description of goods" /></Field>
            <Field label="HS Code"><Inp placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Quantity"><Inp placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL']} /></Field>
            <Field label="Customs Transit Reference"><Inp placeholder="TR-CUS-YYYY-NNNN" /></Field>
            <Field label="Transfer Date"><Inp type="date" placeholder="" /></Field>
            <Field label="Carrier / Vehicle No."><Inp placeholder="Transport details" /></Field>
            <Field label="Sealing Reference"><Inp placeholder="Customs seal no." /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Record Transfer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.9 FZ → Mainland Workflow
// ─────────────────────────────────────────────────────────
type MLStatus = 'FZ_STOCK' | 'CUSTOMS_CLEARANCE' | 'MAINLAND_DELIVERY';
const mlSeed: { ref: string; goods: string; qty: number; uom: string; fzWarehouse: string; mainlandDest: string; importDecl: string; date: string; stage: MLStatus }[] = [
  { ref: 'FZ-ML-0019', goods: 'Consumer Electronics', qty: 200, uom: 'PCS', fzWarehouse: 'JAFZA-01', mainlandDest: 'Al Quoz Warehouse, Dubai', importDecl: 'IMP-2026-1011', date: '20 Sep 2026', stage: 'MAINLAND_DELIVERY' },
  { ref: 'FZ-ML-0020', goods: 'Luxury Accessories', qty: 40, uom: 'PCS', fzWarehouse: 'DMCC-01', mainlandDest: 'Mall of Emirates, Dubai', importDecl: 'IMP-2026-1018', date: '21 Sep 2026', stage: 'CUSTOMS_CLEARANCE' },
  { ref: 'FZ-ML-0021', goods: 'Industrial Machinery', qty: 3, uom: 'UNT', fzWarehouse: 'DAFZA-01', mainlandDest: 'Jebel Ali Industrial Area', importDecl: '', date: '22 Sep 2026', stage: 'FZ_STOCK' },
  { ref: 'FZ-ML-0022', goods: 'Consumer Goods', qty: 300, uom: 'PCS', fzWarehouse: 'JAFZA-01', mainlandDest: 'Deira Distribution Centre', importDecl: 'IMP-2026-1022', date: '23 Sep 2026', stage: 'CUSTOMS_CLEARANCE' },
];

const mlStages: { key: MLStatus; label: string; color: string; bg: string }[] = [
  { key: 'FZ_STOCK', label: 'FZ Stock', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  { key: 'CUSTOMS_CLEARANCE', label: 'Customs Clearance', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { key: 'MAINLAND_DELIVERY', label: 'Mainland Delivery', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
];

export function MainlandWorkflowPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader
        title="FZ → Mainland Workflow"
        description="Manage inventory movement from free zone toward mainland fulfillment"
        action={{ label: 'New Movement', onClick: () => setOpen(true), icon: Plus }}
      />

      {/* Kanban board */}
      <div className="grid gap-4 sm:grid-cols-3">
        {mlStages.map(stage => {
          const items = mlSeed.filter(r => r.stage === stage.key);
          return (
            <div key={stage.key} className={`rounded-lg border p-4 ${stage.bg}`}>
              <div className="mb-3 flex items-center justify-between">
                <p className={`text-sm font-semibold ${stage.color}`}>{stage.label}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${stage.color} bg-white border`}>{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 && <p className="text-xs text-[#9ca3af]">No items</p>}
                {items.map(item => (
                  <div key={item.ref} className="rounded-md border border-[#e5e2dc] bg-white p-3 shadow-sm">
                    <p className="text-xs font-semibold text-[#1f2937]">{item.ref}</p>
                    <p className="mt-0.5 text-xs text-[#6b7280]">{item.goods}</p>
                    <p className="mt-0.5 text-xs text-[#9ca3af]">{item.qty} {item.uom} · {item.fzWarehouse}</p>
                    {item.importDecl && <p className="mt-1 text-[10px] text-[#1674c4]">{item.importDecl}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail table */}
      <Card>
        <CardHeader><CardTitle>All Mainland Movements</CardTitle></CardHeader>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'fzWarehouse', label: 'FZ Warehouse' }, { key: 'mainlandDest', label: 'Mainland Destination' },
              { key: 'importDecl', label: 'Import Declaration' }, { key: 'date', label: 'Date' },
              { key: 'stage', label: 'Stage' },
            ]}
            rows={mlSeed.map(r => ({
              ...r,
              importDecl: r.importDecl || '—',
              stage: <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${mlStages.find(s => s.key === r.stage)?.bg} ${mlStages.find(s => s.key === r.stage)?.color}`}>{mlStages.find(s => s.key === r.stage)?.label}</span>
            }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New FZ → Mainland Movement</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Goods Description"><Inp placeholder="Description of goods" /></Field>
            <Field label="Quantity"><Inp placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL']} /></Field>
            <Field label="FZ Warehouse (Source)"><Sel placeholder="Select warehouse" options={['JAFZA-01', 'DAFZA-01', 'DMCC-01']} /></Field>
            <Field label="Mainland Destination"><Inp placeholder="Address / warehouse" /></Field>
            <Field label="Import Declaration No."><Inp placeholder="IMP-YYYY-NNNN" /></Field>
            <Field label="Customs Duty Payment Ref"><Inp placeholder="PAY-YYYY-NNNN" /></Field>
            <Field label="Delivery Date"><Inp type="date" placeholder="" /></Field>
            <Field label="Transporter"><Inp placeholder="Company name" /></Field>
            <Field label="Vehicle / Container No."><Inp placeholder="Vehicle or container ref" /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Create Movement</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.10 Re-Export Workflow
// ─────────────────────────────────────────────────────────
const reExportSeed = [
  { ref: 'FZ-RE-0006', goods: 'Electronic PCB Assembly', qty: 200, uom: 'PCS', destCountry: 'USA', permitNo: 'REX-2026-0441', carrier: 'Emirates SkyCargo', exitDate: '18 Sep 2026', fzWarehouse: 'JAFZA-01', status: 'RE_EXPORT' },
  { ref: 'FZ-RE-0007', goods: 'Pharmaceutical Products', qty: 100, uom: 'KG', destCountry: 'Germany', permitNo: 'REX-2026-0428', carrier: 'Lufthansa Cargo', exitDate: '20 Sep 2026', fzWarehouse: 'DAFZA-01', status: 'CUSTOMS_CLEARED' },
  { ref: 'FZ-RE-0008', goods: 'Machinery Spares', qty: 12, uom: 'CTN', destCountry: 'India', permitNo: 'REX-2026-0415', carrier: 'Air India Cargo', exitDate: '21 Sep 2026', fzWarehouse: 'DMCC-01', status: 'PENDING_CLEARANCE' },
];

export function ReExportPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Re-Export Workflow"
        description="Handle goods leaving the UAE for re-export to another country"
        action={{ label: 'Record Re-Export', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Re-Exports (Sep)" value="8" icon={Globe} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatsCard title="Pending Exit" value="1" icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Completed" value="7" icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'destCountry', label: 'Destination Country' }, { key: 'permitNo', label: 'Re-Export Permit' },
              { key: 'carrier', label: 'Carrier' }, { key: 'exitDate', label: 'Exit Date' },
              { key: 'fzWarehouse', label: 'FZ Warehouse' }, { key: 'status', label: 'Status' },
            ]}
            rows={reExportSeed.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Re-Export</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Goods Description"><Inp placeholder="Description of goods" /></Field>
            <Field label="HS Code"><Inp placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Quantity"><Inp placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL']} /></Field>
            <Field label="FZ Warehouse (Origin)"><Sel placeholder="Select warehouse" options={['JAFZA-01', 'DAFZA-01', 'DMCC-01']} /></Field>
            <Field label="Destination Country"><Inp placeholder="e.g. USA" /></Field>
            <Field label="Re-Export Permit No."><Inp placeholder="REX-YYYY-NNNN" /></Field>
            <Field label="Carrier"><Inp placeholder="Carrier / Freight company" /></Field>
            <Field label="Flight / Vessel No."><Inp placeholder="e.g. EK-8714" /></Field>
            <Field label="Customs Exit Declaration"><Inp placeholder="CXD-YYYY-NNNN" /></Field>
            <Field label="Exit Date"><Inp type="date" placeholder="" /></Field>
            <Field label="FOB Value (AED)"><Inp placeholder="0.00" type="number" /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Record Re-Export</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.11 Customs Document Repository
// ─────────────────────────────────────────────────────────
const docTypes = ['All Types', 'Import Declaration', 'Export Declaration', 'Re-Export Permit', 'Bill of Lading', 'Airway Bill', 'Packing List', 'Certificate of Origin', 'Commercial Invoice', 'Customs Bond'];
const docSeed = [
  { name: 'Import Declaration - FZ-IN-0043', type: 'Import Declaration', linkedRef: 'FZ-IN-0043', uploadDate: '10 Sep 2026', size: '248 KB', uploader: 'Ahmed Al Mansoori' },
  { name: 'BOL - SHP-2026-1122', type: 'Bill of Lading', linkedRef: 'FZ-IN-0043', uploadDate: '10 Sep 2026', size: '182 KB', uploader: 'Ahmed Al Mansoori' },
  { name: 'Export Declaration - FZ-OUT-0029', type: 'Export Declaration', linkedRef: 'FZ-OUT-0029', uploadDate: '18 Sep 2026', size: '315 KB', uploader: 'Fatima Al Rashid' },
  { name: 'Re-Export Permit - REX-2026-0441', type: 'Re-Export Permit', linkedRef: 'FZ-RE-0006', uploadDate: '17 Sep 2026', size: '201 KB', uploader: 'Khalid Hassan' },
  { name: 'Certificate of Origin - FZ-IN-0044', type: 'Certificate of Origin', linkedRef: 'FZ-IN-0044', uploadDate: '12 Sep 2026', size: '155 KB', uploader: 'Ahmed Al Mansoori' },
  { name: 'Commercial Invoice - FZ-ML-0019', type: 'Commercial Invoice', linkedRef: 'FZ-ML-0019', uploadDate: '20 Sep 2026', size: '290 KB', uploader: 'Sara Al Yabhouni' },
];

export function DocumentRepositoryPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');

  const filtered = docSeed.filter(d =>
    (typeFilter === 'All Types' || d.type === typeFilter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.linkedRef.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customs Document Repository"
        description="Store and manage customs and shipment documents against transactions"
        action={{ label: 'Upload Document', onClick: () => setOpen(true), icon: Upload }}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-[#e5e2dc] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2490ef]/30"
          />
        </div>
        <select
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="h-10 rounded-md border border-[#e5e2dc] px-3 text-sm focus:outline-none"
        >
          {docTypes.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((doc, i) => (
          <Card key={i} className="transition hover:border-[#d5d0c8] hover:shadow-md">
            <CardContent className="p-4">
              <div className="mb-2 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#eef6fd]">
                  <FileText className="h-5 w-5 text-[#1674c4]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1f2937]">{doc.name}</p>
                  <p className="text-xs text-[#7c8591]">{doc.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-[#7c8591]">
                <span>Linked: <span className="font-medium text-[#1674c4]">{doc.linkedRef}</span></span>
                <span>Size: {doc.size}</span>
                <span>By: {doc.uploader}</span>
                <span>{doc.uploadDate}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
                  <Eye className="h-3 w-3" />View
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
                  <Download className="h-3 w-3" />Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 flex min-h-32 items-center justify-center text-sm text-[#9ca3af]">No documents found</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Customs Document</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2">
            <Field label="Document Type"><Sel placeholder="Select type" options={docTypes.slice(1)} /></Field>
            <Field label="Document Name / Title"><Inp placeholder="e.g. BOL for FZ-IN-0043" /></Field>
            <Field label="Linked Transaction Reference"><Inp placeholder="FZ-IN-NNNN / FZ-OUT-NNNN etc." /></Field>
            <Field label="Issue Date"><Inp type="date" placeholder="" /></Field>
            <Field label="Issued By / Authority"><Inp placeholder="Issuing authority" /></Field>
            <Field label="File Upload">
              <div className="flex h-24 flex-col items-center justify-center rounded-md border-2 border-dashed border-[#e5e2dc] text-sm text-[#9ca3af] hover:border-[#2490ef]/40 cursor-pointer">
                <Upload className="mb-1 h-5 w-5" />
                Click or drag file here (PDF, JPG, PNG)
              </div>
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Upload Document</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.12 Customs Stock Reconciliation
// ─────────────────────────────────────────────────────────
const reconSeed = [
  { sku: 'SKU-1001', product: 'Electronic PCB Assembly', systemQty: 500, customsQty: 500, variance: 0, warehouse: 'JAFZA-01', lastReconciled: '20 Sep 2026' },
  { sku: 'SKU-2034', product: 'Hydraulic Pumps', systemQty: 20, customsQty: 18, variance: -2, warehouse: 'DAFZA-01', lastReconciled: '19 Sep 2026' },
  { sku: 'SKU-3210', product: 'Textile Raw Material', systemQty: 1200, customsQty: 1215, variance: 15, warehouse: 'DMCC-01', lastReconciled: '18 Sep 2026' },
  { sku: 'SKU-4001', product: 'Pharmaceutical Compounds', systemQty: 300, customsQty: 300, variance: 0, warehouse: 'JAFZA-01', lastReconciled: '17 Sep 2026' },
  { sku: 'SKU-5521', product: 'Luxury Watch Components', systemQty: 80, customsQty: 79, variance: -1, warehouse: 'DMCC-01', lastReconciled: '16 Sep 2026' },
];

export function CustomsReconciliationPage() {
  const matched = reconSeed.filter(r => r.variance === 0).length;
  const variances = reconSeed.filter(r => r.variance !== 0).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customs Stock Reconciliation"
        description="Reconcile system inventory against customs-controlled inventory records"
        action={{ label: 'Run Reconciliation', onClick: () => {}, icon: FileCheck2 }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Items Reconciled" value={reconSeed.length} icon={Package} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Matched (No Variance)" value={matched} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatsCard title="Variances Found" value={variances} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'sku', label: 'SKU' }, { key: 'product', label: 'Product' },
              { key: 'warehouse', label: 'Warehouse' }, { key: 'systemQty', label: 'System Qty' },
              { key: 'customsQty', label: 'Customs Qty' }, { key: 'variance', label: 'Variance' },
              { key: 'lastReconciled', label: 'Last Reconciled' }, { key: 'reconciliationStatus', label: 'Status' },
            ]}
            rows={reconSeed.map(r => ({
              ...r,
              variance: (
                <span className={`font-semibold ${r.variance === 0 ? 'text-[#0f9d58]' : r.variance > 0 ? 'text-[#d98324]' : 'text-[#c3423f]'}`}>
                  {r.variance === 0 ? '—' : r.variance > 0 ? `+${r.variance}` : r.variance}
                </span>
              ),
              reconciliationStatus: r.variance === 0
                ? <StatusBadge status="APPROVED" />
                : <StatusBadge status="PENDING" />,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.13 Customs Audit Trail
// ─────────────────────────────────────────────────────────
const auditSeed = [
  { timestamp: '23 Sep 2026, 09:14', action: 'Inbound Recorded', ref: 'FZ-IN-0045', user: 'Ahmed Al Mansoori', warehouse: 'JAFZA-01', details: 'Electronic Components · 500 PCS · DEC-2026-4411', type: 'INBOUND' },
  { timestamp: '22 Sep 2026, 16:30', action: 'Outbound Released', ref: 'FZ-OUT-0031', user: 'Fatima Al Rashid', warehouse: 'DAFZA-01', details: 'Machine Spare Parts · 15 UNT · EXP-2026-3277', type: 'OUTBOUND' },
  { timestamp: '22 Sep 2026, 14:05', action: 'FZ Transfer Initiated', ref: 'FZ-TR-0019', user: 'Khalid Hassan', warehouse: 'DAFZA-01 → DMCC-01', details: 'Pharmaceutical Compounds · 150 KG · TR-CUS-2026-0180', type: 'TRANSFER' },
  { timestamp: '21 Sep 2026, 11:22', action: 'Duty Status Changed', ref: 'SKU-3210', user: 'Sara Al Yabhouni', warehouse: 'DMCC-01', details: 'Status updated: UNDER_CUSTOMS → BONDED', type: 'STATUS_CHANGE' },
  { timestamp: '21 Sep 2026, 10:00', action: 'Document Uploaded', ref: 'FZ-RE-0008', user: 'Khalid Hassan', warehouse: 'DMCC-01', details: 'Re-Export Permit REX-2026-0415 attached', type: 'DOCUMENT' },
  { timestamp: '20 Sep 2026, 15:45', action: 'Customs Clearance Received', ref: 'FZ-IN-0043', user: 'Ahmed Al Mansoori', warehouse: 'JAFZA-01', details: 'Electronic PCB Assembly · 500 PCS cleared by Dubai Customs', type: 'CLEARANCE' },
  { timestamp: '20 Sep 2026, 09:30', action: 'Re-Export Processed', ref: 'FZ-RE-0006', user: 'Fatima Al Rashid', warehouse: 'JAFZA-01', details: 'Electronic PCB Assembly · 200 PCS → USA · REX-2026-0441', type: 'RE_EXPORT' },
  { timestamp: '19 Sep 2026, 13:15', action: 'Reconciliation Completed', ref: 'RECON-SEP-2026', user: 'System', warehouse: 'All Warehouses', details: '5 items checked · 3 matched · 2 variances found', type: 'RECONCILIATION' },
];

const actionTypeColors: Record<string, string> = {
  INBOUND: 'bg-blue-100 text-blue-700',
  OUTBOUND: 'bg-green-100 text-green-700',
  TRANSFER: 'bg-sky-100 text-sky-700',
  STATUS_CHANGE: 'bg-amber-100 text-amber-700',
  DOCUMENT: 'bg-indigo-100 text-indigo-700',
  CLEARANCE: 'bg-emerald-100 text-emerald-700',
  RE_EXPORT: 'bg-violet-100 text-violet-700',
  RECONCILIATION: 'bg-gray-100 text-gray-700',
};

export function FZAuditTrailPage() {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const types = ['ALL', ...Array.from(new Set(auditSeed.map(a => a.type)))];
  const filtered = auditSeed.filter(r => typeFilter === 'ALL' || r.type === typeFilter);

  return (
    <div className="space-y-5">
      <PageHeader title="FZ Audit Trail" description="Immutable historical movement records for all free zone controlled stock" />

      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${typeFilter === t ? 'bg-[#2490ef] text-white' : 'bg-[#f0ede8] text-[#4b5563] hover:bg-[#e5e2dc]'}`}
          >
            {t === 'ALL' ? 'All Events' : t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((entry, i) => (
          <div key={i} className="flex gap-4 rounded-lg border border-[#e5e2dc] bg-white p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0ede8]">
              <Clock className="h-4 w-4 text-[#7c8591]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#1f2937]">{entry.action}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${actionTypeColors[entry.type] || 'bg-gray-100 text-gray-700'}`}>
                  {entry.type.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-[#4b5563]">{entry.details}</p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-[#9ca3af]">
                <span>Ref: <span className="font-medium text-[#1674c4]">{entry.ref}</span></span>
                <span>By: {entry.user}</span>
                <span>{entry.warehouse}</span>
                <span className="ml-auto">{entry.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.14 Duty / Tax Classification
// ─────────────────────────────────────────────────────────
const dutyClassSeed = [
  { id: 'DC-001', hsCode: '8534.00.00', description: 'Printed Circuit Boards', dutyRate: '0%', vatRate: '5%', status: 'DUTY_FREE', effectiveFrom: '01 Jan 2026', authority: 'UAE FTA' },
  { id: 'DC-002', hsCode: '8413.60.00', description: 'Hydraulic Pumps', dutyRate: '5%', vatRate: '5%', status: 'DUTY_APPLICABLE', effectiveFrom: '01 Jan 2026', authority: 'UAE FTA' },
  { id: 'DC-003', hsCode: '5201.00.00', description: 'Cotton, Not Carded', dutyRate: '0%', vatRate: '0%', status: 'DUTY_FREE', effectiveFrom: '01 Jan 2026', authority: 'UAE FTA' },
  { id: 'DC-004', hsCode: '2941.90.00', description: 'Other Antibiotics', dutyRate: '0%', vatRate: '0%', status: 'DUTY_FREE', effectiveFrom: '01 Jan 2026', authority: 'UAE MoH' },
  { id: 'DC-005', hsCode: '9114.90.00', description: 'Watch Parts & Components', dutyRate: '5%', vatRate: '5%', status: 'DUTY_APPLICABLE', effectiveFrom: '01 Jan 2026', authority: 'UAE FTA' },
  { id: 'DC-006', hsCode: '2710.12.00', description: 'Light Petroleum Oils', dutyRate: '0%', vatRate: '0%', status: 'SUSPENDED', effectiveFrom: '01 Mar 2026', authority: 'UAE MOE' },
];

export function DutyClassificationPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Duty / Tax Classification"
        description="Maintain configured duty and tax status for relevant inventory movements"
        action={{ label: 'Add Classification', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Total Classifications" value={dutyClassSeed.length} icon={FileText} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Duty Free" value={dutyClassSeed.filter(d => d.status === 'DUTY_FREE').length} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatsCard title="Duty Applicable" value={dutyClassSeed.filter(d => d.status === 'DUTY_APPLICABLE').length} icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'id', label: 'ID' }, { key: 'hsCode', label: 'HS Code' },
              { key: 'description', label: 'Description' }, { key: 'dutyRate', label: 'Duty Rate' },
              { key: 'vatRate', label: 'VAT Rate' }, { key: 'status', label: 'Status' },
              { key: 'effectiveFrom', label: 'Effective From' }, { key: 'authority', label: 'Authority' },
            ]}
            rows={dutyClassSeed.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Duty / Tax Classification</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="HS Code"><Inp placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Description"><Inp placeholder="Product/commodity description" /></Field>
            <Field label="Duty Rate (%)"><Inp placeholder="0" type="number" /></Field>
            <Field label="VAT Rate (%)"><Inp placeholder="0" type="number" /></Field>
            <Field label="Classification Status"><Sel placeholder="Select status" options={['Duty Free', 'Duty Applicable', 'Suspended', 'Bonded', 'Released']} /></Field>
            <Field label="Issuing Authority"><Sel placeholder="Select authority" options={['UAE FTA', 'UAE MOE', 'UAE MoH', 'Dubai Customs', 'JAFZA Authority']} /></Field>
            <Field label="Effective From"><Inp type="date" placeholder="" /></Field>
            <Field label="Effective To (optional)"><Inp type="date" placeholder="" /></Field>
            <div className="col-span-2">
              <Field label="Notes / Remarks"><Inp placeholder="Additional classification notes" /></Field>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save Classification</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
