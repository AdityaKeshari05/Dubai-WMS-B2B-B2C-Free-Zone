'use client';

import { useState } from 'react';
import { Hash, Save } from 'lucide-react';
import {
  Card, Field, Input, PageHeader, PrimaryButton, Table, Toast, Toggle,
} from '@/components/wms/WmsUi';

type Scheme = { id: string; document: string; prefix: string; next: number; reset: boolean };

const initial: Scheme[] = [
  { id: 'po', document: 'Purchase Order', prefix: 'PO-{YYYY}-', next: 128, reset: true },
  { id: 'grn', document: 'Goods Receipt', prefix: 'GRN-{YYYY}-', next: 349, reset: true },
  { id: 'shp', document: 'Shipment', prefix: 'SHP-{YYYY}-', next: 882, reset: true },
  { id: 'adj', document: 'Stock Adjustment', prefix: 'ADJ-', next: 49, reset: false },
];

export default function NumberingPage() {
  const [items, setItems] = useState(initial);
  const [toast, setToast] = useState('');

  return (
    <div className="space-y-5">
      <PageHeader title="Numbering Configuration" description="Configure document prefixes, sequences and yearly reset rules." icon={Hash}
        action={<PrimaryButton onClick={() => setToast('Numbering configuration saved locally')}><Save className="h-4 w-4" /> Save Numbering</PrimaryButton>} />

      <Card title="Document numbering" description="Edit values below to preview the resulting document number">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#fbfaf8]"><tr>{['Document','Prefix','Next Number','Reset Yearly','Preview'].map(h => <th key={h} className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#7c8591]">{h}</th>)}</tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t border-[#f0eee9]">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1f2937]">{r.document}</td>
                  <td className="px-5 py-3.5"><Input value={r.prefix} onChange={(v) => setItems(p => p.map(x => x.id === r.id ? {...x, prefix:v}:x))} /></td>
                  <td className="px-5 py-3.5"><Input type="number" value={String(r.next)} onChange={(v) => setItems(p => p.map(x => x.id === r.id ? {...x, next:Number(v)||0}:x))} /></td>
                  <td className="px-5 py-3.5"><Toggle checked={r.reset} onChange={(v) => setItems(p => p.map(x => x.id === r.id ? {...x, reset:v}:x))} /></td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1674c4]">{r.prefix.replace('{YYYY}','2026')}{String(r.next).padStart(5,'0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
