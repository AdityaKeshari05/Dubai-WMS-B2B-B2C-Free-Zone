'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock3,
  Plug,
  RefreshCw,
  Search,
  Settings2,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  Card,
  Modal,
  PageHeader,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  Select,
  StatCard,
  Table,
  Toast,
} from '@/components/wms/WmsUi';

type Integration = {
  id: string;
  name: string;
  category: 'E-Commerce' | 'Marketplace' | 'ERP' | 'Accounting' | 'Courier';
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSync: string;
  sync: string;
};

const initial: Integration[] = [
  { id: 'INT-001', name: 'Shopify Store', category: 'E-Commerce', status: 'Connected', lastSync: '2 mins ago', sync: 'Orders + Inventory' },
  { id: 'INT-002', name: 'Amazon Marketplace', category: 'Marketplace', status: 'Connected', lastSync: '6 mins ago', sync: 'Orders' },
  { id: 'INT-003', name: 'SAP Business One', category: 'ERP', status: 'Connected', lastSync: '12 mins ago', sync: 'Inventory + PO + SO' },
  { id: 'INT-004', name: 'QuickBooks Online', category: 'Accounting', status: 'Disconnected', lastSync: 'Never', sync: 'Commercial Data' },
  { id: 'INT-005', name: 'DHL Express', category: 'Courier', status: 'Error', lastSync: '18 mins ago', sync: 'Shipment + Tracking' },
];

export default function IntegrationsOverviewPage() {
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState<Integration | null>(null);
  const [toast, setToast] = useState('');

  const rows = useMemo(() => items.filter((r) => {
    const q = search.toLowerCase();
    return (!q || `${r.name} ${r.category} ${r.sync}`.toLowerCase().includes(q))
      && (category === 'All' || r.category === category)
      && (status === 'All' || r.status === status);
  }), [items, search, category, status]);

  const syncNow = (id: string) => {
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, lastSync: 'Just now', status: 'Connected' } : x));
    setToast('Integration synced successfully (demo)');
  };

  const toggleConnection = (id: string) => {
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, status: x.status === 'Connected' ? 'Disconnected' : 'Connected', lastSync: x.status === 'Connected' ? x.lastSync : 'Just now' } : x));
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Integrations" description="Monitor and configure external systems connected to the WMS." icon={Plug}
        action={<PrimaryButton onClick={() => setToast('All connected integrations synced (demo)')}><RefreshCw className="h-4 w-4" /> Sync All</PrimaryButton>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Connected" value={String(items.filter(x => x.status === 'Connected').length)} hint="Healthy integrations" icon={CheckCircle2} />
        <StatCard label="Disconnected" value={String(items.filter(x => x.status === 'Disconnected').length)} hint="Needs configuration" icon={Clock3} />
        <StatCard label="Errors" value={String(items.filter(x => x.status === 'Error').length)} hint="Needs attention" icon={XCircle} />
        <StatCard label="Sync Events Today" value="1,482" hint="Across all integrations" icon={Activity} />
      </div>

      <Card title="Integration registry" description="Search, filter and manage configured integrations"
        action={<div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <div className="w-full sm:w-72"><SearchInput value={search} onChange={setSearch} placeholder="Search integrations..." /></div>
          <div className="w-full sm:w-40"><Select value={category} onChange={setCategory}><option>All</option><option>E-Commerce</option><option>Marketplace</option><option>ERP</option><option>Accounting</option><option>Courier</option></Select></div>
          <div className="w-full sm:w-36"><Select value={status} onChange={setStatus}><option>All</option><option>Connected</option><option>Disconnected</option><option>Error</option></Select></div>
        </div>}>
        <Table headers={['Integration', 'Category', 'Sync Scope', 'Last Sync', 'Status', 'Actions']} rows={rows.map(r => [
          <button key="n" onClick={() => setSelected(r)} className="font-medium text-[#1674c4] hover:underline">{r.name}</button>,
          r.category,
          r.sync,
          r.lastSync,
          <Badge key="b" tone={r.status === 'Connected' ? 'green' : r.status === 'Error' ? 'red' : 'gray'}>{r.status}</Badge>,
          <div key="a" className="flex items-center gap-2">
            <SecondaryButton onClick={() => syncNow(r.id)} disabled={r.status === 'Disconnected'}>Sync</SecondaryButton>
            <SecondaryButton onClick={() => toggleConnection(r.id)}>{r.status === 'Connected' ? 'Disconnect' : 'Connect'}</SecondaryButton>
          </div>
        ])} />
        {rows.length === 0 && <div className="px-5 py-10 text-center text-sm text-[#7c8591]">No integrations found.</div>}
      </Card>

      <Modal open={!!selected} title="Integration details" onClose={() => setSelected(null)}>
        {selected && <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Name', selected.name],
            ['Category', selected.category],
            ['Status', selected.status],
            ['Last Sync', selected.lastSync],
            ['Sync Scope', selected.sync],
            ['Integration ID', selected.id],
          ].map(([k,v]) => <div key={k} className="rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3"><p className="text-xs uppercase tracking-wide text-[#8a929d]">{k}</p><p className="mt-1 text-sm font-medium text-[#1f2937]">{v}</p></div>)}
        </div>}
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
