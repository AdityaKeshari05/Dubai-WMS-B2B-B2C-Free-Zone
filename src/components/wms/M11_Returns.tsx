'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Package, AlertCircle, CheckCircle, Plus, Eye,
  RefreshCw, ClipboardCheck, Archive, Truck,
} from 'lucide-react';

const INITIAL_RETURN_AUTHS = [
  { id: 'RMA-26-0041', type: 'B2B', client: 'Majid Al Futtaim Retail', order: 'WO-26-10002', sku: 'MAF-FASH-2210', product: "Men's Polo Shirt (L)", qty: 15, reason: 'Wrong size delivered', status: 'APPROVED', created: '20 Sep 2026', expectedArrival: '23 Sep 2026' },
  { id: 'RMA-26-0040', type: 'B2C', client: 'Noon Fulfillment Center', order: 'WO-26-10001', sku: 'NOON-EL-4421', product: 'Smart Home Hub v2', qty: 2, reason: 'Defective on arrival', status: 'PENDING', created: '21 Sep 2026', expectedArrival: '24 Sep 2026' },
  { id: 'RMA-26-0039', type: 'B2B', client: 'Carrefour UAE (Hyperstar)', order: 'WO-26-10004', sku: 'CRF-GROC-0091', product: 'Long Grain Rice 5kg', qty: 120, reason: 'Damaged in transit', status: 'APPROVED', created: '19 Sep 2026', expectedArrival: '22 Sep 2026' },
  { id: 'RMA-26-0038', type: 'B2C', client: 'Noon Fulfillment Center', order: 'WO-26-09050', sku: 'NOON-AP-0033', product: 'Wireless Earbuds Pro', qty: 1, reason: 'Customer changed mind', status: 'REJECTED', created: '18 Sep 2026', expectedArrival: '—' },
  { id: 'RMA-26-0037', type: 'B2B', client: 'Al Futtaim Logistics LLC', order: 'WO-26-10003', sku: 'AFL-SKU-0012', product: 'Industrial Cable Reel', qty: 5, reason: 'Overshipment', status: 'RECEIVED', created: '17 Sep 2026', expectedArrival: '21 Sep 2026' },
  { id: 'RMA-26-0036', type: 'B2C', client: 'Chalhoub Group', order: 'WO-26-10005', sku: 'CHG-LUX-0017', product: 'Premium Perfume 100ml', qty: 1, reason: 'Leaking bottle', status: 'APPROVED', created: '21 Sep 2026', expectedArrival: '25 Sep 2026' },
];

const RETURN_RECEIVING = [
  { id: 'RR-26-0031', rmaId: 'RMA-26-0041', sku: 'MAF-FASH-2210', product: "Men's Polo Shirt (L)", expectedQty: 15, receivedQty: 15, dock: 'Dock 2 – Returns Bay', receivedBy: 'Khalid Ibrahim', receivedAt: '23 Sep 2026 09:45', status: 'COMPLETED' },
  { id: 'RR-26-0030', rmaId: 'RMA-26-0039', sku: 'CRF-GROC-0091', product: 'Long Grain Rice 5kg', expectedQty: 120, receivedQty: 118, dock: 'Dock 1 – Inbound Bay', receivedBy: 'Amira Saleh', receivedAt: '22 Sep 2026 14:10', status: 'PARTIAL' },
  { id: 'RR-26-0029', rmaId: 'RMA-26-0037', sku: 'AFL-SKU-0012', product: 'Industrial Cable Reel', expectedQty: 5, receivedQty: 5, dock: 'Dock 3 – Heavy Goods', receivedBy: 'Hassan Al Ali', receivedAt: '21 Sep 2026 11:30', status: 'COMPLETED' },
  { id: 'RR-26-0028', rmaId: 'RMA-26-0040', sku: 'NOON-EL-4421', product: 'Smart Home Hub v2', expectedQty: 2, receivedQty: 0, dock: '—', receivedBy: '—', receivedAt: 'Awaited', status: 'PENDING' },
];

