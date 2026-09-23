'use client';

import { useMemo, useState } from 'react';
import { History, Search, Eye } from 'lucide-react';
import {
  Badge,
  Card,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
  Table,
} from '@/components/wms/WmsUi';

type Tx = {
  id: string;
  type: 'Inventory' | 'Order' | 'Shipment' | 'Adjustment';
  reference: string;
  description: string;
  user: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
};

const seed: Tx[] = [
  { id: 'TX-91021', type: 'Inventory', reference: 'SKU-10028', description: 'Stock moved BIN-A01 → BIN-B04', user: 'Ahmed Khan', date: '23 Sep 2026, 09:42', status: 'Completed' },
  { id: 'TX-91022', type: 'Order', reference: 'SO-18241', description: 'Order allocated to picking wave', user: 'Sara Malik', date: '23 Sep 2026, 09:31', status: 'Completed' },
  { id: 'TX-91023', type: 'Adjustment', reference: 'ADJ-0048', description: 'Stock adjustment awaiting approval', user: 'Rashid Noor', date: '23 Sep 2026, 09:18', status: 'Pending' },
  { id: 'TX-91024', type: 'Shipment', reference: 'SHP-8821', description: 'Courier handover failed', user: 'System', date: '23 Sep 2026, 08:57', status: 'Failed' },
];

export default function TransactionHistoryPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState<Tx | null>(null);

  const rows = useMemo(() => seed.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || `${r.id} ${r.reference} ${r.description} ${r.user}`.toLowerCase().includes(q);
    const matchesType = type === 'All' || r.type === type;
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesType && matchesStatus;
  }), [search, type, status]);

  return (
    <div className="space-y-5">
      <PageHeader title="Transaction History" description="Review historical inventory, order and shipment transactions." icon={History} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Transactions Today" value="1,284" hint="Across all modules" icon={History} />
        <StatCard label="Inventory" value="628" hint="Movements & adjustments" icon={History} />
        <StatCard label="Orders" value="431" hint="Sales & fulfilment" icon={History} />
        <StatCard label="Failed" value="7" hint="Needs attention" icon={History} />
      </div>

      <Card
        title="Transaction register"
        description="Search and filter historical transactions"
        action={
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="w-full sm:w-72">
              <SearchInput value={search} onChange={setSearch} placeholder="Search ID, reference or user..." />
            </div>
            <div className="w-full sm:w-36">
              <Select value={type} onChange={setType}>
                <option>All</option><option>Inventory</option><option>Order</option><option>Shipment</option><option>Adjustment</option>
              </Select>
            </div>
            <div className="w-full sm:w-32">
              <Select value={status} onChange={setStatus}>
                <option>All</option><option>Completed</option><option>Pending</option><option>Failed</option>
              </Select>
            </div>
          </div>
        }
      >
        <Table
          headers={['Transaction', 'Type', 'Reference', 'Description', 'User', 'Date', 'Status', '']}
          rows={rows.map((r) => [
            <span className="font-medium text-[#1674c4]" key="id">{r.id}</span>,
            r.type,
            r.reference,
            r.description,
            r.user,
            r.date,
            <Badge key="status" tone={r.status === 'Completed' ? 'green' : r.status === 'Pending' ? 'amber' : 'red'}>{r.status}</Badge>,
            <button key="view" onClick={() => setSelected(r)} className="rounded-md p-1.5 text-[#7c8591] hover:bg-[#eef3f5] hover:text-[#1674c4]"><Eye className="h-4 w-4" /></button>,
          ])}
        />
        {rows.length === 0 && <div className="px-5 py-10 text-center text-sm text-[#7c8591]">No transactions found.</div>}
      </Card>

      <Modal open={!!selected} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(selected).map(([k, v]) => (
              <div key={k} className="rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3">
                <p className="text-xs uppercase tracking-wide text-[#8a929d]">{k}</p>
                <p className="mt-1 text-sm font-medium text-[#1f2937]">{String(v)}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
