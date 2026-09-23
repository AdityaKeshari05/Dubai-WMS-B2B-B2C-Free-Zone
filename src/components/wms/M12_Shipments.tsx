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
  Truck, Plus, Eye, CheckCircle, AlertCircle, Package, FileText, MapPin, Clock,
} from 'lucide-react';

const INITIAL_SHIPMENTS = [
  { id: 'SHP-26-0120', client: 'Noon Fulfillment Center', order: 'WO-26-10001', carrier: 'Aramex', awb: 'AWB-1234567890', consignee: 'Ahmed Malik, Dubai Marina', weight: '2.3 kg', pieces: 1, dispatchDate: '21 Sep 2026', eta: '22 Sep 2026', status: 'DELIVERED', pod: true },
  { id: 'SHP-26-0119', client: 'Majid Al Futtaim Retail', order: 'WO-26-10002', carrier: 'DHL Express', awb: 'AWB-9876543210', consignee: 'Landmark Store, Deira', weight: '84.5 kg', pieces: 12, dispatchDate: '20 Sep 2026', eta: '21 Sep 2026', status: 'DELIVERED', pod: true },
  { id: 'SHP-26-0118', client: 'Al Futtaim Logistics LLC', order: 'WO-26-10003', carrier: 'FedEx', awb: 'AWB-5551234987', consignee: 'Site Office, JEBEL ALI', weight: '320.0 kg', pieces: 80, dispatchDate: '19 Sep 2026', eta: '21 Sep 2026', status: 'SHIPPED', pod: false },
  { id: 'SHP-26-0117', client: 'Noon Fulfillment Center', order: 'WO-26-10006', carrier: 'Aramex', awb: 'AWB-7778889990', consignee: 'Omar Farhan, Abu Dhabi', weight: '1.1 kg', pieces: 1, dispatchDate: '22 Sep 2026', eta: '23 Sep 2026', status: 'PROCESSING', pod: false },
  { id: 'SHP-26-0116', client: 'Chalhoub Group', order: 'WO-26-10005', carrier: 'Aramex', awb: 'AWB-3334445556', consignee: 'Sara Hassan, Sharjah', weight: '0.5 kg', pieces: 1, dispatchDate: '21 Sep 2026', eta: '22 Sep 2026', status: 'PARTIAL', pod: false },
  { id: 'SHP-26-0112', client: 'Noon Fulfillment Center', order: 'WO-26-09080', carrier: 'Aramex', awb: 'AWB-1112223334', consignee: 'Ahmed Malik, Dubai', weight: '2.3 kg', pieces: 1, dispatchDate: '18 Sep 2026', eta: '19 Sep 2026', status: 'CANCELLED', pod: false },
];

const CARRIERS = [
  { id: 'CAR-001', name: 'Aramex', type: 'Express Courier', coverage: 'UAE, GCC, International', accountNo: 'ARX-UAE-00412', contactPerson: 'Operations Team', phone: '+971-4-286-5000', email: 'ops.uae@aramex.com', defaultService: 'Priority Parcel', status: 'ACTIVE', shippingRules: 'Max 30kg per piece; COD enabled; same-day Dubai' },
  { id: 'CAR-002', name: 'DHL Express', type: 'Express Courier', coverage: 'UAE, International', accountNo: 'DHL-UAE-98721', contactPerson: 'Sarah Bitar', phone: '+971-4-330-8000', email: 'sarah.bitar@dhl.com', defaultService: 'Express Worldwide', status: 'ACTIVE', shippingRules: 'Max 70kg per shipment; customs clearance included' },
  { id: 'CAR-003', name: 'FedEx UAE', type: 'Freight & Express', coverage: 'UAE, GCC, International', accountNo: 'FDX-UAE-44512', contactPerson: 'Ahmed Salam', phone: '+971-4-222-9651', email: 'a.salam@fedex.com', defaultService: 'International Priority Freight', status: 'ACTIVE', shippingRules: 'Heavy freight preferred; palletized shipments' },
  { id: 'CAR-004', name: 'Own Fleet (Dubai)', type: 'Own Vehicle', coverage: 'Dubai Only', accountNo: 'OWN-FLEET-001', contactPerson: 'Mohammed Al Shami', phone: '+971-55-444-3322', email: 'fleet@client.ae', defaultService: 'Same-day Delivery', status: 'ACTIVE', shippingRules: 'Only for B2B bulk deliveries within Dubai; no COD' },
  { id: 'CAR-005', name: 'SMSA Express', type: 'Express Courier', coverage: 'UAE, KSA', accountNo: 'SMSA-UAE-77001', contactPerson: 'Khaled Nouri', phone: '+971-4-208-0700', email: 'khaled@smsa.com', defaultService: 'Next-day Delivery', status: 'INACTIVE', shippingRules: 'KSA primary coverage; UAE secondary' },
];

