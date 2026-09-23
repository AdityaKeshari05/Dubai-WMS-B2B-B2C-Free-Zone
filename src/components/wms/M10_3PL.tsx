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
  Users, Boxes, ShoppingCart, Receipt, FileText,
  Plus, Eye, Building2, MapPin,
  TrendingUp, Package, AlertCircle, CheckCircle, DollarSign,
} from 'lucide-react';

const INITIAL_CLIENTS = [
  { id: 'C001', name: 'Al Futtaim Logistics LLC', contact: 'Ahmed Al Rashidi', phone: '+971-4-295-1111', email: 'ops@alfuttaim-log.ae', warehouse: 'DIC Warehouse – Zone A', skuCount: 142, status: 'ACTIVE', sla: '99.2%', monthlyAED: 48500 },
  { id: 'C002', name: 'Majid Al Futtaim Retail', contact: 'Sara Khalid', phone: '+971-4-295-3000', email: 'logistics@maf.ae', warehouse: 'JAFZA South – Zone B', skuCount: 287, status: 'ACTIVE', sla: '98.7%', monthlyAED: 112000 },
  { id: 'C003', name: 'Noon Fulfillment Center', contact: 'Omar Hassan', phone: '+971-800-6666', email: 'whops@noon.com', warehouse: 'DIC Warehouse – Zone C', skuCount: 563, status: 'ACTIVE', sla: '99.8%', monthlyAED: 215000 },
  { id: 'C004', name: 'Carrefour UAE (Hyperstar)', contact: 'Priya Menon', phone: '+971-4-702-0505', email: 'supply@carrefouruae.com', warehouse: 'JAFZA North – Zone D', skuCount: 89, status: 'ACTIVE', sla: '97.5%', monthlyAED: 38200 },
  { id: 'C005', name: 'Landmark Group WH', contact: 'Ravi Kumar', phone: '+971-4-940-4040', email: 'warehousing@landmark.ae', warehouse: 'DIP Warehouse – Zone E', skuCount: 211, status: 'INACTIVE', sla: '95.1%', monthlyAED: 0 },
  { id: 'C006', name: 'Chalhoub Group', contact: 'Layla Nasser', phone: '+971-4-362-6626', email: 'ops@chalhoub.com', warehouse: 'JAFZA South – Zone F', skuCount: 98, status: 'ACTIVE', sla: '99.5%', monthlyAED: 67800 },
];

const CLIENT_INVENTORY = [
  { id: 'INV001', client: 'Al Futtaim Logistics LLC', sku: 'AFL-SKU-0012', product: 'Industrial Cable Reel 50m', warehouse: 'DIC – Zone A', bin: 'A-12-03', qty: 320, reserved: 45, available: 275, uom: 'PCS', status: 'ACTIVE' },
  { id: 'INV002', client: 'Noon Fulfillment Center', sku: 'NOON-EL-4421', product: 'Smart Home Hub v2', warehouse: 'DIC – Zone C', bin: 'C-05-11', qty: 1200, reserved: 340, available: 860, uom: 'PCS', status: 'ACTIVE' },
  { id: 'INV003', client: 'Majid Al Futtaim Retail', sku: 'MAF-FASH-2210', product: "Men's Polo Shirt (L)", warehouse: 'JAFZA South – Zone B', bin: 'B-22-07', qty: 890, reserved: 120, available: 770, uom: 'PCS', status: 'ACTIVE' },
  { id: 'INV004', client: 'Carrefour UAE (Hyperstar)', sku: 'CRF-GROC-0091', product: 'Long Grain Rice 5kg', warehouse: 'JAFZA North – Zone D', bin: 'D-08-02', qty: 4500, reserved: 800, available: 3700, uom: 'BAG', status: 'ACTIVE' },
  { id: 'INV005', client: 'Noon Fulfillment Center', sku: 'NOON-AP-0033', product: 'Wireless Earbuds Pro', warehouse: 'DIC – Zone C', bin: 'C-01-04', qty: 680, reserved: 680, available: 0, uom: 'PCS', status: 'RESERVED' },
  { id: 'INV006', client: 'Chalhoub Group', sku: 'CHG-LUX-0017', product: 'Premium Perfume 100ml', warehouse: 'JAFZA South – Zone F', bin: 'F-03-09', qty: 250, reserved: 15, available: 235, uom: 'PCS', status: 'ACTIVE' },
];

