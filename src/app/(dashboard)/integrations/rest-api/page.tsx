'use client';

import { useState } from 'react';
import { Copy, Eye, EyeOff, KeyRound, Network, RefreshCw } from 'lucide-react';
import {
  Badge, Card, Field, Input, PageHeader, PrimaryButton, SecondaryButton, Table, Toast, Toggle,
} from '@/components/wms/WmsUi';

const endpoints = [
  { method: 'GET', path: '/api/v1/inventory', description: 'Read inventory balances' },
  { method: 'POST', path: '/api/v1/orders', description: 'Create sales orders' },
  { method: 'GET', path: '/api/v1/shipments/:id', description: 'Read shipment status' },
  { method: 'POST', path: '/api/v1/webhooks/test', description: 'Test webhook delivery' },
];

export default function RestApiPage() {
  const [enabled, setEnabled] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [key, setKey] = useState('orus_live_7d9f52b0a84a4a38');
  const [toast, setToast] = useState('');

  const regenerate = () => {
    setKey(`orus_live_${Math.random().toString(36).slice(2, 18)}`);
    setToast('API key regenerated (demo)');
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setToast('Copied to clipboard'); }
    catch { setToast('Copy unavailable in this browser'); }
  };

  return <div className="space-y-5">
    <PageHeader title="REST API" description="Configure API access and review available WMS endpoints." icon={Network}
      action={<div className="flex items-center gap-3"><span className="text-sm text-[#4b5563]">API Enabled</span><Toggle checked={enabled} onChange={setEnabled} /></div>} />

    <Card title="API credentials" description="Frontend demo credentials for integration configuration">
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <Field label="Base URL"><div className="flex gap-2"><Input value="https://api.orus-demo.com/v1" onChange={() => {}} disabled /><SecondaryButton onClick={() => copy('https://api.orus-demo.com/v1')}><Copy className="h-4 w-4" /></SecondaryButton></div></Field>
        <Field label="API Key">
          <div className="flex gap-2">
            <Input value={showKey ? key : '••••••••••••••••••••••••'} onChange={() => {}} disabled />
            <SecondaryButton onClick={() => setShowKey(v => !v)}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</SecondaryButton>
            <SecondaryButton onClick={() => copy(key)}><Copy className="h-4 w-4" /></SecondaryButton>
          </div>
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-[#e5e2dc] px-5 py-4">
        <SecondaryButton onClick={regenerate}><RefreshCw className="h-4 w-4" /> Regenerate Key</SecondaryButton>
        <PrimaryButton onClick={() => setToast('API settings saved locally')}>Save Settings</PrimaryButton>
      </div>
    </Card>

    <Card title="Available endpoints" description="Common REST resources exposed by the WMS">
      <Table headers={['Method', 'Endpoint', 'Description']} rows={endpoints.map(e => [
        <Badge key="m" tone={e.method === 'GET' ? 'blue' : 'green'}>{e.method}</Badge>,
        <code key="p" className="text-xs text-[#1674c4]">{e.path}</code>,
        e.description
      ])} />
    </Card>

    {toast && <Toast message={toast} onClose={() => setToast('')} />}
  </div>
}
