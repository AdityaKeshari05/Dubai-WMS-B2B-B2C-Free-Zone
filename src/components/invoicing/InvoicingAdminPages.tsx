'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { RecurringRunnerButton } from './AdvancedInvoicingPages';

function asItems(payload: any) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export function TaxTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', rate: 18 });

  const fetchTemplates = () => api.get('/invoicing/tax-templates').then(res => setTemplates(asItems(res.data))).catch(() => toast.error('Failed to load tax templates'));
  useEffect(() => { fetchTemplates(); }, []);

  const create = async () => {
    try {
      await api.post('/invoicing/tax-templates', {
        name: form.name,
        code: form.code,
        scope: 'BOTH',
        lines: [{ label: form.name, rate: form.rate }],
      });
      setOpen(false);
      setForm({ name: '', code: '', rate: 18 });
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create template');
    }
  };

  return (
    <CrudShell title="Tax Templates" description="Reusable GST/tax templates used by invoice line items." actionLabel="New Template" onAction={() => setOpen(true)}>
      <DataTable data={templates} columns={[
        { key: 'code', header: 'Code' },
        { key: 'name', header: 'Name' },
        { key: 'scope', header: 'Scope' },
        { key: 'lines', header: 'Rates', render: (t: any) => t.lines?.map((l: any) => `${l.label} ${l.rate}%`).join(', ') || '-' },
        { key: 'isActive', header: 'Status', render: (t: any) => <StatusBadge status={t.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Tax Template</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Field label="Name"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Code"><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></Field>
            <Field label="Rate %"><Input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: Number(e.target.value) }))} /></Field>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </CrudShell>
  );
}

export function CreditNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => {
    api.get('/invoicing/credit-notes').then(res => setNotes(asItems(res.data))).catch(() => toast.error('Failed to load credit notes'));
  }, []);
  return (
    <CrudShell title="Credit Notes" description="Returns and adjustments linked to submitted invoices.">
      {notes.length ? (
        <DataTable data={notes} columns={[
          { key: 'creditNoteNo', header: 'Credit Note #' },
          { key: 'customer', header: 'Customer', render: (n: any) => n.customer?.name || '-' },
          { key: 'originalInvoice', header: 'Invoice', render: (n: any) => n.originalInvoice?.invoiceNo || '-' },
          { key: 'date', header: 'Date', render: (n: any) => formatDate(n.date) },
          { key: 'status', header: 'Status', render: (n: any) => <StatusBadge status={n.status} /> },
          { key: 'grandTotal', header: 'Total', render: (n: any) => formatCurrency(n.grandTotal, n.currency) },
        ]} />
      ) : <EmptyState icon={FileText} title="No credit notes" description="Credit notes created from invoices will appear here." />}
    </CrudShell>
  );
}

export function LedgerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  useEffect(() => {
    api.get('/invoicing/ledger').then(res => setEntries(asItems(res.data))).catch(() => toast.error('Failed to load ledger'));
  }, []);
  return (
    <CrudShell title="General Ledger" description="Immutable accounting entries posted by invoices, payments, and credit notes.">
      <DataTable data={entries} columns={[
        { key: 'postingDate', header: 'Date', render: (e: any) => formatDate(e.postingDate) },
        { key: 'account', header: 'Account', render: (e: any) => e.account ? `${e.account.code} - ${e.account.name}` : e.accountId },
        { key: 'voucherType', header: 'Voucher Type' },
        { key: 'debit', header: 'Debit', render: (e: any) => formatCurrency(e.debit, e.currency) },
        { key: 'credit', header: 'Credit', render: (e: any) => formatCurrency(e.credit, e.currency) },
        { key: 'remarks', header: 'Remarks', render: (e: any) => e.remarks || '-' },
      ]} />
    </CrudShell>
  );
}

export function PrintFormatsPage() {
  const [formats, setFormats] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Default GST Invoice');
  const fetchFormats = () => api.get('/invoicing/print-formats').then(res => setFormats(asItems(res.data))).catch(() => toast.error('Failed to load print formats'));
  useEffect(() => { fetchFormats(); }, []);
  const create = async () => {
    await api.post('/invoicing/print-formats', { name, docType: 'SALES_INVOICE', isDefault: formats.length === 0 }).then(() => { setOpen(false); fetchFormats(); }).catch(() => toast.error('Failed to create format'));
  };
  return (
    <CrudShell title="Print Formats" description="JSON-backed invoice layouts with letterhead, HSN summary, terms, and footer." actionLabel="New Format" onAction={() => setOpen(true)}>
      <DataTable data={formats} columns={[
        { key: 'name', header: 'Name' },
        { key: 'docType', header: 'Document' },
        { key: 'isDefault', header: 'Default', render: (f: any) => f.isDefault ? 'Yes' : 'No' },
        { key: 'isActive', header: 'Status', render: (f: any) => <StatusBadge status={f.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent><DialogHeader><DialogTitle>New Print Format</DialogTitle></DialogHeader><Field label="Name"><Input value={name} onChange={e => setName(e.target.value)} /></Field><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></div></DialogContent>
      </Dialog>
    </CrudShell>
  );
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const fetchSubscriptions = () =>
    api.get('/invoicing/subscriptions').then(res => setSubscriptions(asItems(res.data))).catch(() => toast.error('Failed to load subscriptions'));
  useEffect(() => { fetchSubscriptions(); }, []);
  return (
    <CrudShell title="Recurring Invoices" description="Subscription templates that generate invoices on a schedule." extraAction={<RecurringRunnerButton onDone={fetchSubscriptions} />}>
      {subscriptions.length ? <DataTable data={subscriptions} columns={[
        { key: 'name', header: 'Name' },
        { key: 'customer', header: 'Customer', render: (s: any) => s.customer?.name || s.customerId },
        { key: 'frequency', header: 'Frequency' },
        { key: 'nextRunDate', header: 'Next Run', render: (s: any) => formatDate(s.nextRunDate) },
        { key: 'isActive', header: 'Status', render: (s: any) => <StatusBadge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]} /> : <EmptyState icon={FileText} title="No subscriptions" description="Recurring invoice templates will appear here." />}
    </CrudShell>
  );
}

export function ReportPage({ title, description, endpoint, columns }: { title: string; description: string; endpoint: string; columns: any[] }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.get(endpoint).then(res => setRows(asItems(res.data))).catch(() => toast.error(`Failed to load ${title}`));
  }, [endpoint, title]);
  return (
    <CrudShell title={title} description={description}>
      <DataTable data={rows} columns={columns} />
    </CrudShell>
  );
}

function CrudShell({ title, description, actionLabel, onAction, extraAction, children }: { title: string; description: string; actionLabel?: string; onAction?: () => void; extraAction?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-xl font-semibold text-[#1f2937]">{title}</h1><p className="text-sm text-[#6b7280]">{description}</p></div>
        <div className="flex gap-2">
          {extraAction}
          {actionLabel && <Button onClick={onAction}><Plus className="mr-2 h-4 w-4" />{actionLabel}</Button>}
        </div>
      </div>
      <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
