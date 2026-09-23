'use client';

import { useEffect, useState } from 'react';
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
import { useFreeZoneRuntime } from '@/contexts/FreeZoneRuntimeContext';

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

function Sel({ placeholder, options, value, onChange, name, required }: { placeholder: string; options: string[]; value?: string; onChange?: (value: string) => void; name?: string; required?: boolean }) {
  return (
    <select name={name} required={required} value={value} onChange={e => onChange?.(e.target.value)} className="h-10 w-full rounded-md border border-[#e5e2dc] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2490ef]/30">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
    </select>
  );
}

function Inp({ placeholder, type = 'text', value, onChange, name, required, min, max, step }: { placeholder: string; type?: string; value?: string | number; onChange?: (value: string) => void; name?: string; required?: boolean; min?: number; max?: number; step?: number | 'any' }) {
  return <Input name={name} required={required} min={min} max={max} step={step ?? (type === 'number' ? 'any' : undefined)} type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} />;
}

const FZ_UPLOAD_LIMIT_BYTES = 450 * 1024;

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the selected file.'));
    reader.onerror = () => reject(reader.error || new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

function downloadFile(name: string, content: BlobPart, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const { inbounds, entries } = useFreeZoneRuntime();
  const barMax = 50;
  const pending = inbounds.filter(row => ['UNDER_CUSTOMS', 'PENDING_CLEARANCE'].includes(row.status)).length + entries.filter(entry => ['outbound', 'transfer', 'reexport', 'mainland'].includes(entry.type)).length;
  const reExports = entries.filter(entry => entry.type === 'reexport').length;
  const statusCounts = [
    { label: 'Duty Free', key: 'DUTY_FREE', base: 38, color: 'bg-emerald-500' },
    { label: 'Duty Applicable', key: 'DUTY_APPLICABLE', base: 24, color: 'bg-orange-500' },
    { label: 'Suspended', key: 'SUSPENDED', base: 15, color: 'bg-yellow-500' },
    { label: 'Under Customs', key: 'UNDER_CUSTOMS', base: 23, color: 'bg-violet-500' },
  ];
  const dutyTotal = 100 + inbounds.length;
  const activityRows = [
    ...inbounds.map(row => ({ ref: row.ref, type: 'Inbound', goods: row.goods, qty: `${row.qty} ${row.uom}`, status: row.status, date: new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), createdAt: row.createdAt })),
    ...entries.map(row => ({ ref: row.ref, type: ({ outbound: 'Outbound', transfer: 'FZ Transfer', mainland: 'FZ → Mainland', reexport: 'Re-Export', customsReference: 'Customs Reference', document: 'Document', dutyClassification: 'Duty Classification', reconciliation: 'Reconciliation' } as Record<string, string>)[row.type] || row.type, goods: row.fields.goods || row.fields.name || row.fields.description || '—', qty: row.fields.quantity ? `${row.fields.quantity} ${row.fields.uom || ''}` : '—', status: row.type === 'outbound' || row.type === 'reexport' ? 'PENDING_CLEARANCE' : row.type === 'transfer' ? 'IN_TRANSIT_FZ' : row.type === 'mainland' ? 'MAINLAND_BOUND' : 'DECLARED', date: new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), createdAt: row.createdAt })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <div className="space-y-5">
      <PageHeader title="Free Zone Dashboard" description="Overview of all free zone and bonded warehouse operations" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total FZ Stock Items" value={1284 + inbounds.length} subtitle="across registered warehouses" icon={Package} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Under Customs Control" value={347 + inbounds.filter(row => ['UNDER_CUSTOMS', 'BONDED'].includes(row.status)).length} subtitle="awaiting clearance" icon={Shield} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatsCard title="Pending Clearances" value={23 + pending} subtitle="open customs cases and movements" icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Re-Exports (Sep)" value={18 + reExports} subtitle="shipments this month" icon={Globe} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
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
                      style={{ height: `${((row.in + (row.m === 'Sep' ? inbounds.length : 0)) / barMax) * 140}px` }}
                      title={`Inbound: ${row.in + (row.m === 'Sep' ? inbounds.length : 0)}`}
                    />
                    <div
                      className="flex-1 rounded-t bg-[#0f9d58]"
                      style={{ height: `${((row.out + (row.m === 'Sep' ? entries.filter(entry => entry.type === 'outbound').length : 0)) / barMax) * 140}px` }}
                      title={`Outbound: ${row.out + (row.m === 'Sep' ? entries.filter(entry => entry.type === 'outbound').length : 0)}`}
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
            {statusCounts.map(item => {
              const count = inbounds.filter(row => row.status === item.key).length;
              const value = Math.round(((item.base + count) / dutyTotal) * 100);
              return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[#4b5563]">{item.label}</span>
                  <span className="font-semibold text-[#1f2937]">{value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f0ede8]">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${value}%` }} />
                </div>
              </div>
              );
            })}
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
            rows={[...activityRows.map(({ createdAt: _createdAt, ...row }) => ({ ...row, status: <StatusBadge status={row.status} /> })), ...recentActivity.map(row => ({ ...row, status: <StatusBadge status={row.status} /> }))]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.1 Warehouse Configuration
// ─────────────────────────────────────────────────────────
export function WarehouseConfigPage() {
  const [open, setOpen] = useState(false);
  const { warehouses, inbounds, entries, addWarehouse, updateWarehouse, deleteWarehouse } = useFreeZoneRuntime();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', zone: '', type: '', customsCode: '', locations: '', address: '', officer: '' });
  const saveWarehouse = () => {
    if (!form.name.trim() || !form.code.trim() || !form.zone || !form.type || !form.customsCode.trim() || form.locations === '' || !Number.isInteger(Number(form.locations)) || Number(form.locations) < 0) { window.alert('Complete the required warehouse fields and enter a valid location count.'); return; }
    const duplicate = warehouses.some(w => w.id !== editingId && w.code.toLowerCase() === form.code.trim().toLowerCase());
    if (duplicate) { window.alert('A warehouse with this code already exists.'); return; }
    const values = { name: form.name.trim(), code: form.code.trim(), zone: form.zone, type: form.type, customsCode: form.customsCode.trim(), locations: Number(form.locations), address: form.address.trim(), officer: form.officer.trim() };
    if (editingId) updateWarehouse(editingId, values);
    else if (!addWarehouse({ ...values, status: 'ACTIVE' })) { window.alert('A warehouse with this code already exists.'); return; }
    setEditingId(null); setForm({ name: '', code: '', zone: '', type: '', customsCode: '', locations: '', address: '', officer: '' }); setOpen(false);
  };
  const startEdit = (warehouse: typeof warehouses[number]) => {
    setEditingId(warehouse.id);
    setForm({ name: warehouse.name, code: warehouse.code, zone: warehouse.zone, type: warehouse.type, customsCode: warehouse.customsCode, locations: String(warehouse.locations), address: warehouse.address || '', officer: warehouse.officer || '' });
    setOpen(true);
  };
  const removeWarehouse = (id: string, code: string) => {
    if (id.startsWith('sample-wh-')) { window.alert('Sample warehouses are kept as the prototype baseline.'); return; }
    const isReferenced = inbounds.some(row => row.warehouse === code) || entries.some(row => row.fields.warehouse === code || row.fields.source === code || row.fields.destination === code);
    if (isReferenced) { window.alert('This warehouse is linked to Free Zone transactions and cannot be deleted.'); return; }
    if (window.confirm(`Delete warehouse ${code}?`)) deleteWarehouse(id);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Warehouse Configuration"
        description="Configure warehouses and locations specifically for free-zone operations"
        action={{ label: 'Add Warehouse', onClick: () => setOpen(true), icon: Plus }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {warehouses.map(w => (
          <Card key={w.id} className="transition hover:border-[#d5d0c8] hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef6fd]">
                  <Warehouse className="h-5 w-5 text-[#1674c4]" />
                </div>
                <StatusBadge status={w.status} />
              </div>
              <p className="font-semibold text-[#1f2937]">{w.name}</p>
              <p className="mt-0.5 text-xs text-[#7c8591]">{w.code} · {w.zone}</p>
              {(w.address || w.officer) && <p className="mt-1 text-xs text-[#7c8591]">{[w.address, w.officer && `Officer: ${w.officer}`].filter(Boolean).join(' · ')}</p>}
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
              <div className="mt-4 flex justify-end gap-3 border-t border-[#f0ede8] pt-3 text-xs">
                <button className="font-medium text-[#1674c4] hover:underline" onClick={() => startEdit(w)}>Edit</button>
                {!w.id.startsWith('sample-wh-') && <button className="font-medium text-red-600 hover:underline" onClick={() => removeWarehouse(w.id, w.code)}>Delete</button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Free Zone Warehouse' : 'Add Free Zone Warehouse'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Warehouse Name"><Inp placeholder="e.g. JAFZA North Wing" value={form.name} onChange={name => setForm(f => ({ ...f, name }))} /></Field>
            <Field label="Warehouse Code"><Inp placeholder="e.g. JAFZA-02" value={form.code} onChange={code => setForm(f => ({ ...f, code }))} /></Field>
            <Field label="Free Zone / Zone"><Sel placeholder="Select zone" value={form.zone} onChange={zone => setForm(f => ({ ...f, zone }))} options={['Jebel Ali FZ (JAFZA)', 'Dubai Airport FZ (DAFZA)', 'DMCC', 'DIFC', 'Dubai South', 'Sharjah Airport FZ']} /></Field>
            <Field label="Warehouse Type"><Sel placeholder="Select type" value={form.type} onChange={type => setForm(f => ({ ...f, type }))} options={['Free Zone', 'Bonded', 'Customs Bonded', 'Transit']} /></Field>
            <Field label="Customs Code"><Inp placeholder="Customs-issued code" value={form.customsCode} onChange={customsCode => setForm(f => ({ ...f, customsCode }))} /></Field>
            <Field label="Number of Locations"><Inp placeholder="0" type="number" step={1} value={form.locations} onChange={locations => setForm(f => ({ ...f, locations }))} /></Field>
            <Field label="Address / Location"><Inp placeholder="Street, Building" value={form.address} onChange={address => setForm(f => ({ ...f, address }))} /></Field>
            <Field label="Responsible Officer"><Inp placeholder="Name" value={form.officer} onChange={officer => setForm(f => ({ ...f, officer }))} /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingId(null); }}>Cancel</Button>
              <Button type="button" onClick={saveWarehouse}>{editingId ? 'Save Changes' : 'Save Warehouse'}</Button>
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
  const { inbounds } = useFreeZoneRuntime();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const allRows = [...bondedSeed, ...inbounds.map(r => ({ sku: r.sku, name: r.goods, qty: r.qty, uom: r.uom, warehouse: r.warehouse, declRef: r.docRef, dutyStatus: r.status, entered: new Date(r.arrival).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }))];
  const statuses = ['ALL', ...Array.from(new Set(allRows.map(row => row.dutyStatus)))];
  const filtered = allRows.filter(r =>
    (filter === 'ALL' || r.dutyStatus === filter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Bonded / Customs Stock" description="Inventory under customs control across all free zone warehouses" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard title="Total Bonded Items" value={allRows.length} icon={Package} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatsCard title="Under Customs" value={allRows.filter(r => r.dutyStatus === 'UNDER_CUSTOMS').length} icon={Shield} iconBg="bg-violet-50" iconColor="text-violet-600" />
        <StatsCard title="Pending Clearance" value={allRows.filter(r => r.dutyStatus === 'PENDING_CLEARANCE').length} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Cleared" value={allRows.filter(r => ['CUSTOMS_CLEARED', 'DUTY_FREE', 'RELEASED'].includes(r.dutyStatus)).length} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
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
  const { inbounds } = useFreeZoneRuntime();
  const [search, setSearch] = useState('');
  const allRows = [...trackingSeed, ...inbounds.map(r => ({ ref: r.ref, product: r.goods, sku: r.sku, qty: r.qty, warehouse: r.warehouse, entryDate: new Date(r.arrival).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), expectedClearance: r.expectedClearance || '—', officer: '—', status: r.status }))];
  const active = allRows.filter(row => !['CUSTOMS_CLEARED', 'DUTY_FREE', 'RELEASED'].includes(row.status));
  const overdue = active.filter(row => row.expectedClearance !== '—' && new Date(row.expectedClearance).getTime() < new Date(new Date().toDateString()).getTime()).length;
  const clearedThisMonth = inbounds.filter(row => ['CUSTOMS_CLEARED', 'DUTY_FREE', 'RELEASED'].includes(row.status) && new Date(row.createdAt).getMonth() === new Date().getMonth()).length;
  const filtered = allRows.filter(row => `${row.ref} ${row.product} ${row.sku} ${row.warehouse}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-5">
      <PageHeader title="Customs Inventory Tracking" description="Track stock subject to customs and free-zone controls" />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Active Tracking Entries" value={active.length} icon={BarChart3} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Overdue Clearances" value={overdue} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" />
        <StatsCard title="Cleared This Month" value={8 + clearedThisMonth} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
        <input type="search" placeholder="Search reference, product, SKU or warehouse…" value={search} onChange={event => setSearch(event.target.value)} className="h-10 w-full rounded-md border border-[#e5e2dc] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2490ef]/30" />
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
            rows={filtered.map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
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
  const { inbounds, entries, addEntry, deleteEntry, warehouses } = useFreeZoneRuntime();
  const referenceEntries = entries.filter(entry => entry.type === 'customsReference');
  const saveReference = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const customsRef = String(values.customsRef).trim().toLowerCase();
    const declaration = String(values.declaration).trim().toLowerCase();
    const duplicate = refSeed.some(row => row.customsRef.toLowerCase() === customsRef || row.declarationNo.toLowerCase() === declaration)
      || inbounds.some(row => row.customsRef?.toLowerCase() === customsRef || row.docRef.toLowerCase() === declaration)
      || referenceEntries.some(row => row.fields.customsRef.toLowerCase() === customsRef || row.fields.declaration.toLowerCase() === declaration);
    if (duplicate) { window.alert('A customs reference or declaration number with those details already exists.'); return; }
    addEntry('customsReference', Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])));
    setOpen(false);
  };
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
              { key: 'id', label: 'Inbound / Reference ID' }, { key: 'declarationNo', label: 'Declaration No' },
              { key: 'shipmentNo', label: 'Shipment No' }, { key: 'customsRef', label: 'Customs Ref' },
              { key: 'product', label: 'Product' }, { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
            ]}
            rows={[...refSeed.map(r => ({ ...r, actions: '—' })), ...inbounds.map(r => ({ id: r.ref, declarationNo: r.docRef, shipmentNo: r.bol, customsRef: r.customsRef || '—', product: r.goods, date: r.arrival, status: r.status, actions: 'Inbound' })), ...referenceEntries.map(r => ({ id: r.ref, declarationNo: r.fields.declaration, shipmentNo: r.fields.shipment, customsRef: r.fields.customsRef, product: r.fields.product, date: r.fields.date, status: 'DECLARED', actions: <button className="text-red-600 hover:underline" onClick={() => deleteEntry(r.id)}>Delete</button> }))].map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Customs Reference</DialogTitle></DialogHeader>
          <form className="grid gap-3 pt-2 sm:grid-cols-2" onSubmit={saveReference}>
            <Field label="Declaration Number"><Inp name="declaration" required placeholder="DEC-YYYY-NNNN" /></Field>
            <Field label="Shipment Number"><Inp name="shipment" required placeholder="SHP-YYYY-NNNN" /></Field>
            <Field label="Customs Reference"><Inp name="customsRef" required placeholder="CUS-XXX-NNNN" /></Field>
            <Field label="Bill of Lading / AWB"><Inp name="bol" placeholder="BOL / AWB number" /></Field>
            <Field label="Linked Product / SKU"><Inp name="product" required placeholder="Product name or SKU" /></Field>
            <Field label="Warehouse"><Sel name="warehouse" required placeholder="Select warehouse" options={warehouses.map(w => w.code)} /></Field>
            <Field label="Declaration Date" ><Inp name="date" required placeholder="" type="date" /></Field>
            <Field label="Customs Authority"><Sel name="authority" required placeholder="Select authority" options={['Dubai Customs', 'Abu Dhabi Customs', 'Sharjah Customs', 'JAFZA Authority']} /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save Reference</Button>
            </div>
          </form>
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
  const [search, setSearch] = useState('');
  const { inbounds, entries } = useFreeZoneRuntime();
  const statuses = ['ALL', 'DUTY_FREE', 'DUTY_APPLICABLE', 'SUSPENDED', 'BONDED', 'UNDER_CUSTOMS', 'PENDING_CLEARANCE', 'CUSTOMS_CLEARED', 'RELEASED'];
  const inboundDutyRows = inbounds.map(r => {
    const classification = r.hsCode ? [...dutyClassSeed, ...entries.filter(entry => entry.type === 'dutyClassification').map(entry => ({ hsCode: entry.fields.hsCode, dutyRate: `${entry.fields.dutyRate}%`, status: entry.fields.status }))].find(item => item.hsCode === r.hsCode) : undefined;
    return { sku: r.sku, product: r.goods, hsCode: r.hsCode || '—', dutyRate: classification?.dutyRate || '—', status: r.status, lastUpdated: new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) };
  });
  const classificationRows = entries.filter(entry => entry.type === 'dutyClassification').map(entry => ({ sku: entry.fields.hsCode, product: entry.fields.description, hsCode: entry.fields.hsCode, dutyRate: `${entry.fields.dutyRate}%`, status: entry.fields.status, lastUpdated: entry.fields.effectiveFrom }));
  const filtered = [...dutySeed, ...inboundDutyRows, ...classificationRows].filter(r => (filter === 'ALL' || r.status === filter) && `${r.sku} ${r.product} ${r.hsCode}`.toLowerCase().includes(search.toLowerCase()));

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
  const { warehouses, inbounds, addInbound, updateInbound, deleteInbound } = useFreeZoneRuntime();
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyInboundForm = { goods: '', sku: '', hsCode: '', qty: '', uom: '', origin: '', exportCountry: '', carrier: '', bol: '', flight: '', arrival: '', expectedClearance: '', warehouse: '', location: '', docRef: '', customsRef: '', status: '', estimatedValue: '', netWeight: '' };
  const [form, setForm] = useState(emptyInboundForm);
  const saveInbound = () => {
    const qty = Number(form.qty);
    const estimatedValue = form.estimatedValue ? Number(form.estimatedValue) : undefined;
    const netWeight = form.netWeight ? Number(form.netWeight) : undefined;
    if (!form.goods.trim() || !form.sku.trim() || !Number.isFinite(qty) || qty <= 0 || !form.uom || !form.origin.trim() || !form.carrier.trim() || !form.bol.trim() || !form.arrival || !form.warehouse || !form.docRef.trim() || !form.status) { window.alert('Complete all required inbound fields and enter a quantity greater than zero.'); return; }
    if ((estimatedValue !== undefined && (!Number.isFinite(estimatedValue) || estimatedValue < 0)) || (netWeight !== undefined && (!Number.isFinite(netWeight) || netWeight < 0))) { window.alert('Estimated value and net weight must be zero or greater.'); return; }
    if (form.expectedClearance && form.expectedClearance < form.arrival) { window.alert('Expected customs clearance cannot be before the arrival date.'); return; }
    if (form.customsRef.trim() && inbounds.some(row => row.id !== editingId && row.customsRef?.toLowerCase() === form.customsRef.trim().toLowerCase())) { window.alert('That customs reference is already linked to another inbound.'); return; }
    const values = { goods: form.goods.trim(), sku: form.sku.trim(), hsCode: form.hsCode.trim(), qty, uom: form.uom, origin: form.origin.trim(), exportCountry: form.exportCountry.trim(), carrier: form.carrier.trim(), bol: form.bol.trim(), flight: form.flight.trim(), warehouse: form.warehouse, location: form.location.trim(), arrival: form.arrival, expectedClearance: form.expectedClearance, docRef: form.docRef.trim(), customsRef: form.customsRef.trim(), status: form.status, estimatedValue, netWeight };
    if (editingId) { updateInbound(editingId, values); setEditingId(null); }
    else {
      let nextReference = 46;
      while ([...inboundSeed.map(row => row.ref), ...inbounds.map(row => row.ref)].includes(`FZ-IN-${String(nextReference).padStart(4, '0')}`)) nextReference += 1;
      const ref = `FZ-IN-${String(nextReference).padStart(4, '0')}`;
      if (!addInbound({ ...values, ref })) { window.alert('An inbound with this reference already exists.'); return; }
    }
    setForm(emptyInboundForm); setOpen(false);
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="FZ Inbound"
        description="Receive goods entering the free zone and record relevant documentation"
        action={{ label: 'Record Inbound', onClick: () => { setEditingId(null); setForm(emptyInboundForm); setOpen(true); }, icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Total Inbound (Sep)" value={45 + inbounds.length} icon={Package} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Pending Customs" value={2 + inbounds.filter(row => ['UNDER_CUSTOMS', 'PENDING_CLEARANCE'].includes(row.status)).length} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Cleared" value={43 + inbounds.filter(row => ['CUSTOMS_CLEARED', 'DUTY_FREE'].includes(row.status)).length} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods Description' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'origin', label: 'Origin Country' }, { key: 'exportCountry', label: 'Export Country' }, { key: 'carrier', label: 'Carrier' },
              { key: 'bol', label: 'Bill of Lading' }, { key: 'flight', label: 'Flight / Vessel' }, { key: 'warehouse', label: 'FZ Warehouse' }, { key: 'location', label: 'Bay / Location' },
              { key: 'arrival', label: 'Arrival Date' }, { key: 'expectedClearance', label: 'Expected Clearance' }, { key: 'docRef', label: 'Customs Declaration' }, { key: 'customsRef', label: 'Customs Ref' },
              { key: 'estimatedValue', label: 'Est. Value (AED)' }, { key: 'netWeight', label: 'Net Weight (KG)' },
              { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
            ]}
            rows={[...inboundSeed.map(r => ({ ...r, exportCountry: '—', flight: '—', location: '—', expectedClearance: '—', customsRef: '—', estimatedValue: '—', netWeight: '—', actions: '—' })), ...inbounds.map(r => ({ ref: r.ref, goods: r.goods, qty: r.qty, uom: r.uom, origin: r.origin, exportCountry: r.exportCountry || '—', carrier: r.carrier, bol: r.bol, flight: r.flight || '—', warehouse: r.warehouse, location: r.location || '—', arrival: r.arrival, expectedClearance: r.expectedClearance || '—', docRef: r.docRef, customsRef: r.customsRef || '—', estimatedValue: r.estimatedValue === undefined ? '—' : r.estimatedValue.toLocaleString('en-AE'), netWeight: r.netWeight ?? '—', status: r.status, actions: <div className="flex gap-2"><button className="text-[#1674c4] hover:underline" onClick={() => { setEditingId(r.id); setForm({ goods: r.goods, sku: r.sku, hsCode: r.hsCode || '', qty: String(r.qty), uom: r.uom, origin: r.origin, exportCountry: r.exportCountry || '', carrier: r.carrier, bol: r.bol, flight: r.flight || '', arrival: r.arrival, expectedClearance: r.expectedClearance || '', warehouse: r.warehouse, location: r.location, docRef: r.docRef, customsRef: r.customsRef || '', status: r.status, estimatedValue: r.estimatedValue === undefined ? '' : String(r.estimatedValue), netWeight: r.netWeight === undefined ? '' : String(r.netWeight) }); setOpen(true); }}>Edit</button><button className="text-red-600 hover:underline" onClick={() => deleteInbound(r.id)}>Delete</button></div> }))].map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? 'Edit FZ Inbound Movement' : 'Record FZ Inbound Movement'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Field label="Goods Description"><Inp placeholder="Description of goods" value={form.goods} onChange={goods => setForm(f => ({ ...f, goods }))} /></Field>
            <Field label="SKU"><Inp placeholder="e.g. SKU-1001" value={form.sku} onChange={sku => setForm(f => ({ ...f, sku }))} /></Field>
            <Field label="HS Code"><Inp placeholder="e.g. 8534.00.00" value={form.hsCode} onChange={hsCode => setForm(f => ({ ...f, hsCode }))} /></Field>
            <Field label="Quantity"><Inp placeholder="0" type="number" min={0.01} value={form.qty} onChange={qty => setForm(f => ({ ...f, qty }))} /></Field>
            <Field label="Unit of Measure"><Sel placeholder="Select UOM" value={form.uom} onChange={uom => setForm(f => ({ ...f, uom }))} options={['PCS', 'KG', 'UNT', 'CTN', 'ROL', 'LTR', 'MTR']} /></Field>
            <Field label="Country of Origin"><Inp placeholder="e.g. China" value={form.origin} onChange={origin => setForm(f => ({ ...f, origin }))} /></Field>
            <Field label="Country of Export"><Inp placeholder="e.g. Singapore" value={form.exportCountry} onChange={exportCountry => setForm(f => ({ ...f, exportCountry }))} /></Field>
            <Field label="Carrier / Airline"><Inp placeholder="Carrier name" value={form.carrier} onChange={carrier => setForm(f => ({ ...f, carrier }))} /></Field>
            <Field label="Bill of Lading / AWB"><Inp placeholder="BOL-YYYY-NNNN" value={form.bol} onChange={bol => setForm(f => ({ ...f, bol }))} /></Field>
            <Field label="Vessel / Flight No."><Inp placeholder="e.g. EK-8714" value={form.flight} onChange={flight => setForm(f => ({ ...f, flight }))} /></Field>
            <Field label="Arrival Date" ><Inp type="date" placeholder="" value={form.arrival} onChange={arrival => setForm(f => ({ ...f, arrival }))} /></Field>
            <Field label="Expected Customs Clearance"><Inp type="date" placeholder="" value={form.expectedClearance} onChange={expectedClearance => setForm(f => ({ ...f, expectedClearance }))} /></Field>
            <Field label="FZ Warehouse"><Sel placeholder="Select warehouse" value={form.warehouse} onChange={warehouse => setForm(f => ({ ...f, warehouse }))} options={warehouses.map(w => w.code)} /></Field>
            <Field label="Location / Bay"><Inp placeholder="e.g. Bay A-12" value={form.location} onChange={location => setForm(f => ({ ...f, location }))} /></Field>
            <Field label="Customs Declaration No."><Inp placeholder="DEC-YYYY-NNNN" value={form.docRef} onChange={docRef => setForm(f => ({ ...f, docRef }))} /></Field>
            <Field label="Customs Reference No."><Inp placeholder="CUS-XXX-NNNN" value={form.customsRef} onChange={customsRef => setForm(f => ({ ...f, customsRef }))} /></Field>
            <Field label="Customs Duty Status"><Sel placeholder="Select status" value={form.status} onChange={status => setForm(f => ({ ...f, status }))} options={['DUTY_FREE', 'DUTY_APPLICABLE', 'BONDED', 'SUSPENDED', 'UNDER_CUSTOMS']} /></Field>
            <Field label="Estimated Value (AED)"><Inp placeholder="0.00" type="number" min={0} value={form.estimatedValue} onChange={estimatedValue => setForm(f => ({ ...f, estimatedValue }))} /></Field>
            <Field label="Net Weight (KG)"><Inp placeholder="0.00" type="number" min={0} value={form.netWeight} onChange={netWeight => setForm(f => ({ ...f, netWeight }))} /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingId(null); setForm(emptyInboundForm); }}>Cancel</Button>
              <Button onClick={saveInbound}>{editingId ? 'Save Changes' : 'Record Inbound'}</Button>
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
  const { entries, addEntry, updateEntry, deleteEntry, warehouses } = useFreeZoneRuntime();
  const outboundEntries = entries.filter(entry => entry.type === 'outbound');
  return (
    <div className="space-y-5">
      <PageHeader
        title="FZ Outbound"
        description="Process goods leaving the free zone with required operational references"
        action={{ label: 'Record Outbound', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Total Outbound (Sep)" value={31 + outboundEntries.length} icon={Package} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatsCard title="Pending Exit Clearance" value={1 + outboundEntries.filter(entry => !['RELEASED', 'CUSTOMS_CLEARED'].includes(entry.fields.status || '')).length} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Successfully Released" value={30 + outboundEntries.filter(entry => ['RELEASED', 'CUSTOMS_CLEARED'].includes(entry.fields.status || '')).length} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'destination', label: 'Destination' }, { key: 'exitDocRef', label: 'Exit Doc Ref' },
              { key: 'carrier', label: 'Carrier' }, { key: 'exitDate', label: 'Exit Date' },
              { key: 'warehouse', label: 'Warehouse' }, { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
            ]}
            rows={[...outboundSeed.map(r => ({ ...r, actions: '—' })), ...outboundEntries.map(r => ({ ref: r.ref, goods: r.fields.goods, qty: Number(r.fields.quantity), uom: r.fields.uom, destination: r.fields.destination, exitDocRef: r.fields.exitDocument, carrier: r.fields.carrier, exitDate: r.fields.exitDate, warehouse: r.fields.warehouse, status: r.fields.status || 'PENDING_CLEARANCE', actions: <div className="flex gap-2">{!['RELEASED', 'CUSTOMS_CLEARED'].includes(r.fields.status || '') && <button className="text-[#1674c4] hover:underline" onClick={() => updateEntry(r.id, { status: 'RELEASED' })}>Mark Released</button>}<button className="text-red-600 hover:underline" onClick={() => deleteEntry(r.id)}>Delete</button></div> }))].map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Record FZ Outbound Movement</DialogTitle></DialogHeader>
          <form className="grid gap-3 pt-2 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); const f = Object.fromEntries(new FormData(event.currentTarget).entries()); addEntry('outbound', { ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, String(v)])), status: 'PENDING_CLEARANCE' }); setOpen(false); }}>
            <Field label="Goods Description"><Inp name="goods" required placeholder="Description of goods" /></Field>
            <Field label="HS Code"><Inp name="hsCode" placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Quantity"><Inp name="quantity" min={0.01} required placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel name="uom" required placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL', 'LTR', 'MTR']} /></Field>
            <Field label="FZ Warehouse (Source)"><Sel name="warehouse" required placeholder="Select warehouse" options={warehouses.map(w => w.code)} /></Field>
            <Field label="Destination Country"><Inp name="destination" required placeholder="e.g. USA" /></Field>
            <Field label="Carrier"><Inp name="carrier" required placeholder="Carrier / Freight company" /></Field>
            <Field label="Exit Document Reference"><Inp name="exitDocument" required placeholder="EXP-YYYY-NNNN" /></Field>
            <Field label="Export Declaration No."><Inp name="exportDeclaration" placeholder="EDC-YYYY-NNNN" /></Field>
            <Field label="Exit Date" ><Inp name="exitDate" required type="date" placeholder="" /></Field>
            <Field label="Delivery / Consignee Reference"><Inp name="consignee" placeholder="Consignee ref" /></Field>
            <Field label="Net Weight (KG)"><Inp name="netWeight" placeholder="0.00" type="number" /></Field>
            <Field label="FOB Value (AED)"><Inp name="fobValue" placeholder="0.00" type="number" /></Field>
            <Field label="Remarks"><Inp name="remarks" placeholder="Optional notes" /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Record Outbound</Button>
            </div>
          </form>
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
  const { entries, addEntry, updateEntry, deleteEntry, warehouses } = useFreeZoneRuntime();
  const transferEntries = entries.filter(entry => entry.type === 'transfer');
  const recordTransfer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (values.source === values.destination) { window.alert('Choose two different warehouses for an inter-zone transfer.'); return; }
    addEntry('transfer', { ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])), status: 'IN_TRANSIT_FZ' });
    setOpen(false);
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="FZ → FZ Transfer"
        description="Transfer stock between free-zone locations while retaining full customs traceability"
        action={{ label: 'Record Transfer', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Transfers (Sep)" value={19 + transferEntries.length} icon={ArrowRightLeft} iconBg="bg-sky-50" iconColor="text-sky-600" />
        <StatsCard title="In Transit" value={1 + transferEntries.filter(entry => (entry.fields.status || 'IN_TRANSIT_FZ') === 'IN_TRANSIT_FZ').length} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Completed" value={17 + transferEntries.filter(entry => ['CUSTOMS_CLEARED', 'RELEASED'].includes(entry.fields.status || '')).length} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'sourceFZ', label: 'Source FZ' }, { key: 'destFZ', label: 'Destination FZ' },
              { key: 'transitRef', label: 'Transit Customs Ref' }, { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
            ]}
            rows={[...fzTransferSeed.map(r => ({ ...r, actions: '—' })), ...transferEntries.map(r => ({ ref: r.ref, goods: r.fields.goods, qty: Number(r.fields.quantity), uom: r.fields.uom, sourceFZ: r.fields.source, destFZ: r.fields.destination, transitRef: r.fields.transitRef, date: r.fields.date, status: r.fields.status || 'IN_TRANSIT_FZ', actions: <div className="flex gap-2">{(r.fields.status || 'IN_TRANSIT_FZ') === 'IN_TRANSIT_FZ' && <button className="text-[#1674c4] hover:underline" onClick={() => updateEntry(r.id, { status: 'CUSTOMS_CLEARED' })}>Mark Received</button>}<button className="text-red-600 hover:underline" onClick={() => deleteEntry(r.id)}>Delete</button></div> }))].map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record FZ → FZ Transfer</DialogTitle></DialogHeader>
          <form className="grid gap-3 pt-2 sm:grid-cols-2" onSubmit={recordTransfer}>
            <Field label="Source Free Zone Warehouse"><Sel name="source" required placeholder="Select source" options={warehouses.map(w => w.code)} /></Field>
            <Field label="Destination Free Zone Warehouse"><Sel name="destination" required placeholder="Select destination" options={warehouses.map(w => w.code)} /></Field>
            <Field label="Goods Description"><Inp name="goods" required placeholder="Description of goods" /></Field>
            <Field label="HS Code"><Inp name="hsCode" placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Quantity"><Inp name="quantity" min={0.01} required placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel name="uom" required placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL']} /></Field>
            <Field label="Customs Transit Reference"><Inp name="transitRef" required placeholder="TR-CUS-YYYY-NNNN" /></Field>
            <Field label="Transfer Date"><Inp name="date" required type="date" placeholder="" /></Field>
            <Field label="Carrier / Vehicle No."><Inp name="carrier" placeholder="Transport details" /></Field>
            <Field label="Sealing Reference"><Inp name="seal" placeholder="Customs seal no." /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Record Transfer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9.9 FZ → Mainland Workflow
// ─────────────────────────────────────────────────────────
type MLStatus = 'FZ_STOCK' | 'CUSTOMS_CLEARANCE' | 'MAINLAND_DELIVERY' | 'DELIVERED';
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
  { key: 'DELIVERED', label: 'Delivered', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
];

export function MainlandWorkflowPage() {
  const [open, setOpen] = useState(false);
  const { entries, addEntry, updateEntry, deleteEntry, warehouses } = useFreeZoneRuntime();
  const mainlandEntries = entries.filter(entry => entry.type === 'mainland');
  const allMainland = [...mlSeed.map(r => ({ ...r, id: '' })), ...mainlandEntries.map(r => ({ ref: r.ref, goods: r.fields.goods, qty: Number(r.fields.quantity), uom: r.fields.uom, fzWarehouse: r.fields.warehouse, mainlandDest: r.fields.destination, importDecl: r.fields.importDecl, date: r.fields.date, stage: (r.fields.stage || 'FZ_STOCK') as MLStatus, id: r.id }))];
  const advanceMovement = (id: string, stage: MLStatus) => {
    const nextStage: Record<MLStatus, MLStatus> = { FZ_STOCK: 'CUSTOMS_CLEARANCE', CUSTOMS_CLEARANCE: 'MAINLAND_DELIVERY', MAINLAND_DELIVERY: 'DELIVERED', DELIVERED: 'DELIVERED' };
    updateEntry(id, { stage: nextStage[stage] });
  };
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
          const items = allMainland.filter(r => r.stage === stage.key);
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
                    {item.id && item.stage !== 'DELIVERED' && <button className="mt-2 text-xs font-medium text-[#1674c4] hover:underline" onClick={() => advanceMovement(item.id, item.stage)}>{item.stage === 'MAINLAND_DELIVERY' ? 'Mark Delivered' : 'Advance Stage'}</button>}
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
              { key: 'stage', label: 'Stage' }, { key: 'actions', label: 'Actions' },
            ]}
            rows={allMainland.map(r => ({
              ...r,
              importDecl: r.importDecl || '—',
              actions: r.id ? <button className="text-red-600 hover:underline" onClick={() => deleteEntry(r.id)}>Delete</button> : '—',
              stage: <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${mlStages.find(s => s.key === r.stage)?.bg} ${mlStages.find(s => s.key === r.stage)?.color}`}>{mlStages.find(s => s.key === r.stage)?.label}</span>
            }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New FZ → Mainland Movement</DialogTitle></DialogHeader>
          <form className="grid gap-3 pt-2 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); const f = Object.fromEntries(new FormData(event.currentTarget).entries()); addEntry('mainland', Object.fromEntries(Object.entries(f).map(([k, v]) => [k, String(v)]))); setOpen(false); }}>
            <Field label="Goods Description"><Inp name="goods" required placeholder="Description of goods" /></Field>
            <Field label="Quantity"><Inp name="quantity" min={0.01} required placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel name="uom" required placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL']} /></Field>
            <Field label="FZ Warehouse (Source)"><Sel name="warehouse" required placeholder="Select warehouse" options={warehouses.map(w => w.code)} /></Field>
            <Field label="Workflow Stage"><Sel name="stage" required placeholder="Select stage" options={mlStages.filter(stage => stage.key !== 'DELIVERED').map(stage => stage.key)} /></Field>
            <Field label="Mainland Destination"><Inp name="destination" required placeholder="Address / warehouse" /></Field>
            <Field label="Import Declaration No."><Inp name="importDecl" placeholder="IMP-YYYY-NNNN" /></Field>
            <Field label="Customs Duty Payment Ref"><Inp name="dutyPayment" placeholder="PAY-YYYY-NNNN" /></Field>
            <Field label="Delivery Date"><Inp name="date" required type="date" placeholder="" /></Field>
            <Field label="Transporter"><Inp name="transporter" placeholder="Company name" /></Field>
            <Field label="Vehicle / Container No."><Inp name="vehicle" placeholder="Vehicle or container ref" /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create Movement</Button>
            </div>
          </form>
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
  const { entries, addEntry, updateEntry, deleteEntry, warehouses } = useFreeZoneRuntime();
  const reexportEntries = entries.filter(entry => entry.type === 'reexport');
  return (
    <div className="space-y-5">
      <PageHeader
        title="Re-Export Workflow"
        description="Handle goods leaving the UAE for re-export to another country"
        action={{ label: 'Record Re-Export', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Re-Exports (Sep)" value={8 + reexportEntries.length} icon={Globe} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatsCard title="Pending Exit" value={1 + reexportEntries.filter(entry => !['CUSTOMS_CLEARED', 'RELEASED'].includes(entry.fields.status || '')).length} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatsCard title="Completed" value={7 + reexportEntries.filter(entry => ['CUSTOMS_CLEARED', 'RELEASED'].includes(entry.fields.status || '')).length} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'ref', label: 'Reference' }, { key: 'goods', label: 'Goods' },
              { key: 'qty', label: 'Qty' }, { key: 'uom', label: 'UOM' },
              { key: 'destCountry', label: 'Destination Country' }, { key: 'permitNo', label: 'Re-Export Permit' },
              { key: 'carrier', label: 'Carrier' }, { key: 'exitDate', label: 'Exit Date' },
              { key: 'fzWarehouse', label: 'FZ Warehouse' }, { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
            ]}
            rows={[...reExportSeed.map(r => ({ ...r, actions: '—' })), ...reexportEntries.map(r => ({ ref: r.ref, goods: r.fields.goods, qty: Number(r.fields.quantity), uom: r.fields.uom, destCountry: r.fields.destination, permitNo: r.fields.permit, carrier: r.fields.carrier, exitDate: r.fields.exitDate, fzWarehouse: r.fields.warehouse, status: r.fields.status || 'PENDING_CLEARANCE', actions: <div className="flex gap-2">{!['CUSTOMS_CLEARED', 'RELEASED'].includes(r.fields.status || '') && <button className="text-[#1674c4] hover:underline" onClick={() => updateEntry(r.id, { status: 'CUSTOMS_CLEARED' })}>Mark Complete</button>}<button className="text-red-600 hover:underline" onClick={() => deleteEntry(r.id)}>Delete</button></div> }))].map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Re-Export</DialogTitle></DialogHeader>
          <form className="grid gap-3 pt-2 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); const f = Object.fromEntries(new FormData(event.currentTarget).entries()); addEntry('reexport', { ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, String(v)])), status: 'PENDING_CLEARANCE' }); setOpen(false); }}>
            <Field label="Goods Description"><Inp name="goods" required placeholder="Description of goods" /></Field>
            <Field label="HS Code"><Inp name="hsCode" placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Quantity"><Inp name="quantity" min={0.01} required placeholder="0" type="number" /></Field>
            <Field label="Unit of Measure"><Sel name="uom" required placeholder="Select UOM" options={['PCS', 'KG', 'UNT', 'CTN', 'ROL']} /></Field>
            <Field label="FZ Warehouse (Origin)"><Sel name="warehouse" required placeholder="Select warehouse" options={warehouses.map(w => w.code)} /></Field>
            <Field label="Destination Country"><Inp name="destination" required placeholder="e.g. USA" /></Field>
            <Field label="Re-Export Permit No."><Inp name="permit" required placeholder="REX-YYYY-NNNN" /></Field>
            <Field label="Carrier"><Inp name="carrier" required placeholder="Carrier / Freight company" /></Field>
            <Field label="Flight / Vessel No."><Inp name="transport" placeholder="e.g. EK-8714" /></Field>
            <Field label="Customs Exit Declaration"><Inp name="exitDeclaration" placeholder="CXD-YYYY-NNNN" /></Field>
            <Field label="Exit Date"><Inp name="exitDate" required type="date" placeholder="" /></Field>
            <Field label="FOB Value (AED)"><Inp name="fobValue" placeholder="0.00" type="number" /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Record Re-Export</Button>
            </div>
          </form>
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
type RepositoryDoc = { id: string; name: string; type: string; linkedRef: string; uploadDate: string; size: string; uploader: string; fileName?: string; fileData?: string; fileType?: string };

export function DocumentRepositoryPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [previewDoc, setPreviewDoc] = useState<RepositoryDoc | null>(null);
  const { entries, addEntry, deleteEntry } = useFreeZoneRuntime();
  useEffect(() => {
    const handleStorageError = () => setStorageWarning('Browser storage is full. This document was added for this session but may not remain after refresh. Remove older large attachments and try again.');
    window.addEventListener('free-zone-storage-error', handleStorageError);
    return () => window.removeEventListener('free-zone-storage-error', handleStorageError);
  }, []);
  const tempDocs: RepositoryDoc[] = entries.filter(entry => entry.type === 'document').map(entry => ({
    id: entry.id,
    name: entry.fields.name,
    type: entry.fields.type,
    linkedRef: entry.fields.linkedRef,
    uploadDate: entry.fields.date,
    size: entry.fields.fileSize || '—',
    uploader: entry.fields.issuedBy || 'Current User',
    fileName: entry.fields.fileName,
    fileData: entry.fields.fileData,
    fileType: entry.fields.fileType,
  }));

  const filtered: RepositoryDoc[] = [...docSeed.map(doc => ({ ...doc, id: '' })), ...tempDocs].filter(d =>
    (typeFilter === 'All Types' || d.type === typeFilter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.linkedRef.toLowerCase().includes(search.toLowerCase()))
  );

  const saveDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) { setFileError('Choose a file to attach to this document.'); return; }
    if (selectedFile.size > FZ_UPLOAD_LIMIT_BYTES) { setFileError(`Choose a file smaller than ${formatBytes(FZ_UPLOAD_LIMIT_BYTES)} so it can be kept in this browser.`); return; }
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const fileData = await fileAsDataUrl(selectedFile);
      addEntry('document', {
        ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])),
        fileName: selectedFile.name,
        fileSize: formatBytes(selectedFile.size),
        fileType: selectedFile.type || 'application/octet-stream',
        fileData,
      });
      setSelectedFile(null);
      setFileError('');
      setStorageWarning('');
      setOpen(false);
    } catch {
      setFileError('The selected file could not be read. Try another file.');
    }
  };

  const downloadDocument = (doc: RepositoryDoc) => {
    const safeName = (doc.fileName || doc.name).replace(/[^\w.-]+/g, '_');
    if (doc.fileData) {
      const anchor = document.createElement('a');
      anchor.href = doc.fileData;
      anchor.download = safeName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return;
    }
    const metadata = [`Document: ${doc.name}`, `Type: ${doc.type}`, `Linked reference: ${doc.linkedRef}`, `Date: ${doc.uploadDate}`, `Uploaded by: ${doc.uploader}`, '', 'This sample repository record contains metadata only; no original file was provided.'].join('\n');
    downloadFile(`${safeName}.txt`, metadata);
  };

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
          <Card key={doc.id || i} className="transition hover:border-[#d5d0c8] hover:shadow-md">
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
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => setPreviewDoc(doc)}>
                  <Eye className="h-3 w-3" />View
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => downloadDocument(doc)}>
                  <Download className="h-3 w-3" />Download
                </Button>
                {doc.id && <button className="px-2 text-xs text-red-600" onClick={() => deleteEntry(doc.id)}>Delete</button>}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 flex min-h-32 items-center justify-center text-sm text-[#9ca3af]">No documents found</div>
        )}
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
        <input type="search" placeholder="Search SKU, product or HS code…" value={search} onChange={event => setSearch(event.target.value)} className="h-10 w-full rounded-md border border-[#e5e2dc] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2490ef]/30" />
      </div>

      <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) { setSelectedFile(null); setFileError(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Customs Document</DialogTitle></DialogHeader>
          <form className="grid gap-3 pt-2" onSubmit={saveDocument}>
            <Field label="Document Type"><Sel name="type" required placeholder="Select type" options={docTypes.slice(1)} /></Field>
            <Field label="Document Name / Title"><Inp name="name" required placeholder="e.g. BOL for FZ-IN-0043" /></Field>
            <Field label="Linked Transaction Reference"><Inp name="linkedRef" required placeholder="FZ-IN-NNNN / FZ-OUT-NNNN etc." /></Field>
            <Field label="Issue Date"><Inp name="date" required type="date" placeholder="" /></Field>
            <Field label="Issued By / Authority"><Inp name="issuedBy" required placeholder="Issuing authority" /></Field>
            <Field label="File Upload">
              <div className="rounded-md border-2 border-dashed border-[#e5e2dc] p-3 text-sm hover:border-[#2490ef]/40">
                <label className="flex cursor-pointer flex-col items-center gap-1 text-center text-[#6b7280]">
                  <Upload className="h-5 w-5 text-[#1674c4]" />
                  <span>{selectedFile ? selectedFile.name : 'Choose a file from your device'}</span>
                  <span className="text-xs text-[#9ca3af]">PDF, image, Office, text or CSV · up to {formatBytes(FZ_UPLOAD_LIMIT_BYTES)}</span>
                  <input className="sr-only" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.txt,.csv" required onChange={event => { const file = event.target.files?.[0] || null; setSelectedFile(file); setFileError(file && file.size > FZ_UPLOAD_LIMIT_BYTES ? `Choose a file smaller than ${formatBytes(FZ_UPLOAD_LIMIT_BYTES)}.` : ''); }} />
                </label>
              </div>
            </Field>
            {fileError && <p className="text-sm text-red-600" role="alert">{fileError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setSelectedFile(null); setFileError(''); }}>Cancel</Button>
              <Button type="submit">Upload Document</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewDoc)} onOpenChange={open => { if (!open) setPreviewDoc(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{previewDoc?.name || 'Document details'}</DialogTitle></DialogHeader>
          {previewDoc && <div className="space-y-3 text-sm">
            <p><span className="font-medium">Type:</span> {previewDoc.type}</p>
            <p><span className="font-medium">Linked reference:</span> {previewDoc.linkedRef}</p>
            <p><span className="font-medium">Date:</span> {previewDoc.uploadDate}</p>
            <p><span className="font-medium">File:</span> {previewDoc.fileName || 'Sample record (metadata only)'}</p>
            <p><span className="font-medium">Size:</span> {previewDoc.size}</p>
            {previewDoc.fileData ? <button className="font-medium text-[#1674c4] hover:underline" onClick={() => window.open(previewDoc.fileData, '_blank', 'noopener,noreferrer')}>Open attached file</button> : <p className="text-xs text-[#7c8591]">The sample record has no original attachment. Download creates a text summary of its metadata.</p>}
          </div>}
        </DialogContent>
      </Dialog>
      {storageWarning && <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">{storageWarning}</div>}
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
  const { inbounds, customsCounts, setCustomsCount, entries, addEntry } = useFreeZoneRuntime();
  const stockMap = new Map<string, { sku: string; product: string; systemQty: number; defaultCustomsQty: number; warehouse: string; lastReconciled: string }>();
  for (const row of reconSeed) {
    const key = `${row.sku}@${row.warehouse}`;
    stockMap.set(key, { sku: row.sku, product: row.product, systemQty: row.systemQty, defaultCustomsQty: row.customsQty, warehouse: row.warehouse, lastReconciled: row.lastReconciled });
  }
  for (const inbound of inbounds) {
    const key = `${inbound.sku}@${inbound.warehouse}`;
    const existing = stockMap.get(key);
    if (existing) {
      existing.systemQty += inbound.qty;
      existing.defaultCustomsQty += inbound.qty;
    } else {
      stockMap.set(key, { sku: inbound.sku, product: inbound.goods, systemQty: inbound.qty, defaultCustomsQty: inbound.qty, warehouse: inbound.warehouse, lastReconciled: 'Not reconciled' });
    }
  }
  const rows = Array.from(stockMap.values()).map(row => {
    const key = `${row.sku}@${row.warehouse}`;
    const customsQty = customsCounts[key] ?? row.defaultCustomsQty;
    return { ...row, customsQty, variance: customsQty - row.systemQty, key };
  });
  const matched = rows.filter(row => row.variance === 0).length;
  const variances = rows.length - matched;
  const lastRun = entries.filter(entry => entry.type === 'reconciliation').at(-1);
  const runReconciliation = () => {
    const checked = rows;
    const matchedCount = checked.filter(row => row.variance === 0).length;
    const varianceCount = checked.length - matchedCount;
    addEntry('reconciliation', { date: new Date().toISOString(), checked: String(checked.length), matched: String(matchedCount), variances: String(varianceCount) });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customs Stock Reconciliation"
        description="Reconcile system inventory against customs-controlled inventory records"
        action={{ label: 'Run Reconciliation', onClick: runReconciliation, icon: FileCheck2 }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Items Reconciled" value={rows.length} icon={Package} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Matched (No Variance)" value={matched} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatsCard title="Variances Found" value={variances} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>
      {lastRun && <div className="rounded-md border border-[#dbeafe] bg-[#eff6ff] px-3 py-2 text-sm text-[#1e40af]" role="status">Last run: {new Date(lastRun.fields.date).toLocaleString()} · {lastRun.fields.checked} counted items · {lastRun.fields.matched} matched · {lastRun.fields.variances} variances</div>}
      <p className="text-xs text-[#7c8591]">Enter the quantity shown by customs for each SKU and warehouse, then run reconciliation. Counts and run history are kept in this browser.</p>

      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'sku', label: 'SKU' }, { key: 'product', label: 'Product' },
              { key: 'warehouse', label: 'Warehouse' }, { key: 'systemQty', label: 'System Qty' },
              { key: 'customsQty', label: 'Customs Qty' }, { key: 'variance', label: 'Variance' },
              { key: 'lastReconciled', label: 'Last Reconciled' }, { key: 'reconciliationStatus', label: 'Status' },
            ]}
            rows={rows.map(r => ({
              sku: r.sku,
              product: r.product,
              warehouse: r.warehouse,
              systemQty: r.systemQty,
              customsQty: <Input aria-label={`Customs quantity for ${r.sku} at ${r.warehouse}`} className="w-28" type="number" min={0} step="any" value={r.customsQty} onChange={event => { const next = Number(event.target.value); if (event.target.value === '' || (Number.isFinite(next) && next >= 0)) setCustomsCount(r.key, next); }} />,
              variance: (
                <span className={`font-semibold ${r.variance === 0 ? 'text-[#0f9d58]' : r.variance > 0 ? 'text-[#d98324]' : 'text-[#c3423f]'}`}>
                  {r.variance === 0 ? '—' : r.variance > 0 ? `+${r.variance}` : r.variance}
                </span>
              ),
              lastReconciled: lastRun ? new Date(lastRun.fields.date).toLocaleDateString() : r.lastReconciled,
              reconciliationStatus: lastRun && r.variance === 0
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
  WAREHOUSE: 'bg-cyan-100 text-cyan-700',
  WORKFLOW: 'bg-sky-100 text-sky-700',
  RECORD_CHANGE: 'bg-red-100 text-red-700',
};

export function FZAuditTrailPage() {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const { auditEvents } = useFreeZoneRuntime();
  const entries = [...auditEvents.map(event => ({ timestamp: new Date(event.createdAt).toLocaleString(), action: event.action, ref: event.ref, user: event.user, warehouse: event.warehouse, details: event.details, type: event.type })), ...auditSeed];
  const types = ['ALL', ...Array.from(new Set(entries.map(a => a.type)))];
  const filtered = entries.filter(r => typeFilter === 'ALL' || r.type === typeFilter);

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
  const { entries, addEntry, deleteEntry } = useFreeZoneRuntime();
  const classes = entries.filter(entry => entry.type === 'dutyClassification');
  const saveClassification = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const hsCode = String(values.hsCode).trim().toLowerCase();
    const dutyRate = Number(values.dutyRate);
    const vatRate = Number(values.vatRate);
    if (!Number.isFinite(dutyRate) || dutyRate < 0 || dutyRate > 100 || !Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) { window.alert('Duty and VAT rates must be between 0 and 100.'); return; }
    if (dutyClassSeed.some(row => row.hsCode.toLowerCase() === hsCode) || classes.some(row => row.fields.hsCode.toLowerCase() === hsCode)) { window.alert('A classification for that HS code already exists.'); return; }
    if (values.effectiveTo && String(values.effectiveTo) < String(values.effectiveFrom)) { window.alert('The end date cannot be before the effective date.'); return; }
    addEntry('dutyClassification', Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])));
    setOpen(false);
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="Duty / Tax Classification"
        description="Maintain configured duty and tax status for relevant inventory movements"
        action={{ label: 'Add Classification', onClick: () => setOpen(true), icon: Plus }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatsCard title="Total Classifications" value={dutyClassSeed.length + classes.length} icon={FileText} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard title="Duty Free" value={dutyClassSeed.filter(d => d.status === 'DUTY_FREE').length + classes.filter(d => d.fields.status === 'DUTY_FREE').length} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatsCard title="Duty Applicable" value={dutyClassSeed.filter(d => d.status === 'DUTY_APPLICABLE').length + classes.filter(d => d.fields.status === 'DUTY_APPLICABLE').length} icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" />
      </div>
      <Card>
        <CardContent className="p-4">
          <Table
            cols={[
              { key: 'id', label: 'ID' }, { key: 'hsCode', label: 'HS Code' },
              { key: 'description', label: 'Description' }, { key: 'dutyRate', label: 'Duty Rate' },
              { key: 'vatRate', label: 'VAT Rate' }, { key: 'status', label: 'Status' },
              { key: 'effectiveFrom', label: 'Effective From' }, { key: 'effectiveTo', label: 'Effective To' }, { key: 'authority', label: 'Authority' }, { key: 'notes', label: 'Notes' }, { key: 'actions', label: 'Actions' },
            ]}
            rows={[...dutyClassSeed.map(r => ({ ...r, effectiveTo: '—', notes: '—', actions: '—' })), ...classes.map(r => ({ id: r.ref, hsCode: r.fields.hsCode, description: r.fields.description, dutyRate: `${r.fields.dutyRate}%`, vatRate: `${r.fields.vatRate}%`, status: r.fields.status, effectiveFrom: r.fields.effectiveFrom, effectiveTo: r.fields.effectiveTo || '—', authority: r.fields.authority, notes: r.fields.notes || '—', actions: <button className="text-red-600 hover:underline" onClick={() => deleteEntry(r.id)}>Delete</button> }))].map(r => ({ ...r, status: <StatusBadge status={r.status} /> }))}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Duty / Tax Classification</DialogTitle></DialogHeader>
          <form className="grid gap-3 pt-2 sm:grid-cols-2" onSubmit={saveClassification}>
            <Field label="HS Code"><Inp name="hsCode" required placeholder="e.g. 8534.00.00" /></Field>
            <Field label="Description"><Inp name="description" required placeholder="Product/commodity description" /></Field>
            <Field label="Duty Rate (%)"><Inp name="dutyRate" required min={0} max={100} placeholder="0" type="number" /></Field>
            <Field label="VAT Rate (%)"><Inp name="vatRate" required min={0} max={100} placeholder="0" type="number" /></Field>
            <Field label="Classification Status"><Sel name="status" required placeholder="Select status" options={['DUTY_FREE', 'DUTY_APPLICABLE', 'SUSPENDED', 'BONDED', 'RELEASED']} /></Field>
            <Field label="Issuing Authority"><Sel name="authority" required placeholder="Select authority" options={['UAE FTA', 'UAE MOE', 'UAE MoH', 'Dubai Customs', 'JAFZA Authority']} /></Field>
            <Field label="Effective From"><Inp name="effectiveFrom" required type="date" placeholder="" /></Field>
            <Field label="Effective To (optional)"><Inp name="effectiveTo" type="date" placeholder="" /></Field>
            <div className="col-span-2">
              <Field label="Notes / Remarks"><Inp name="notes" placeholder="Additional classification notes" /></Field>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save Classification</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