const INITIAL_ORDERS = [
  { id: 'WO-26-10001', client: 'Noon Fulfillment Center', type: 'B2C', sku: 'NOON-EL-4421', product: 'Smart Home Hub v2', qty: 45, status: 'PROCESSING', carrier: 'Aramex', created: '21 Sep 2026' },
  { id: 'WO-26-10002', client: 'Majid Al Futtaim Retail', type: 'B2B', sku: 'MAF-FASH-2210', product: "Men's Polo Shirt (L)", qty: 200, status: 'SHIPPED', carrier: 'DHL Express', created: '20 Sep 2026' },
  { id: 'WO-26-10003', client: 'Al Futtaim Logistics LLC', type: 'B2B', sku: 'AFL-SKU-0012', product: 'Industrial Cable Reel', qty: 80, status: 'CONFIRMED', carrier: 'FedEx', created: '19 Sep 2026' },
  { id: 'WO-26-10004', client: 'Carrefour UAE (Hyperstar)', type: 'B2B', sku: 'CRF-GROC-0091', product: 'Long Grain Rice 5kg', qty: 1200, status: 'DELIVERED', carrier: 'Own Fleet', created: '18 Sep 2026' },
  { id: 'WO-26-10005', client: 'Chalhoub Group', type: 'B2C', sku: 'CHG-LUX-0017', product: 'Premium Perfume 100ml', qty: 8, status: 'PENDING', carrier: 'Aramex', created: '21 Sep 2026' },
];

const INITIAL_STORAGE = [
  { id: 'SB-2026-09-001', client: 'Noon Fulfillment Center', period: 'Sep 2026', pallets: 48, sqft: 3200, subtotal: 59200, vatAED: 2960, totalAED: 62160, status: 'PENDING' },
  { id: 'SB-2026-09-002', client: 'Majid Al Futtaim Retail', period: 'Sep 2026', pallets: 22, sqft: 1450, subtotal: 26825, vatAED: 1341, totalAED: 28166, status: 'DRAFT' },
  { id: 'SB-2026-09-003', client: 'Al Futtaim Logistics LLC', period: 'Sep 2026', pallets: 14, sqft: 920, subtotal: 17020, vatAED: 851, totalAED: 17871, status: 'APPROVED' },
  { id: 'SB-2026-08-001', client: 'Noon Fulfillment Center', period: 'Aug 2026', pallets: 51, sqft: 3400, subtotal: 62900, vatAED: 3145, totalAED: 66045, status: 'PAID' },
  { id: 'SB-2026-09-004', client: 'Carrefour UAE (Hyperstar)', period: 'Sep 2026', pallets: 11, sqft: 740, subtotal: 13690, vatAED: 685, totalAED: 14375, status: 'PENDING' },
];

const INITIAL_HANDLING = [
  { id: 'HC-2026-09-001', client: 'Noon Fulfillment Center', period: 'Sep 2026', inboundUnits: 4200, pickPackUnits: 5800, dispatchOrders: 320, totalAED: 32200, vat: 1610, grandTotal: 33810, status: 'PENDING' },
  { id: 'HC-2026-09-002', client: 'Majid Al Futtaim Retail', period: 'Sep 2026', inboundUnits: 1800, pickPackUnits: 2200, dispatchOrders: 180, totalAED: 13800, vat: 690, grandTotal: 14490, status: 'DRAFT' },
  { id: 'HC-2026-09-003', client: 'Al Futtaim Logistics LLC', period: 'Sep 2026', inboundUnits: 960, pickPackUnits: 1100, dispatchOrders: 95, totalAED: 7120, vat: 356, grandTotal: 7476, status: 'APPROVED' },
  { id: 'HC-2026-08-001', client: 'Noon Fulfillment Center', period: 'Aug 2026', inboundUnits: 5100, pickPackUnits: 6200, dispatchOrders: 380, totalAED: 36400, vat: 1820, grandTotal: 38220, status: 'PAID' },
];