const RETURN_INSPECTION = [
  { id: 'RI-26-0021', rrId: 'RR-26-0031', sku: 'MAF-FASH-2210', product: "Men's Polo Shirt (L)", qty: 15, sellableQty: 12, damagedQty: 2, quarantineQty: 1, condition: 'MIXED', inspector: 'Nour Al Mansouri', inspectedAt: '23 Sep 2026 11:00', notes: '12 units sellable, 2 units minor stain, 1 unit label damage' },
  { id: 'RI-26-0020', rrId: 'RR-26-0030', sku: 'CRF-GROC-0091', product: 'Long Grain Rice 5kg', qty: 118, sellableQty: 0, damagedQty: 118, quarantineQty: 0, condition: 'DAMAGED', inspector: 'Amira Saleh', inspectedAt: '22 Sep 2026 15:00', notes: 'All bags have moisture damage — not fit for resale' },
  { id: 'RI-26-0019', rrId: 'RR-26-0029', sku: 'AFL-SKU-0012', product: 'Industrial Cable Reel', qty: 5, sellableQty: 5, damagedQty: 0, quarantineQty: 0, condition: 'SELLABLE', inspector: 'Hassan Al Ali', inspectedAt: '21 Sep 2026 12:45', notes: 'All units in original packaging — cleared for restock' },
];

const RESTOCKING = [
  { id: 'RS-26-0011', riId: 'RI-26-0021', sku: 'MAF-FASH-2210', product: "Men's Polo Shirt (L)", eligibleQty: 12, restockedQty: 12, targetBin: 'B-22-07', restockedBy: 'Nour Al Mansouri', restockedAt: '23 Sep 2026 13:30', status: 'COMPLETED' },
  { id: 'RS-26-0010', riId: 'RI-26-0019', sku: 'AFL-SKU-0012', product: 'Industrial Cable Reel', eligibleQty: 5, restockedQty: 5, targetBin: 'A-12-03', restockedBy: 'Hassan Al Ali', restockedAt: '21 Sep 2026 14:00', status: 'COMPLETED' },
  { id: 'RS-26-0009', riId: 'RI-26-0020', sku: 'CRF-GROC-0091', product: 'Long Grain Rice 5kg', eligibleQty: 0, restockedQty: 0, targetBin: '—', restockedBy: '—', restockedAt: '—', status: 'CANCELLED' },
];

const RTO_RECORDS = [
  { id: 'RTO-26-0005', shipmentId: 'SHP-26-0112', carrier: 'Aramex', sku: 'NOON-EL-4421', product: 'Smart Home Hub v2', consignee: 'Ahmed Malik, Dubai', reason: 'Address not found', attempts: 2, status: 'RECEIVED', receivedAt: '20 Sep 2026' },
  { id: 'RTO-26-0004', shipmentId: 'SHP-26-0108', carrier: 'Aramex', sku: 'CHG-LUX-0017', product: 'Premium Perfume 100ml', consignee: 'Sara Hassan, Sharjah', reason: 'Customer refused delivery', attempts: 1, status: 'PENDING', receivedAt: '—' },
  { id: 'RTO-26-0003', shipmentId: 'SHP-26-0099', carrier: 'DHL Express', sku: 'NOON-AP-0033', product: 'Wireless Earbuds Pro', consignee: 'Omar Farhan, Abu Dhabi', reason: 'Phone unreachable', attempts: 3, status: 'RESTOCKED', receivedAt: '18 Sep 2026' },
];