const TRACKING_EVENTS: Record<string, { time: string; event: string; location: string; status: 'done' | 'active' | 'pending' }[]> = {
  'SHP-26-0120': [
    { time: '21 Sep, 08:30', event: 'Shipment dispatched from DIC Warehouse', location: 'DIC – Zone C, Dubai', status: 'done' },
    { time: '21 Sep, 10:00', event: 'Picked up by Aramex', location: 'DIC Collection Point', status: 'done' },
    { time: '21 Sep, 14:20', event: 'In transit to delivery hub', location: 'Aramex Dubai Hub', status: 'done' },
    { time: '22 Sep, 09:45', event: 'Out for delivery', location: 'Dubai Marina Route', status: 'done' },
    { time: '22 Sep, 11:30', event: 'Delivered — POD obtained', location: 'Dubai Marina', status: 'done' },
  ],
  'SHP-26-0118': [
    { time: '19 Sep, 09:00', event: 'Shipment dispatched from DIC Warehouse', location: 'DIC – Zone A, Dubai', status: 'done' },
    { time: '19 Sep, 12:00', event: 'Picked up by FedEx', location: 'DIC Collection Point', status: 'done' },
    { time: '20 Sep, 08:00', event: 'In transit – freight consolidation', location: 'FedEx Jebel Ali Hub', status: 'done' },
    { time: '21 Sep, ETA', event: 'Out for delivery (Expected)', location: 'Jebel Ali Industrial Area', status: 'active' },
    { time: 'Pending', event: 'Delivery & POD', location: 'Site Office, JEBEL ALI', status: 'pending' },
  ],
};

const POD_RECORDS = [
  { id: 'POD-26-0041', shipmentId: 'SHP-26-0120', carrier: 'Aramex', awb: 'AWB-1234567890', consignee: 'Ahmed Malik', deliveredAt: '22 Sep 2026 11:30', receivedBy: 'Building Security', signature: 'Digital', status: 'CONFIRMED' },
  { id: 'POD-26-0040', shipmentId: 'SHP-26-0119', carrier: 'DHL Express', awb: 'AWB-9876543210', consignee: 'Landmark Store, Deira', deliveredAt: '21 Sep 2026 14:00', receivedBy: 'Receiving Manager', signature: 'Physical + Photo', status: 'CONFIRMED' },
  { id: 'POD-26-0039', shipmentId: 'SHP-26-0115', carrier: 'FedEx UAE', awb: 'AWB-2223334445', consignee: 'MAF Logistics, JAFZA', deliveredAt: '20 Sep 2026 10:15', receivedBy: 'Warehouse In-charge', signature: 'Digital', status: 'CONFIRMED' },
];

