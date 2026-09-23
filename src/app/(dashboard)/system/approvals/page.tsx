'use client';

import { useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import {
  Badge, Card, Field, Input, Modal, PageHeader, PrimaryButton, SecondaryButton, Select, Table, Toast, Toggle,
} from '@/components/wms/WmsUi';

type Rule = {
  id: number;
  action: string;
  approver: string;
  threshold: string;
  enabled: boolean;
};

const initial: Rule[] = [
  { id: 1, action: 'Stock Adjustment', approver: 'Supervisor', threshold: '100 units', enabled: true },
  { id: 2, action: 'Order Cancellation', approver: 'Manager', threshold: 'Any value', enabled: true },
  { id: 3, action: 'Inventory Write-off', approver: 'Management', threshold: 'AED 5,000', enabled: true },
  { id: 4, action: 'Warehouse Transfer', approver: 'Supervisor', threshold: '500 units', enabled: false },
];

export default function ApprovalsPage() {
  const [rules, setRules] = useState(initial);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('Stock Adjustment');
  const [approver, setApprover] = useState('Supervisor');
  const [threshold, setThreshold] = useState('');
  const [toast, setToast] = useState('');

  const addRule = () => {
    if (!threshold.trim()) return;
    setRules((prev) => [...prev, { id: Date.now(), action, approver, threshold, enabled: true }]);
    setThreshold('');
    setOpen(false);
    setToast('Approval rule added');
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Approval Controls" description="Configure authorization rules for sensitive warehouse actions." icon={ShieldCheck}
        action={<PrimaryButton onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Rule</PrimaryButton>} />

      <Card title="Approval rules" description="Enable, disable and configure approval thresholds">
        <Table headers={['Action', 'Approver', 'Threshold', 'State', 'Enabled']} rows={rules.map((r) => [
          <span key="a" className="font-medium text-[#1f2937]">{r.action}</span>,
          r.approver,
          r.threshold,
          <Badge key="s" tone={r.enabled ? 'green' : 'gray'}>{r.enabled ? 'Active' : 'Disabled'}</Badge>,
          <Toggle key="t" checked={r.enabled} onChange={(v) => setRules((prev) => prev.map((x) => x.id === r.id ? { ...x, enabled: v } : x))} />,
        ])} />
      </Card>

      <Modal open={open} title="Add approval rule" description="Create a new frontend-only approval rule." onClose={() => setOpen(false)}
        footer={<><SecondaryButton onClick={() => setOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={addRule}>Save Rule</PrimaryButton></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sensitive Action">
            <Select value={action} onChange={setAction}>
              <option>Stock Adjustment</option><option>Order Cancellation</option><option>Inventory Write-off</option><option>Warehouse Transfer</option>
            </Select>
          </Field>
          <Field label="Approver Role">
            <Select value={approver} onChange={setApprover}>
              <option>Supervisor</option><option>Manager</option><option>Management</option><option>System Admin</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Threshold / Condition"><Input value={threshold} onChange={setThreshold} placeholder="e.g. 100 units or AED 5,000" /></Field>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