export function ReturnAuthorizationsPage() {
  const [rmas, setRmas] = useState(INITIAL_RETURN_AUTHS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'B2B', client: 'Noon Fulfillment Center', order: '', sku: '', product: '', qty: '', reason: '' });

  const filtered = useMemo(() => rmas.filter(r =>
    (typeFilter === 'ALL' || r.type === typeFilter) &&
    (r.id.toLowerCase().includes(search.toLowerCase()) || r.product.toLowerCase().includes(search.toLowerCase()) || r.client.toLowerCase().includes(search.toLowerCase()))
  ), [search, typeFilter, rmas]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product || !form.qty) return;
    const nextNum = parseInt(rmas[0]?.id?.split('-')[2] || '41') + 1;
    const id = `RMA-26-${String(nextNum).padStart(4, '0')}`;
    const newRma = {
      id, type: form.type, client: form.client, order: form.order || '—',
      sku: form.sku || 'MISC-SKU', product: form.product, qty: parseInt(form.qty) || 1,
      reason: form.reason, status: 'PENDING',
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expectedArrival: '—',
    };
    setRmas(prev => [newRma, ...prev]);
    setShowAdd(false);
    setForm({ type: 'B2B', client: 'Noon Fulfillment Center', order: '', sku: '', product: '', qty: '', reason: '' });
    toast.success(`RMA ${id} created — awaiting approval`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Return Authorizations" description="Approve or reject return requests from B2B clients and B2C consumers before physical goods arrive." action={{ label: 'New RMA', onClick: () => setShowAdd(true), icon: Plus }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total RMAs" value={rmas.length} icon={RefreshCw} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Pending Approval" value={rmas.filter(r => r.status === 'PENDING').length} icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Approved" value={rmas.filter(r => r.status === 'APPROVED').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Rejected" value={rmas.filter(r => r.status === 'REJECTED').length} icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search RMA ID, product or client…" className="h-8 w-64 text-sm" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-8 rounded-md border border-[#e5e2dc] px-2 text-sm">
          <option value="ALL">All Types</option><option value="B2B">B2B</option><option value="B2C">B2C</option>
        </select>
      </div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'id', header: 'RMA ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'type', header: 'Type', render: r => <Badge variant="outline" className={`text-xs ${r.type === 'B2B' ? 'border-blue-300 text-blue-700' : 'border-purple-300 text-purple-700'}`}>{r.type}</Badge> },
        { key: 'client', header: 'Client', render: r => <span className="font-medium">{r.client.split(' ').slice(0,2).join(' ')}</span> },
        { key: 'product', header: 'Product' },
        { key: 'qty', header: 'Qty', render: r => <span className="font-medium">{r.qty}</span> },
        { key: 'reason', header: 'Reason', render: r => <span className="text-xs text-gray-600">{r.reason}</span> },
        { key: 'created', header: 'Created' },
        { key: 'expectedArrival', header: 'Expected Arrival' },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
      ]} />
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Return Authorization (RMA)</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Type</Label>
                <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  <option value="B2B">B2B</option><option value="B2C">B2C</option>
                </select></div>
              <div><Label className="text-xs">Qty *</Label><Input type="number" value={form.qty} onChange={e => setForm(p => ({...p, qty: e.target.value}))} placeholder="e.g. 5" className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Client</Label><Input value={form.client} onChange={e => setForm(p => ({...p, client: e.target.value}))} placeholder="Client name" className="mt-1" /></div>
            <div><Label className="text-xs">Order Reference</Label><Input value={form.order} onChange={e => setForm(p => ({...p, order: e.target.value}))} placeholder="e.g. WO-26-10002" className="mt-1" /></div>
            <div><Label className="text-xs">SKU</Label><Input value={form.sku} onChange={e => setForm(p => ({...p, sku: e.target.value}))} placeholder="e.g. NOON-EL-4421" className="mt-1" /></div>
            <div><Label className="text-xs">Product *</Label><Input value={form.product} onChange={e => setForm(p => ({...p, product: e.target.value}))} placeholder="Product name" className="mt-1" /></div>
            <div><Label className="text-xs">Return Reason</Label><Input value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))} placeholder="e.g. Damaged on arrival" className="mt-1" /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Submit RMA</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ReturnReceivingPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Return Receiving" description="Record and confirm the physical receipt of returned goods into the warehouse." action={{ label: 'Start Receiving', onClick: () => toast('Receiving session started — scan items at dock'), icon: Package }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Active Returns" value={RETURN_RECEIVING.length} icon={Package} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Completed" value={RETURN_RECEIVING.filter(r => r.status === 'COMPLETED').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Partial" value={RETURN_RECEIVING.filter(r => r.status === 'PARTIAL').length} icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Awaiting Arrival" value={RETURN_RECEIVING.filter(r => r.status === 'PENDING').length} icon={Truck} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>
      <DataTable data={RETURN_RECEIVING} keyField="id" columns={[
        { key: 'id', header: 'Receipt ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'rmaId', header: 'RMA Ref', render: r => <span className="font-mono text-xs">{r.rmaId}</span> },
        { key: 'sku', header: 'SKU', render: r => <span className="font-mono text-xs">{r.sku}</span> },
        { key: 'product', header: 'Product' },
        { key: 'expectedQty', header: 'Expected', render: r => r.expectedQty },
        { key: 'receivedQty', header: 'Received', render: r => <span className={`font-semibold ${r.receivedQty === r.expectedQty ? 'text-green-600' : r.receivedQty === 0 ? 'text-gray-400' : 'text-amber-600'}`}>{r.receivedQty}</span> },
        { key: 'dock', header: 'Dock / Bay', render: r => <span className="text-xs">{r.dock}</span> },
        { key: 'receivedBy', header: 'Received By' },
        { key: 'receivedAt', header: 'Date & Time' },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
      ]} />
    </div>
  );
}