export function ShipmentsPage() {
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [search, setSearch] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [trackShipment, setTrackShipment] = useState<typeof INITIAL_SHIPMENTS[0] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client: 'Noon Fulfillment Center', order: '', carrier: 'Aramex', awb: '', consignee: '', weight: '', pieces: '' });

  const carrierNames = useMemo(() => ['ALL', ...Array.from(new Set(shipments.map(s => s.carrier)))], [shipments]);
  const filtered = useMemo(() => shipments.filter(s =>
    (carrierFilter === 'ALL' || s.carrier === carrierFilter) &&
    (s.id.toLowerCase().includes(search.toLowerCase()) || s.awb.toLowerCase().includes(search.toLowerCase()) || s.consignee.toLowerCase().includes(search.toLowerCase()))
  ), [search, carrierFilter, shipments]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consignee) return;
    const nextNum = parseInt(shipments[0]?.id?.split('-')[2] || '120') + 1;
    const id = `SHP-26-${String(nextNum).padStart(4, '0')}`;
    const awb = form.awb || `AWB-${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    const newShipment = {
      id, client: form.client, order: form.order || '—', carrier: form.carrier,
      awb, consignee: form.consignee, weight: form.weight ? `${form.weight} kg` : '—',
      pieces: parseInt(form.pieces||'1'),
      dispatchDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      eta: '—', status: 'PROCESSING', pod: false,
    };
    setShipments(prev => [newShipment, ...prev]);
    setShowAdd(false);
    setForm({ client: 'Noon Fulfillment Center', order: '', carrier: 'Aramex', awb: '', consignee: '', weight: '', pieces: '' });
    toast.success(`Shipment ${id} created — AWB: ${awb}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Shipments" description="All outbound shipments with real-time carrier tracking, AWB management and delivery status." action={{ label: 'Create Shipment', onClick: () => setShowAdd(true), icon: Plus }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Shipments" value={shipments.length} icon={Truck} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="In Transit" value={shipments.filter(s => s.status === 'SHIPPED' || s.status === 'PROCESSING').length} icon={Package} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Delivered" value={shipments.filter(s => s.status === 'DELIVERED').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Issues" value={shipments.filter(s => s.status === 'CANCELLED' || s.status === 'PARTIAL').length} icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shipment, AWB or consignee…" className="h-8 w-64 text-sm" />
        <select value={carrierFilter} onChange={e => setCarrierFilter(e.target.value)} className="h-8 rounded-md border border-[#e5e2dc] px-2 text-sm">
          {carrierNames.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Carriers' : c}</option>)}
        </select>
      </div>
      <DataTable data={filtered} keyField="id" columns={[
        { key: 'id', header: 'Shipment ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'awb', header: 'AWB / Tracking', render: r => <span className="font-mono text-xs">{r.awb}</span> },
        { key: 'client', header: 'Client', render: r => <span className="text-sm">{r.client.split(' ').slice(0,2).join(' ')}</span> },
        { key: 'consignee', header: 'Consignee', render: r => <span className="flex items-center gap-1 text-xs"><MapPin className="h-3 w-3 text-gray-400" />{r.consignee}</span> },
        { key: 'carrier', header: 'Carrier', render: r => <Badge variant="outline" className="text-xs">{r.carrier}</Badge> },
        { key: 'weight', header: 'Weight' },
        { key: 'dispatchDate', header: 'Dispatched' },
        { key: 'eta', header: 'ETA' },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
        { key: 'pod', header: 'POD', render: r => r.pod ? <span className="text-xs font-medium text-green-600">✓ Obtained</span> : <span className="text-xs text-gray-400">—</span> },
        { key: 'actions', header: '', render: r => <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setTrackShipment(r); }}><Eye className="h-4 w-4" /></Button> },
      ]} />

      <Dialog open={!!trackShipment} onOpenChange={() => setTrackShipment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tracking — {trackShipment?.id}</DialogTitle></DialogHeader>
          {trackShipment && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-gray-500">AWB</p><p className="font-mono font-semibold">{trackShipment.awb}</p></div>
                <div><p className="text-gray-500">Carrier</p><p>{trackShipment.carrier}</p></div>
                <div><p className="text-gray-500">Consignee</p><p>{trackShipment.consignee}</p></div>
                <div><p className="text-gray-500">Status</p><StatusBadge status={trackShipment.status} /></div>
              </div>
              <div className="space-y-2 pt-1">
                {(TRACKING_EVENTS[trackShipment.id] || [{ time: 'N/A', event: 'Shipment created — tracking not yet available', location: '—', status: 'active' as const }]).map((ev, i, arr) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full border-2 mt-0.5 ${ev.status === 'done' ? 'border-green-500 bg-green-500' : ev.status === 'active' ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'}`} />
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-0.5" />}
                    </div>
                    <div className="pb-3">
                      <p className={`text-xs font-medium ${ev.status === 'done' ? 'text-gray-800' : ev.status === 'active' ? 'text-blue-700' : 'text-gray-400'}`}>{ev.event}</p>
                      <p className="text-xs text-gray-400"><Clock className="inline h-3 w-3 mr-0.5" />{ev.time} · {ev.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Shipment</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div><Label className="text-xs">Client</Label><Input value={form.client} onChange={e => setForm(p => ({...p, client: e.target.value}))} placeholder="Client name" className="mt-1" /></div>
            <div><Label className="text-xs">Order Reference</Label><Input value={form.order} onChange={e => setForm(p => ({...p, order: e.target.value}))} placeholder="e.g. WO-26-10001" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Carrier</Label>
                <select value={form.carrier} onChange={e => setForm(p => ({...p, carrier: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  {['Aramex','DHL Express','FedEx','Own Fleet','SMSA Express'].map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><Label className="text-xs">AWB (optional)</Label><Input value={form.awb} onChange={e => setForm(p => ({...p, awb: e.target.value}))} placeholder="Auto-generated" className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Consignee (Name, Location) *</Label><Input value={form.consignee} onChange={e => setForm(p => ({...p, consignee: e.target.value}))} placeholder="e.g. Ahmed Malik, Dubai Marina" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Weight (kg)</Label><Input value={form.weight} onChange={e => setForm(p => ({...p, weight: e.target.value}))} placeholder="e.g. 2.5" className="mt-1" /></div>
              <div><Label className="text-xs">Pieces</Label><Input type="number" value={form.pieces} onChange={e => setForm(p => ({...p, pieces: e.target.value}))} placeholder="1" className="mt-1" /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Create Shipment</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CarrierManagementPage() {
  const [carriers, setCarriers] = useState(CARRIERS);
  const [selected, setSelected] = useState<typeof CARRIERS[0] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Express Courier', coverage: '', accountNo: '', contactPerson: '', phone: '', email: '', defaultService: '' });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    const newCarrier = {
      id: `CAR-${String(carriers.length + 1).padStart(3, '0')}`,
      name: form.name, type: form.type, coverage: form.coverage, accountNo: form.accountNo,
      contactPerson: form.contactPerson, phone: form.phone, email: form.email,
      defaultService: form.defaultService, status: 'ACTIVE', shippingRules: 'To be configured',
    };
    setCarriers(prev => [...prev, newCarrier]);
    setShowAdd(false);
    setForm({ name: '', type: 'Express Courier', coverage: '', accountNo: '', contactPerson: '', phone: '', email: '', defaultService: '' });
    toast.success(`Carrier '${form.name}' added successfully`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Carrier Management" description="Manage courier and transport providers, service agreements and shipping rules." action={{ label: 'Add Carrier', onClick: () => setShowAdd(true), icon: Plus }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Carriers" value={carriers.length} icon={Truck} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Active" value={carriers.filter(c => c.status === 'ACTIVE').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Express Couriers" value={carriers.filter(c => c.type === 'Express Courier').length} icon={Package} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Inactive" value={carriers.filter(c => c.status === 'INACTIVE').length} icon={AlertCircle} iconColor="text-gray-600" iconBg="bg-gray-50" />
      </div>
      <DataTable data={carriers} keyField="id" onRowClick={setSelected} columns={[
        { key: 'id', header: 'ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'name', header: 'Carrier Name', render: r => <span className="font-medium">{r.name}</span> },
        { key: 'type', header: 'Type', render: r => <Badge variant="outline" className="text-xs">{r.type}</Badge> },
        { key: 'coverage', header: 'Coverage', render: r => <span className="text-xs text-gray-600">{r.coverage}</span> },
        { key: 'accountNo', header: 'Account No', render: r => <span className="font-mono text-xs">{r.accountNo}</span> },
        { key: 'contactPerson', header: 'Contact' },
        { key: 'defaultService', header: 'Default Service', render: r => <span className="text-xs">{r.defaultService}</span> },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
        { key: 'actions', header: '', render: r => <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(r); }}><Eye className="h-4 w-4" /></Button> },
      ]} />
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-xs text-gray-500">Account No</p><p className="font-mono font-semibold">{selected.accountNo}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={selected.status} /></div>
                <div><p className="text-xs text-gray-500">Contact</p><p>{selected.contactPerson}</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p>{selected.phone}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Email</p><p>{selected.email}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Coverage</p><p>{selected.coverage}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Shipping Rules</p><p className="rounded border border-[#e5e2dc] bg-[#fbfaf8] p-2 text-xs">{selected.shippingRules}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Carrier</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div><Label className="text-xs">Carrier Name *</Label><Input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Fetchr UAE" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Type</Label>
                <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="mt-1 h-9 w-full rounded-md border border-[#e5e2dc] px-2 text-sm">
                  {['Express Courier','Freight & Express','Own Vehicle','Last-mile Delivery'].map(t => <option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><Label className="text-xs">Account No</Label><Input value={form.accountNo} onChange={e => setForm(p => ({...p, accountNo: e.target.value}))} placeholder="e.g. FTR-UAE-001" className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Coverage Area</Label><Input value={form.coverage} onChange={e => setForm(p => ({...p, coverage: e.target.value}))} placeholder="e.g. UAE, GCC" className="mt-1" /></div>
            <div><Label className="text-xs">Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm(p => ({...p, contactPerson: e.target.value}))} placeholder="e.g. Ahmed Ali" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+971-X-XXX-XXXX" className="mt-1" /></div>
              <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="ops@carrier.ae" className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Default Service</Label><Input value={form.defaultService} onChange={e => setForm(p => ({...p, defaultService: e.target.value}))} placeholder="e.g. Next-day Delivery" className="mt-1" /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">Add Carrier</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DeliveryTrackingPage() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => INITIAL_SHIPMENTS.filter(s =>
    s.awb.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  ), [search]);

  return (
    <div className="space-y-5">
      <PageHeader title="Delivery Tracking" description="Track all shipments in real-time from dispatch to delivery confirmation." action={{ label: 'Refresh Tracking', onClick: () => toast.success('Tracking data refreshed from carrier APIs'), icon: Package }} />
      <div className="mb-4"><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Shipment ID or AWB…" className="h-8 w-72 text-sm" /></div>
      <div className="space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="rounded-md border border-[#e5e2dc] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#1674c4]">{s.id}</span>
                <Badge variant="outline" className="text-xs">{s.carrier}</Badge>
                <StatusBadge status={s.status} />
              </div>
              <span className="font-mono text-xs text-gray-500">{s.awb}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
              <span><span className="text-gray-400">Consignee:</span> {s.consignee}</span>
              <span><span className="text-gray-400">Dispatched:</span> {s.dispatchDate}</span>
              <span><span className="text-gray-400">ETA:</span> {s.eta}</span>
              <span><span className="text-gray-400">POD:</span> {s.pod ? <span className="font-medium text-green-600">Obtained</span> : <span className="text-gray-400">Pending</span>}</span>
            </div>
            {TRACKING_EVENTS[s.id] && (
              <div className="mt-3 flex gap-1">
                {TRACKING_EVENTS[s.id].map((ev, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${ev.status === 'done' ? 'bg-green-500' : ev.status === 'active' ? 'bg-blue-400' : 'bg-gray-200'}`} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProofOfDeliveryPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Proof of Delivery" description="View and manage delivery confirmations, signatures and photographic evidence." action={{ label: 'Upload POD', onClick: () => toast.success('POD upload dialog opened — attach signature file'), icon: FileText }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatsCard title="Total POD Records" value={POD_RECORDS.length} icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Confirmed" value={POD_RECORDS.filter(p => p.status === 'CONFIRMED').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Disputed" value={0} icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>
      <DataTable data={POD_RECORDS} keyField="id" columns={[
        { key: 'id', header: 'POD ID', render: r => <span className="font-mono text-xs font-semibold text-[#1674c4]">{r.id}</span> },
        { key: 'shipmentId', header: 'Shipment', render: r => <span className="font-mono text-xs">{r.shipmentId}</span> },
        { key: 'carrier', header: 'Carrier', render: r => <Badge variant="outline" className="text-xs">{r.carrier}</Badge> },
        { key: 'awb', header: 'AWB', render: r => <span className="font-mono text-xs">{r.awb}</span> },
        { key: 'consignee', header: 'Consignee' },
        { key: 'deliveredAt', header: 'Delivered At' },
        { key: 'receivedBy', header: 'Received By' },
        { key: 'signature', header: 'Signature Type', render: r => <Badge variant="outline" className="text-xs">{r.signature}</Badge> },
        { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
        { key: 'actions', header: '', render: () => <Button variant="ghost" size="sm" onClick={() => toast.success('POD document downloaded')}><FileText className="h-4 w-4" /></Button> },
      ]} />
    </div>
  );
}