const INITIAL_STATEMENTS = [
  { id: 'CS-2026-09-001', client: 'Noon Fulfillment Center', period: 'Sep 2026', orders: 320, units: 10000, storageFee: 62160, handlingFee: 33810, otherCharges: 1200, totalAED: 97170, status: 'PENDING' },
  { id: 'CS-2026-09-002', client: 'Majid Al Futtaim Retail', period: 'Sep 2026', orders: 180, units: 4000, storageFee: 28166, handlingFee: 14490, otherCharges: 500, totalAED: 43156, status: 'DRAFT' },
  { id: 'CS-2026-09-003', client: 'Al Futtaim Logistics LLC', period: 'Sep 2026', orders: 95, units: 2060, storageFee: 17871, handlingFee: 7476, otherCharges: 0, totalAED: 25347, status: 'APPROVED' },
  { id: 'CS-2026-08-001', client: 'Noon Fulfillment Center', period: 'Aug 2026', orders: 380, units: 11300, storageFee: 66045, handlingFee: 38220, otherCharges: 800, totalAED: 105065, status: 'PAID' },
  { id: 'CS-2026-08-002', client: 'Chalhoub Group', period: 'Aug 2026', orders: 62, units: 520, storageFee: 10101, handlingFee: 4200, otherCharges: 0, totalAED: 14301, status: 'PAID' },
];

function fmt(n: number) { return `AED ${n.toLocaleString('en-AE')}`; }
function nextId(prefix: string, list: { id: string }[]) {
  const nums = list.map(i => parseInt(i.id.replace(/\D/g, '').slice(-3))).filter(Boolean);
  const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
  return `${prefix}-2026-09-${next}`;
}

