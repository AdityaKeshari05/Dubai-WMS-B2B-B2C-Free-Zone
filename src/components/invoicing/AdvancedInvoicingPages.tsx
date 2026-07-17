'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, FileClock, PackageCheck, Play, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DeskPage, Field } from './AdvancedInvoicingShell';

function items(payload: any) {
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function total(payload: any) {
  return payload?.data?.total || payload?.data?.pagination?.total || items(payload).length;
}

export function PaymentEntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', paidAmount: '', method: 'BANK_TRANSFER', reference: '', invoiceId: '', allocatedAmount: '' });

  const load = async () => {
    try {
      const [entryRes, invoiceRes, customerRes] = await Promise.all([
        api.get('/payments/entries'),
        api.get('/invoices', { params: { limit: 200 } }),
        api.get('/customers', { params: { limit: 200 } }),
      ]);
      setEntries(items(entryRes.data));
      const openInvoices = items(invoiceRes.data).filter((invoice: any) => invoice.status !== 'DRAFT' && invoice.status !== 'CANCELLED' && Number(invoice.outstandingAmount || invoice.total - invoice.amountPaid) > 0);
      setInvoices(openInvoices);
      setCustomers(items(customerRes.data));
    } catch {
      toast.error('Failed to load payment entries');
    }
  };

  useEffect(() => { load(); }, []);

  const selectedInvoice = useMemo(() => invoices.find(invoice => invoice.id === form.invoiceId), [invoices, form.invoiceId]);

  const create = async () => {
    try {
      const allocatedAmount = Number(form.allocatedAmount || form.paidAmount || 0);
      await api.post('/payments/entries', {
        type: 'RECEIVED',
        customerId: form.customerId || selectedInvoice?.customerId,
        paidAmount: Number(form.paidAmount),
        method: form.method,
        reference: form.reference,
        currency: selectedInvoice?.currency || 'USD',
        allocations: form.invoiceId ? [{ invoiceId: form.invoiceId, allocatedAmount }] : [],
      });
      toast.success('Payment entry drafted');
      setOpen(false);
      setForm({ customerId: '', paidAmount: '', method: 'BANK_TRANSFER', reference: '', invoiceId: '', allocatedAmount: '' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create payment entry');
    }
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/payments/entries/${id}/status`, { status });
      toast.success(`Payment entry ${status.toLowerCase()}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update payment entry');
    }
  };

  return (
    <DeskPage title="Payment Entries" description="Allocate one receipt across invoices or keep the balance as customer advance." action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />New Entry</Button>}>
      {entries.length ? (
        <DataTable data={entries} columns={[
          { key: 'paymentNo', header: 'Entry #' },
          { key: 'customer', header: 'Customer', render: (e: any) => e.customer?.name || '-' },
          { key: 'status', header: 'Status', render: (e: any) => <StatusBadge status={e.status} /> },
          { key: 'paidAmount', header: 'Paid', render: (e: any) => formatCurrency(e.paidAmount, e.currency) },
          { key: 'allocatedAmount', header: 'Allocated', render: (e: any) => formatCurrency(e.allocatedAmount, e.currency) },
          { key: 'unallocatedAmount', header: 'Advance', render: (e: any) => formatCurrency(e.unallocatedAmount, e.currency) },
          { key: 'actions', header: '', render: (e: any) => (
            <div className="flex justify-end gap-2">
              {e.status === 'DRAFT' && <Button size="sm" onClick={() => setStatus(e.id, 'SUBMITTED')}>Submit</Button>}
              {e.status === 'SUBMITTED' && <Button size="sm" variant="outline" onClick={() => setStatus(e.id, 'CANCELLED')}>Cancel</Button>}
            </div>
          ) },
        ]} />
      ) : <EmptyState icon={ClipboardList} title="No payment entries" description="Create a payment entry to allocate receipts across invoices." action={{ label: 'New Entry', onClick: () => setOpen(true) }} />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Payment Entry</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Customer">
                <Select value={form.customerId} onValueChange={value => setForm(prev => ({ ...prev, customerId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Method">
                <Select value={form.method} onValueChange={value => setForm(prev => ({ ...prev, method: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['CASH','BANK_TRANSFER','UPI','CARD','CHEQUE','ONLINE'].map(method => <SelectItem key={method} value={method}>{method.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Paid Amount"><Input type="number" step="0.01" value={form.paidAmount} onChange={event => setForm(prev => ({ ...prev, paidAmount: event.target.value }))} /></Field>
              <Field label="Reference"><Input value={form.reference} onChange={event => setForm(prev => ({ ...prev, reference: event.target.value }))} /></Field>
            </div>
            <div className="rounded-md border border-[#dfe3e8] p-3">
              <div className="mb-3 text-sm font-medium text-[#1f2937]">Invoice Allocation</div>
              <div className="grid grid-cols-[1fr_180px] gap-3">
                <Select value={form.invoiceId} onValueChange={value => {
                  const invoice = invoices.find(i => i.id === value);
                  setForm(prev => ({ ...prev, invoiceId: value, customerId: invoice?.customerId || prev.customerId, allocatedAmount: String(invoice?.outstandingAmount || '') }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Optional invoice allocation" /></SelectTrigger>
                  <SelectContent>{invoices.map(invoice => <SelectItem key={invoice.id} value={invoice.id}>{invoice.invoiceNo} - {invoice.customer?.name} - {formatCurrency(invoice.outstandingAmount, invoice.currency)} due</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" step="0.01" value={form.allocatedAmount} onChange={event => setForm(prev => ({ ...prev, allocatedAmount: event.target.value }))} placeholder="Allocated" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create}>Create Draft</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DeskPage>
  );
}

export function DeliveryNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  const load = async () => {
    try {
      const res = await api.get('/delivery-notes');
      setNotes(items(res.data));
      setTotalRows(total(res.data));
    } catch {
      toast.error('Failed to load delivery notes');
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/delivery-notes/${id}/status`, { status });
      toast.success(`Delivery note ${status.toLowerCase()}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update delivery note');
    }
  };

  const createInvoice = async (id: string) => {
    try {
      const res = await api.post(`/invoices/from-delivery-note/${id}`);
      const invoice = res.data?.data;
      toast.success('Draft invoice created');
      if (invoice?.id) window.location.href = `/invoicing/sales-invoices/${invoice.id}`;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  return (
    <DeskPage title="Delivery Notes" description="Submitted delivery notes issue stock and connect sales orders to invoices." meta={`${totalRows} records`}>
      {notes.length ? <DataTable data={notes} columns={[
        { key: 'deliveryNo', header: 'Delivery #' },
        { key: 'customer', header: 'Customer', render: (n: any) => n.customer?.name || '-' },
        { key: 'salesOrder', header: 'Sales Order', render: (n: any) => n.salesOrder?.orderNo || '-' },
        { key: 'warehouse', header: 'Warehouse', render: (n: any) => n.warehouse?.name || 'Main Warehouse' },
        { key: 'date', header: 'Date', render: (n: any) => formatDate(n.date) },
        { key: 'status', header: 'Status', render: (n: any) => <StatusBadge status={n.status} /> },
        { key: 'items', header: 'Items', render: (n: any) => n.items?.length || 0 },
        { key: 'actions', header: '', render: (n: any) => (
          <div className="flex justify-end gap-2">
            {n.status === 'DRAFT' && <Button size="sm" onClick={() => setStatus(n.id, 'SUBMITTED')}>Submit</Button>}
            {n.status === 'SUBMITTED' && <Button size="sm" onClick={() => createInvoice(n.id)}>Invoice</Button>}
            {n.status === 'SUBMITTED' && <Button size="sm" variant="outline" onClick={() => setStatus(n.id, 'CANCELLED')}>Cancel</Button>}
          </div>
        ) },
      ]} /> : <EmptyState icon={PackageCheck} title="No delivery notes" description="Create delivery notes from confirmed sales orders to issue stock." />}
    </DeskPage>
  );
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    api.get('/invoicing/audit-logs').then(res => setLogs(items(res.data))).catch(() => toast.error('Failed to load audit log'));
  }, []);
  return (
    <DeskPage title="Audit Log" description="Immutable document history for invoices, delivery notes, payments, and credit notes.">
      {logs.length ? <DataTable data={logs} columns={[
        { key: 'createdAt', header: 'Time', render: (l: any) => formatDate(l.createdAt) },
        { key: 'entityType', header: 'Document' },
        { key: 'action', header: 'Action', render: (l: any) => <StatusBadge status={l.action} /> },
        { key: 'statusBefore', header: 'Before', render: (l: any) => l.statusBefore || '-' },
        { key: 'statusAfter', header: 'After', render: (l: any) => l.statusAfter || '-' },
        { key: 'actorEmail', header: 'User', render: (l: any) => l.actorEmail || l.actorRole || '-' },
        { key: 'message', header: 'Message', render: (l: any) => l.message || '-' },
      ]} /> : <EmptyState icon={FileClock} title="No audit events" description="Document actions will appear here as users work." />}
    </DeskPage>
  );
}

export function RecurringRunnerButton({ onDone }: { onDone?: () => void }) {
  const run = async () => {
    try {
      const res = await api.post('/invoicing/subscriptions/run-due');
      toast.success(res.data?.message || 'Recurring invoices generated');
      onDone?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to run recurring invoices');
    }
  };
  return <Button variant="outline" onClick={run}><Play className="mr-2 h-4 w-4" />Run Due Now</Button>;
}