export function ReturnInspectionPage() {
  const [selected, setSelected] = useState<typeof RETURN_INSPECTION[0] | null>(null);
  return (
    <div className="space-y-5">
      <PageHeader title="Return Inspection" description="Inspect returned items and classify them as Sellable, Damaged or Quarantine before restocking." action={{ label: 'New Inspection', onClick: () => toast('New inspection session started'), icon: ClipboardCheck }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Inspected" value={RETURN_INSPECTION.length} icon={ClipboardCheck} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Sellable Units" value={RETURN_INSPECTION.reduce((s, r) => s + r.sellableQty, 0)} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Damaged Units" value={RETURN_INSPECTION.reduce((s, r) => s + r.damagedQty, 0)} icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatsCard title="Quarantine Units" value={RETURN_INSPECTION.reduce((s, r) => s + r.quarantineQty, 0)} icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>
      <DataTable data={RETURN_INSPECTION} keyField="id" onRowClick={setSelected} columns={[
        { key: 'id', header: 'Inspection ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'sku', header: 'SKU', render: r => <span className="font-mono text-xs">{r.sku}</span> },
        { key: 'product', header: 'Product' },
        { key: 'qty', header: 'Total Qty', render: r => <span className="font-medium">{r.qty}</span> },
        { key: 'sellableQty', header: 'Sellable', render: r => <span className="font-semibold text-green-600">{r.sellableQty}</span> },
        { key: 'damagedQty', header: 'Damaged', render: r => <span className={`font-semibold ${r.damagedQty > 0 ? 'text-red-600' : 'text-gray-400'}`}>{r.damagedQty}</span> },
        { key: 'quarantineQty', header: 'Quarantine', render: r => <span className={`font-semibold ${r.quarantineQty > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{r.quarantineQty}</span> },
        { key: 'condition', header: 'Condition', render: r => { const m: Record<string,string> = { SELLABLE: 'ACTIVE', DAMAGED: 'REJECTED', MIXED: 'PARTIAL' }; return <StatusBadge status={m[r.condition] || r.condition} />; } },
        { key: 'inspector', header: 'Inspector' },
        { key: 'inspectedAt', header: 'Inspected At' },
        { key: 'actions', header: '', render: r => <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(r); }}><Eye className="h-4 w-4" /></Button> },
      ]} />
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Inspection — {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-xs text-gray-500">SKU</p><p className="font-mono font-semibold">{selected.sku}</p></div>
                <div><p className="text-xs text-gray-500">Product</p><p>{selected.product}</p></div>
                <div><p className="text-xs text-gray-500">Inspector</p><p>{selected.inspector}</p></div>
                <div><p className="text-xs text-gray-500">Date</p><p>{selected.inspectedAt}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3 text-xs text-center">
                <div><p className="text-gray-500">Sellable</p><p className="text-lg font-bold text-green-600">{selected.sellableQty}</p></div>
                <div><p className="text-gray-500">Damaged</p><p className="text-lg font-bold text-red-600">{selected.damagedQty}</p></div>
                <div><p className="text-gray-500">Quarantine</p><p className="text-lg font-bold text-amber-600">{selected.quarantineQty}</p></div>
              </div>
              <div><p className="text-xs text-gray-500">Inspector Notes</p><p className="mt-1 rounded border border-[#e5e2dc] bg-white p-2 text-xs">{selected.notes}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function RestockingPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Restocking & RTO Processing" description="Return eligible items to sellable inventory and manage Return-to-Origin (RTO) failed delivery cases." action={{ label: 'Process Restock', onClick: () => toast.success('Restock batch queued for warehouse staff'), icon: Archive }} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1f2937]">Restocking Queue</h2>
          <DataTable data={RESTOCKING} keyField="id" columns={[
            { key: 'id', header: 'Restock ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
            { key: 'product', header: 'Product' },
            { key: 'eligibleQty', header: 'Eligible', render: r => <span className="font-medium">{r.eligibleQty}</span> },
            { key: 'restockedQty', header: 'Restocked', render: r => <span className={`font-semibold ${r.restockedQty === r.eligibleQty && r.eligibleQty > 0 ? 'text-green-600' : r.eligibleQty === 0 ? 'text-gray-400' : 'text-amber-600'}`}>{r.restockedQty}</span> },
            { key: 'targetBin', header: 'Bin', render: r => <span className="font-mono text-xs">{r.targetBin}</span> },
            { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
          ]} />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1f2937]">RTO / Failed Deliveries</h2>
          <DataTable data={RTO_RECORDS} keyField="id" columns={[
            { key: 'id', header: 'RTO ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
            { key: 'carrier', header: 'Carrier' },
            { key: 'product', header: 'Product' },
            { key: 'consignee', header: 'Consignee', render: r => <span className="text-xs">{r.consignee}</span> },
            { key: 'reason', header: 'Reason', render: r => <span className="text-xs text-gray-600">{r.reason}</span> },
            { key: 'attempts', header: 'Attempts', render: r => <span className={`font-semibold ${r.attempts >= 3 ? 'text-red-600' : 'text-amber-600'}`}>{r.attempts}</span> },
            { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
          ]} />
        </div>
      </div>
    </div>
  );
}