export function ClientAccountsPage() {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof INITIAL_CLIENTS[0] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', warehouse: '' });

  const filtered = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search)), [search, clients]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    const newClient = {
      id: `C${String(clients.length + 1).padStart(3, '0')}`,
      name: form.name, contact: form.contact, phone: form.phone, email: form.email,
      warehouse: form.warehouse || 'DIC Warehouse – Zone G',
      skuCount: 0, status: 'ACTIVE', sla: '—', monthlyAED: 0,
    };
    setClients(prev => [newClient, ...prev]);
    setShowAdd(false);
    setForm({ name: '', contact: '', phone: '', email: '', warehouse: '' });
    toast.success(`Client '${form.name}' added successfully`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="3PL Client Accounts" description="Manage all warehouse customers, their mapped locations, SLA targets and monthly charges." action={{ label: 'Add Client', onClick: () => setShowAdd(true), icon: Plus }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Clients" value={clients.length} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Active Clients" value={clients.filter(c => c.status === 'ACTIVE').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Total SKUs Managed" value={clients.reduce((s,c) => s+c.skuCount, 0).toLocaleString()} icon={Boxes} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Sep 2026 Revenue" value={fmt(clients.reduce((s,c) => s+c.monthlyAED, 0))} icon={DollarSign} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>
      <div className="mb-4"><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client name or ID…" className="h-8 w-64 text-sm" /></div>
      <DataTable data={filtered} keyField="id" onRowClick={setSelected} columns={[
        { key: 'id', header: 'Client ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'name', header: 'Client Name', render: r => <span className="font-medium">{r.name}</span> },
        { key: 'contact', header: 'Contact' },
        { key: 'warehouse', header: 'Primary Warehouse', render: r => <span className="flex items-center gap-1 text-xs"><MapPin className="h-3 w-3 text-gray-400" />{r.warehouse}</span> },
        { key: 'skuCount', header: 'SKUs', render: r => <span className="font-medium">{r.skuCount}</span> },
        { key: 'sla', header: 'SLA', render: r => <span className="font-medium text-green-600">{r.sla}</span> },
        { key: 'monthlyAED', header: 'Monthly Charge', render: r => <span className="font-medium">{r.monthlyAED > 0 ? fmt(r.monthlyAED) : '—'}</span> },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
        { key: 'actions', header: '', render: r => <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(r); }}><Eye className="h-4 w-4" /></Button> },
      ]} />
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Client ID</p><p className="font-mono font-semibold">{selected.id}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={selected.status} /></div>
              <div><p className="text-xs text-gray-500">Contact</p><p>{selected.contact}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p>{selected.phone}</p></div>
              <div><p className="text-xs text-gray-500">Email</p><p>{selected.email}</p></div>
              <div><p className="text-xs text-gray-500">SLA</p><p className="font-semibold text-green-600">{selected.sla}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Warehouse</p><p>{selected.warehouse}</p></div>
              <div><p className="text-xs text-gray-500">SKUs</p><p className="font-semibold">{selected.skuCount}</p></div>
              <div><p className="text-xs text-gray-500">Monthly Charge</p><p className="font-semibold text-amber-700">{fmt(selected.monthlyAED)}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add 3PL Client</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div><Label className="text-xs">Company Name *</Label><Input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Emirates Logistics LLC" className="mt-1" /></div>
            <div><Label className="text-xs">Contact Person</Label><Input value={form.contact} onChange={e => setForm(p => ({...p, contact: e.target.value}))} placeholder="e.g. Ahmed Al Mansouri" className="mt-1" /></div>
            <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+971-4-XXX-XXXX" className="mt-1" /></div>
            <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="ops@company.ae" className="mt-1" /></div>
            <div><Label className="text-xs">Assigned Warehouse</Label><Input value={form.warehouse} onChange={e => setForm(p => ({...p, warehouse: e.target.value}))} placeholder="e.g. DIC Warehouse – Zone G" className="mt-1" /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Add Client</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ClientInventoryPage() {
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const clientNames = useMemo(() => ['ALL', ...Array.from(new Set(CLIENT_INVENTORY.map(i => i.client)))], []);
  const filtered = useMemo(() => CLIENT_INVENTORY.filter(i =>
    (clientFilter === 'ALL' || i.client === clientFilter) &&
    (i.product.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()))
  ), [search, clientFilter]);
  return (
    <div className="space-y-5">
      <PageHeader title="Client Inventory" description="Segregated stock view per 3PL client — ensuring no cross-client inventory mixing." action={{ label: 'Stock Transfer', onClick: () => toast('Stock transfer request submitted'), icon: Package }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total SKU Lines" value={CLIENT_INVENTORY.length} icon={Boxes} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Total Units" value={CLIENT_INVENTORY.reduce((s, i) => s + i.qty, 0).toLocaleString()} icon={Package} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Reserved Units" value={CLIENT_INVENTORY.reduce((s, i) => s + i.reserved, 0).toLocaleString()} icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Available Units" value={CLIENT_INVENTORY.reduce((s, i) => s + i.available, 0).toLocaleString()} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU or product…" className="h-8 w-64 text-sm" />
        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="h-8 rounded-md border border-[#e5e2dc] px-2 text-sm">
          {clientNames.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Clients' : c}</option>)}
        </select>
      </div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'client', header: 'Client', render: r => <Badge variant="outline" className="text-xs">{r.client.split(' ').slice(0, 2).join(' ')}</Badge> },
        { key: 'sku', header: 'SKU', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.sku}</span> },
        { key: 'product', header: 'Product', render: r => <span className="font-medium">{r.product}</span> },
        { key: 'bin', header: 'Location', render: r => <span className="text-xs">{r.warehouse} · <span className="font-mono">{r.bin}</span></span> },
        { key: 'qty', header: 'Total Qty', render: r => <span className="font-medium">{r.qty.toLocaleString()} {r.uom}</span> },
        { key: 'reserved', header: 'Reserved', render: r => <span className="text-amber-700">{r.reserved.toLocaleString()}</span> },
        { key: 'available', header: 'Available', render: r => <span className={`font-semibold ${r.available === 0 ? 'text-red-600' : 'text-green-700'}`}>{r.available.toLocaleString()}</span> },
        { key: 'status', header: 'Status', render: r => { const m: Record<string,string> = { ACTIVE: 'ACTIVE', RESERVED: 'SUBMITTED', LOW_STOCK: 'PENDING' }; return <StatusBadge status={m[r.status] || r.status} />; } },
      ]} />
    </div>
  );
}

