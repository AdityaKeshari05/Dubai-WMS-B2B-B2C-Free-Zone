'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  Badge,
  Card,
  Field,
  Input,
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

export type FeatureRow = {
  id: string;
  status: string;
  [key: string]: string | number;
};

export type FeatureColumn = {
  key: string;
  label: string;
};

export type FeatureField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'select' | 'date';
  options?: string[];
};

export type FeaturePageConfig = {
  title: string;
  description: string;
  featureCode: string;
  columns: FeatureColumn[];
  rows: FeatureRow[];
  statuses: string[];
  metrics?: Array<{ label: string; value: string; hint: string }>;
  primaryAction?: string;
  actionLabel?: string;
  modalTitle?: string;
  fields?: FeatureField[];
  progressStatuses?: string[];
  searchPlaceholder?: string;
};

const toneFor = (status: string) => {
  const s = status.toLowerCase();
  if (['completed', 'approved', 'available', 'active', 'shipped', 'delivered', 'verified', 'released', 'reconciled', 'generated', 'synced', 'restocked'].some(x => s.includes(x))) return 'green';
  if (['failed', 'damaged', 'rejected', 'exception', 'shortage', 'blocked', 'cancelled'].some(x => s.includes(x))) return 'red';
  if (['pending', 'scheduled', 'draft', 'waiting', 'partial', 'hold', 'quarantine'].some(x => s.includes(x))) return 'amber';
  if (['picking', 'processing', 'allocated', 'counting', 'in transit', 'packing', 'created'].some(x => s.includes(x))) return 'blue';
  return 'gray';
};

export default function M05M08FeaturePage({ config }: { config: FeaturePageConfig }) {
  const [rows, setRows] = useState<FeatureRow[]>(config.rows);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FeatureRow | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    return rows.filter(row => {
      const matchesStatus = status === 'All' || row.status === status;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || Object.values(row).some(v => String(v).toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, status]);

  const addRecord = () => {
    const fields = config.fields || [];
    if (fields.length && fields.some(f => !String(form[f.key] || '').trim())) {
      setToast('Please fill all required fields');
      return;
    }
    const idPrefix = config.featureCode.replace('.', '-');
    const newRow: FeatureRow = {
      id: `${idPrefix}-${String(rows.length + 1).padStart(3, '0')}`,
      status: config.statuses[0] || 'Active',
    };
    for (const col of config.columns) {
      if (col.key === 'id' || col.key === 'status') continue;
      newRow[col.key] = form[col.key] || '—';
    }
    setRows(prev => [newRow, ...prev]);
    setForm({});
    setOpen(false);
    setToast('Record added locally');
  };

  const progress = (row: FeatureRow) => {
    const flow = config.progressStatuses || config.statuses;
    const idx = flow.indexOf(row.status);
    const next = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : row.status;
    setRows(prev => prev.map(x => x.id === row.id ? { ...x, status: next } : x));
    setToast(`Status updated to ${next}`);
  };

  const metrics = config.metrics || [
    { label: 'Total Records', value: String(rows.length), hint: 'Current demo records' },
    { label: 'Active / Open', value: String(rows.filter(r => !['Completed','Delivered','Approved','Reconciled','Shipped'].includes(r.status)).length), hint: 'Needs action' },
    { label: 'Completed', value: String(rows.filter(r => ['Completed','Delivered','Approved','Reconciled','Shipped','Generated','Verified'].includes(r.status)).length), hint: 'Processed' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={config.title}
        description={config.description}
        icon={ClipboardList}
        action={
          config.primaryAction !== 'none' ? (
            <PrimaryButton onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {config.primaryAction || 'Add Record'}
            </PrimaryButton>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((m, i) => (
          <StatCard
            key={m.label}
            label={m.label}
            value={m.value}
            hint={m.hint}
            icon={i === 0 ? Activity : i === 1 ? RefreshCw : CheckCircle2}
          />
        ))}
      </div>

      <Card
        title={config.title}
        description="Frontend-only interactive WMS demo"
        action={
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="w-full sm:w-72">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={config.searchPlaceholder || 'Search records...'}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select value={status} onChange={setStatus}>
                <option>All</option>
                {config.statuses.map(s => <option key={s}>{s}</option>)}
              </Select>
            </div>
          </div>
        }
      >
        <Table
          headers={[...config.columns.map(c => c.label), 'Status', 'Actions']}
          rows={filtered.map(row => [
            ...config.columns.map(col => {
              const value = row[col.key];
              if (col.key === 'id') {
                return <button key={`${row.id}-${col.key}`} onClick={() => setSelected(row)} className="font-medium text-[#1674c4] hover:underline">{String(value)}</button>;
              }
              return <span key={`${row.id}-${col.key}`}>{String(value ?? '—')}</span>;
            }),
            <Badge key={`${row.id}-status`} tone={toneFor(row.status)}>{row.status}</Badge>,
            <div key={`${row.id}-actions`} className="flex items-center gap-2">
              <SecondaryButton onClick={() => setSelected(row)}>View</SecondaryButton>
              {(config.progressStatuses || config.statuses).length > 1 && (
                <SecondaryButton onClick={() => progress(row)}>
                  {config.actionLabel || 'Advance'}
                </SecondaryButton>
              )}
            </div>,
          ])}
        />
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-[#7c8591]">No matching records.</div>
        )}
      </Card>

      <Modal
        open={open}
        title={config.modalTitle || config.primaryAction || 'Add Record'}
        description="This change is stored only in local React state."
        onClose={() => setOpen(false)}
        footer={
          <>
            <SecondaryButton onClick={() => setOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={addRecord}>Save</PrimaryButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(config.fields || []).map(field => (
            <Field key={field.key} label={field.label}>
              {field.type === 'select' ? (
                <Select
                  value={form[field.key] || ''}
                  onChange={(value: string) => setForm(prev => ({ ...prev, [field.key]: value }))}
                >
                  <option value="">{field.placeholder || `Select ${field.label}`}</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
              ) : (
                <Input
                  type={field.type || 'text'}
                  value={form[field.key] || ''}
                  onChange={(value: string) => setForm(prev => ({ ...prev, [field.key]: value }))}
                  placeholder={field.placeholder}
                />
              )}
            </Field>
          ))}
        </div>
      </Modal>

      <Modal open={!!selected} title="Record details" onClose={() => setSelected(null)}>
        {selected && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(selected).map(([k,v]) => (
              <div key={k} className="rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3">
                <p className="text-xs uppercase tracking-wide text-[#8a929d]">{k}</p>
                <p className="mt-1 text-sm font-medium text-[#1f2937]">{String(v)}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
