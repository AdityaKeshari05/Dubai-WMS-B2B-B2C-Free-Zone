'use client';

import { useState } from 'react';
import { Save, Settings2 } from 'lucide-react';
import {
  Card, Field, Input, PageHeader, PrimaryButton, Select, Toast, Toggle,
} from '@/components/wms/WmsUi';

export default function SystemConfigurationPage() {
  const [warehouse, setWarehouse] = useState('Dubai Main Warehouse');
  const [currency, setCurrency] = useState('AED');
  const [timezone, setTimezone] = useState('Asia/Dubai');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [negativeStock, setNegativeStock] = useState(false);
  const [autoAllocate, setAutoAllocate] = useState(true);
  const [fefo, setFefo] = useState(true);
  const [toast, setToast] = useState('');

  return (
    <div className="space-y-5">
      <PageHeader title="System Configuration" description="Configure default warehouse and operational rules." icon={Settings2}
        action={<PrimaryButton onClick={() => setToast('Configuration saved locally')}><Save className="h-4 w-4" /> Save Configuration</PrimaryButton>} />

      <Card title="General settings" description="Default values used across warehouse operations">
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="Default Warehouse"><Select value={warehouse} onChange={setWarehouse}><option>Dubai Main Warehouse</option><option>Free Zone Warehouse</option><option>Overflow Warehouse</option></Select></Field>
          <Field label="Primary Currency"><Select value={currency} onChange={setCurrency}><option>AED</option><option>USD</option><option>EUR</option></Select></Field>
          <Field label="Timezone"><Select value={timezone} onChange={setTimezone}><option>Asia/Dubai</option><option>UTC</option><option>Asia/Kolkata</option></Select></Field>
          <Field label="Date Format"><Select value={dateFormat} onChange={setDateFormat}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></Select></Field>
        </div>
      </Card>

      <Card title="Operational rules" description="Demo toggles for common WMS behaviour">
        <div className="divide-y divide-[#f0eee9]">
          {[
            ['Allow negative stock', 'Permit transactions that reduce available stock below zero', negativeStock, setNegativeStock],
            ['Automatic order allocation', 'Reserve inventory automatically when orders are confirmed', autoAllocate, setAutoAllocate],
            ['FEFO allocation', 'Prefer stock with earliest expiry date', fefo, setFefo],
          ].map(([title, desc, checked, setter]) => (
            <div key={String(title)} className="flex items-center justify-between gap-4 px-5 py-4">
              <div><p className="text-sm font-medium text-[#1f2937]">{String(title)}</p><p className="mt-1 text-xs text-[#7c8591]">{String(desc)}</p></div>
              <Toggle checked={Boolean(checked)} onChange={setter as (v: boolean) => void} />
            </div>
          ))}
        </div>
      </Card>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