export function ClientOrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client: 'Noon Fulfillment Center', type: 'B2B', sku: '', product: '', qty: '', carrier: 'Aramex' });

  const clientNames = useMemo(() => ['ALL', ...Array.from(new Set(orders.map(o => o.client)))], [orders]);
  const filtered = useMemo(() => orders.filter(o =>
    (clientFilter === 'ALL' || o.client === clientFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase()))
  ), [search, clientFilter, orders]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product || !form.qty) return;
    const id = `WO-26-${String(10000 + orders.length + 6).padStart(5, '0')}`;
    const newOrder = {
      id, client: form.client, type: form.type, sku: form.sku || 'MISC-SKU-NEW',
      product: form.product, qty: parseInt(form.qty) || 0,
      status: 'PENDING', carrier: form.carrier,
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setOrders(prev => [newOrder, ...prev]);
    setShowAdd(false);
    setForm({ client: 'Noon Fulfillment Center', type: 'B2B', sku: '', product: '', qty: '', carrier: 'Aramex' });
    toast.success(`Order ${id} created successfully`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Client Order Management" description="Process and track warehouse orders separately for each 3PL client." action={{ label: 'New Order', onClick: () => setShowAdd(true), icon: Plus }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Orders" value={orders.length} icon={ShoppingCart} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Processing" value={orders.filter(o => o.status === 'PROCESSING').length} icon={Package} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Shipped" value={orders.filter(o => o.status === 'SHIPPED').length} icon={TrendingUp} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Delivered" value={orders.filter(o => o.status === 'DELIVERED').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID or product…" className="h-8 w-64 text-sm" />
        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="h-8 rounded-md border border-[#e5e2dc] px-2 text-sm">
          {clientNames.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Clients' : c}</option>)}
        </select>
      </div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'id', header: 'Order ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'client', header: 'Client', render: r => <span className="font-medium text-sm">{r.client.split(' ').slice(0,2).join(' ')}</span> },
        { key: 'type', header: 'Type', render: r => <Badge variant="outline" className={`text-xs ${r.type === 'B2B' ? 'border-blue-300 text-blue-700' : 'border-purple-300 text-purple-700'}`}>{r.type}</Badge> },
        { key: 'sku', header: 'SKU', render: r => <span className="font-mono text-xs">{r.sku}</span> },
        { key: 'product', header: 'Product' },
        { key: 'qty', header: 'Qty', render: r => <span className="font-medium">{r.qty.toLocaleString()}</span> },
        { key: 'carrier', header: 'Carrier', render: r => <span className="text-xs text-gray-600">{r.carrier}</span> },
        { key: 'created', header: 'Date' },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
      ]} />
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Warehouse Order</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div><Label className="text-xs">Client *</Label>
              <select value={form.client} onChange={e => setForm(p => ({...p, client: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                {INITIAL_CLIENTS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Type</Label>
                <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  <option value="B2B">B2B</option><option value="B2C">B2C</option>
                </select></div>
              <div><Label className="text-xs">Carrier</Label>
                <select value={form.carrier} onChange={e => setForm(p => ({...p, carrier: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  {['Aramex','DHL Express','FedEx','Own Fleet','SMSA Express'].map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
            </div>
            <div><Label className="text-xs">SKU</Label><Input value={form.sku} onChange={e => setForm(p => ({...p, sku: e.target.value}))} placeholder="e.g. NOON-EL-4421" className="mt-1" /></div>
            <div><Label className="text-xs">Product *</Label><Input value={form.product} onChange={e => setForm(p => ({...p, product: e.target.value}))} placeholder="e.g. Smart Home Hub v2" className="mt-1" /></div>
            <div><Label className="text-xs">Quantity *</Label><Input type="number" value={form.qty} onChange={e => setForm(p => ({...p, qty: e.target.value}))} placeholder="e.g. 50" className="mt-1" /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Create Order</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StorageBillingPage() {
  const [bills, setBills] = useState(INITIAL_STORAGE);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client: 'Noon Fulfillment Center', pallets: '', sqft: '' });

  const filtered = useMemo(() => bills.filter(b => b.client.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search)), [search, bills]);
  const pending = bills.filter(b => b.status === 'PENDING' || b.status === 'DRAFT').reduce((s, b) => s + b.totalAED, 0);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sqft) return;
    const sqft = parseInt(form.sqft);
    const subtotal = Math.round(sqft * 18.5);
    const vatAED = Math.round(subtotal * 0.05);
    const totalAED = subtotal + vatAED;
    const id = nextId('SB', bills);
    setBills(prev => [{ id, client: form.client, period: 'Sep 2026', pallets: parseInt(form.pallets||'0'), sqft, subtotal, vatAED, totalAED, status: 'DRAFT' }, ...prev]);
    setShowAdd(false);
    setForm({ client: 'Noon Fulfillment Center', pallets: '', sqft: '' });
    toast.success(`Invoice ${id} generated — ${fmt(totalAED)}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Storage Billing" description="Monthly warehouse storage charges calculated per 3PL client based on area and pallet count." action={{ label: 'Generate Invoice', onClick: () => setShowAdd(true), icon: Receipt }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Bills This Month" value={bills.filter(b => b.period === 'Sep 2026').length} icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Pending Approval" value={bills.filter(b => b.status === 'PENDING').length} icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Pending Collection" value={fmt(pending)} icon={DollarSign} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Rate / Sq.ft" value="AED 18.50" icon={Building2} iconColor="text-gray-600" iconBg="bg-gray-50" />
      </div>
      <div className="mb-4"><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client or bill ID…" className="h-8 w-64 text-sm" /></div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'id', header: 'Bill ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'client', header: 'Client' },
        { key: 'period', header: 'Period' },
        { key: 'pallets', header: 'Pallets', render: r => <span className="font-medium">{r.pallets}</span> },
        { key: 'sqft', header: 'Area (sq.ft)', render: r => r.sqft.toLocaleString() },
        { key: 'subtotal', header: 'Subtotal', render: r => fmt(r.subtotal) },
        { key: 'vatAED', header: 'VAT (5%)', render: r => fmt(r.vatAED) },
        { key: 'totalAED', header: 'Total (AED)', render: r => <span className="font-semibold">{fmt(r.totalAED)}</span> },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
      ]} />
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Generate Storage Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-3">
            <div><Label className="text-xs">Client *</Label>
              <select value={form.client} onChange={e => setForm(p => ({...p, client: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                {INITIAL_CLIENTS.filter(c => c.status === 'ACTIVE').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">No. of Pallets</Label><Input type="number" value={form.pallets} onChange={e => setForm(p => ({...p, pallets: e.target.value}))} placeholder="e.g. 20" className="mt-1" /></div>
              <div><Label className="text-xs">Area (sq.ft) *</Label><Input type="number" value={form.sqft} onChange={e => setForm(p => ({...p, sqft: e.target.value}))} placeholder="e.g. 1200" className="mt-1" /></div>
            </div>
            {form.sqft && <div className="rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3 text-xs">
              <div className="flex justify-between"><span>Subtotal ({form.sqft} sq.ft × AED 18.50)</span><span className="font-semibold">{fmt(Math.round(parseInt(form.sqft||'0') * 18.5))}</span></div>
              <div className="flex justify-between text-gray-500 mt-1"><span>VAT 5%</span><span>{fmt(Math.round(parseInt(form.sqft||'0') * 18.5 * 0.05))}</span></div>
              <div className="flex justify-between border-t border-[#e5e2dc] pt-1 font-semibold mt-1"><span>Total</span><span>{fmt(Math.round(parseInt(form.sqft||'0') * 18.5 * 1.05))}</span></div>
            </div>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Generate Invoice</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function HandlingChargesPage() {
  const [bills, setBills] = useState(INITIAL_HANDLING);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client: 'Noon Fulfillment Center', inbound: '', pickPack: '', dispatch: '' });

  const filtered = useMemo(() => bills.filter(h => h.client.toLowerCase().includes(search.toLowerCase()) || h.id.includes(search)), [search, bills]);
  const pending = bills.filter(h => h.status === 'PENDING' || h.status === 'DRAFT').reduce((s, h) => s + h.grandTotal, 0);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.inbound) return;
    const ib = parseInt(form.inbound||'0'); const pp = parseInt(form.pickPack||'0'); const dp = parseInt(form.dispatch||'0');
    const totalAED = ib * 2 + pp * 3 + dp * 20;
    const vat = Math.round(totalAED * 0.05);
    const grandTotal = totalAED + vat;
    const id = nextId('HC', bills);
    setBills(prev => [{ id, client: form.client, period: 'Sep 2026', inboundUnits: ib, pickPackUnits: pp, dispatchOrders: dp, totalAED, vat, grandTotal, status: 'DRAFT' }, ...prev]);
    setShowAdd(false);
    setForm({ client: 'Noon Fulfillment Center', inbound: '', pickPack: '', dispatch: '' });
    toast.success(`Invoice ${id} generated — ${fmt(grandTotal)}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Handling Charges" description="Receiving, pick & pack, and dispatch charges billed to 3PL clients monthly." action={{ label: 'Generate Invoice', onClick: () => setShowAdd(true), icon: Receipt }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Sep 2026 Bills" value={bills.filter(h => h.period === 'Sep 2026').length} icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Units Inbound" value={bills.filter(h => h.period === 'Sep 2026').reduce((s,h) => s+h.inboundUnits,0).toLocaleString()} icon={Package} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Pending Collection" value={fmt(pending)} icon={DollarSign} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Dispatch Orders" value={bills.filter(h => h.period === 'Sep 2026').reduce((s,h) => s+h.dispatchOrders,0).toLocaleString()} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>
      <div className="mb-4"><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client or bill ID…" className="h-8 w-64 text-sm" /></div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'id', header: 'Bill ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'client', header: 'Client' }, { key: 'period', header: 'Period' },
        { key: 'inboundUnits', header: 'Inbound Units', render: r => r.inboundUnits.toLocaleString() },
        { key: 'pickPackUnits', header: 'Pick & Pack', render: r => r.pickPackUnits.toLocaleString() },
        { key: 'dispatchOrders', header: 'Dispatch Orders', render: r => r.dispatchOrders },
        { key: 'totalAED', header: 'Subtotal', render: r => fmt(r.totalAED) },
        { key: 'vat', header: 'VAT (5%)', render: r => fmt(r.vat) },
        { key: 'grandTotal', header: 'Total (AED)', render: r => <span className="font-semibold">{fmt(r.grandTotal)}</span> },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
      ]} />
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Generate Handling Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-3">
            <div><Label className="text-xs">Client *</Label>
              <select value={form.client} onChange={e => setForm(p => ({...p, client: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                {INITIAL_CLIENTS.filter(c => c.status === 'ACTIVE').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">Inbound Units *</Label><Input type="number" value={form.inbound} onChange={e => setForm(p => ({...p, inbound: e.target.value}))} placeholder="0" className="mt-1" /></div>
              <div><Label className="text-xs">Pick & Pack</Label><Input type="number" value={form.pickPack} onChange={e => setForm(p => ({...p, pickPack: e.target.value}))} placeholder="0" className="mt-1" /></div>
              <div><Label className="text-xs">Dispatch Orders</Label><Input type="number" value={form.dispatch} onChange={e => setForm(p => ({...p, dispatch: e.target.value}))} placeholder="0" className="mt-1" /></div>
            </div>
            <p className="text-xs text-gray-500">Rates: Inbound AED 2/unit · Pick&Pack AED 3/unit · Dispatch AED 20/order</p>
            {form.inbound && <div className="rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3 text-xs flex justify-between font-semibold">
              <span>Estimated Total (incl. VAT 5%)</span>
              <span>{fmt(Math.round((parseInt(form.inbound||'0')*2 + parseInt(form.pickPack||'0')*3 + parseInt(form.dispatch||'0')*20) * 1.05))}</span>
            </div>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Generate Invoice</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ClientStatementsPage() {
  const [statements, setStatements] = useState(INITIAL_STATEMENTS);
  const [selected, setSelected] = useState<typeof INITIAL_STATEMENTS[0] | null>(null);
  const sepTotal = statements.filter(s => s.period === 'Sep 2026').reduce((s, r) => s + r.totalAED, 0);
  const pending = statements.filter(s => s.status === 'PENDING' || s.status === 'DRAFT').reduce((s, r) => s + r.totalAED, 0);

  function handleExportPDF() { toast.success('Statement PDF downloaded successfully'); }
  function handleSendToClient(stmt: typeof INITIAL_STATEMENTS[0]) {
    setStatements(prev => prev.map(s => s.id === stmt.id ? {...s, status: 'SUBMITTED'} : s));
    setSelected(null);
    toast.success(`Statement sent to ${stmt.client} successfully`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Client Statements" description="Monthly consolidated billing summaries — storage, handling and other charges per client." action={{ label: 'Export PDF', onClick: handleExportPDF, icon: FileText }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Sep 2026 Statements" value={statements.filter(s => s.period === 'Sep 2026').length} icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Pending Collection" value={fmt(pending)} icon={DollarSign} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Total Orders (Sep)" value={statements.filter(s => s.period === 'Sep 2026').reduce((s,r) => s+r.orders, 0)} icon={ShoppingCart} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Sep 2026 Revenue" value={fmt(sepTotal)} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>
      <DataTable data={statements} keyField="id" onRowClick={setSelected} columns={[
        { key: 'id', header: 'Statement ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'client', header: 'Client', render: r => <span className="font-medium">{r.client}</span> },
        { key: 'period', header: 'Period' }, { key: 'orders', header: 'Orders' },
        { key: 'units', header: 'Units', render: r => r.units.toLocaleString() },
        { key: 'storageFee', header: 'Storage Fee', render: r => fmt(r.storageFee) },
        { key: 'handlingFee', header: 'Handling Fee', render: r => fmt(r.handlingFee) },
        { key: 'totalAED', header: 'Total (AED)', render: r => <span className="font-semibold">{fmt(r.totalAED)}</span> },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
        { key: 'actions', header: '', render: r => <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(r); }}><Eye className="h-4 w-4" /></Button> },
      ]} />
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Statement — {selected?.client}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3 text-xs">
                <p className="mb-2 font-medium text-gray-700">Period: {selected.period}</p>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Storage Fee</span><span>{fmt(selected.storageFee)}</span></div>
                  <div className="flex justify-between"><span>Handling Fee</span><span>{fmt(selected.handlingFee)}</span></div>
                  <div className="flex justify-between"><span>Other Charges</span><span>{fmt(selected.otherCharges)}</span></div>
                  <div className="flex justify-between border-t border-[#e5e2dc] pt-1 font-semibold"><span>Total</span><span>{fmt(selected.totalAED)}</span></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><p className="text-gray-500">Orders</p><p className="font-semibold">{selected.orders}</p></div>
                <div><p className="text-gray-500">Units</p><p className="font-semibold">{selected.units.toLocaleString()}</p></div>
                <div><p className="text-gray-500">Status</p><StatusBadge status={selected.status} /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" onClick={() => handleSendToClient(selected)}>Send to Client</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={handleExportPDF}>Export PDF</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
