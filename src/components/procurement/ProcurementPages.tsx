'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BarChart3, ClipboardCheck, ClipboardList, FileCheck2, FileText, HandCoins, Landmark, PackageCheck, Plus, Receipt, RefreshCw, Scale, Settings, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';

export type ProcurementKind = 'dashboard' | 'material-requests' | 'rfqs' | 'supplier-quotations' | 'blanket-purchase-orders' | 'purchase-orders' | 'purchase-receipts' | 'quality-inspections' | 'landed-cost-vouchers' | 'purchase-invoices' | 'supplier-payments' | 'payment-terms' | 'supplier-items' | 'communications' | 'settings' | 'tracker';

const config: Record<ProcurementKind, { title: string; description: string; endpoint: string; icon: any }> = {
  dashboard: { title: 'Procurement Dashboard', description: 'Request-to-pay cockpit across buying documents', endpoint: '/procurement/dashboard', icon: BarChart3 },
  'material-requests': { title: 'Material Requests', description: 'Manual and reorder-driven purchase demand', endpoint: '/procurement/material-requests', icon: ClipboardList },
  rfqs: { title: 'Request for Quotations', description: 'Invite suppliers to quote requested items', endpoint: '/procurement/rfqs', icon: FileText },
  'supplier-quotations': { title: 'Supplier Quotations', description: 'Supplier pricing, terms, validity, and comparison', endpoint: '/procurement/supplier-quotations', icon: Scale },
  'blanket-purchase-orders': { title: 'Blanket Purchase Orders', description: 'Long-term supplier agreements by quantity and date range', endpoint: '/procurement/blanket-purchase-orders', icon: Landmark },
  'purchase-orders': { title: 'Purchase Orders', description: 'Approved supplier commitments with receipt and billing tracking', endpoint: '/procurement/purchase-orders', icon: ClipboardCheck },
  'purchase-receipts': { title: 'Purchase Receipts', description: 'Receive goods into warehouse and update stock ledger', endpoint: '/procurement/purchase-receipts', icon: PackageCheck },
  'quality-inspections': { title: 'Quality Inspections', description: 'Accepted and rejected quantities before stock acceptance', endpoint: '/procurement/quality-inspections', icon: FileCheck2 },
  'landed-cost-vouchers': { title: 'Landed Cost Vouchers', description: 'Distribute freight, customs, insurance, and handling into item valuation', endpoint: '/procurement/landed-cost-vouchers', icon: Truck },
  'purchase-invoices': { title: 'Purchase Invoices', description: 'Book supplier bills into Accounts Payable', endpoint: '/procurement/purchase-invoices', icon: Receipt },
  'supplier-payments': { title: 'Supplier Payments', description: 'Advance and invoice payments against suppliers', endpoint: '/procurement/supplier-payments', icon: HandCoins },
  'payment-terms': { title: 'Payment Terms', description: 'Reusable supplier payment schedules such as advance and delivery milestones', endpoint: '/procurement/payment-terms', icon: Landmark },
  'supplier-items': { title: 'Supplier Item Codes', description: 'Map supplier item codes and names to your item master', endpoint: '/procurement/supplier-items', icon: PackageCheck },
  communications: { title: 'Supplier Communications', description: 'RFQ correspondence, calls, notes, and supplier follow-ups', endpoint: '/procurement/communications', icon: FileText },
  settings: { title: 'Buying Settings', description: 'Global buying controls, tolerances, defaults, and payment terms', endpoint: '/procurement/settings', icon: Settings },
  tracker: { title: 'Procurement Tracker', description: 'Full document-chain visibility from MR to payment', endpoint: '/procurement/tracker', icon: RefreshCw },
};

const today = () => new Date().toISOString().slice(0, 10);
const blankLine = { productId: '', quantity: 1, unitPrice: 0, rate: 0, taxRate: 0, discount: 0 };

export function ProcurementPage({ kind }: { kind: ProcurementKind }) {
  const meta = config[kind];
  const [rows, setRows] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>(defaultForm(kind));
  const [lines, setLines] = useState<any[]>([blankLine]);

  async function load() {
    setLoading(true);
    try {
      const common = await Promise.allSettled([
        api.get('/suppliers', { params: { limit: 200 } }),
        api.get('/inventory/products', { params: { limit: 200 } }),
        api.get('/procurement/purchase-orders', { params: { limit: 200 } }),
        api.get('/procurement/purchase-receipts', { params: { limit: 200 } }),
        api.get('/procurement/purchase-invoices', { params: { limit: 200 } }),
      ]);
      if (common[0].status === 'fulfilled') setSuppliers(common[0].value.data.data?.items || []);
      if (common[1].status === 'fulfilled') setProducts(common[1].value.data.data?.items || []);
      if (common[2].status === 'fulfilled') setOrders(common[2].value.data.data?.items || []);
      if (common[3].status === 'fulfilled') setReceipts(common[3].value.data.data?.items || []);
      if (common[4].status === 'fulfilled') setInvoices(common[4].value.data.data?.items || []);
      const res = await api.get(meta.endpoint, { params: kind === 'settings' || kind === 'dashboard' || kind === 'tracker' ? undefined : { limit: 100 } });
      if (kind === 'dashboard') setDashboard(res.data.data);
      else if (kind === 'settings') setSettings(res.data.data);
      else setRows(Array.isArray(res.data.data) ? res.data.data : res.data.data.items || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to load ${meta.title}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [kind]);

  const total = useMemo(() => lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || line.rate || 0), 0), [lines]);

  async function create(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post(meta.endpoint, payloadFor(kind, form, lines));
      toast.success(`${meta.title.replace(/s$/, '')} created`);
      setOpen(false);
      setForm(defaultForm(kind));
      setLines([blankLine]);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Create failed');
    } finally { setSubmitting(false); }
  }

  async function status(id: string, value: string) {
    const path = statusPath(kind, id);
    if (!path) return;
    try {
      await api.patch(path, { status: value });
      toast.success('Status updated');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  }

  if (kind === 'dashboard') return <ProcurementDashboard meta={meta} data={dashboard} loading={loading} />;
  if (kind === 'settings') return <BuyingSettings data={settings} reload={load} />;
  if (kind === 'tracker') return <Tracker rows={rows} loading={loading} />;

  return (
    <div className="space-y-4">
      <PageHeader title={meta.title} description={meta.description} action={{ label: `New ${singular(meta.title)}`, onClick: () => setOpen(true), icon: Plus }} />
      <DataTable data={rows} isLoading={loading} columns={columnsFor(kind, status)} emptyMessage={`No ${meta.title.toLowerCase()} yet`} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader><DialogTitle>New {singular(meta.title)}</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <DocumentFields kind={kind} form={form} setForm={setForm} suppliers={suppliers} products={products} orders={orders} receipts={receipts} invoices={invoices} />
            {needsLines(kind) && <LineEditor kind={kind} lines={lines} setLines={setLines} products={products} total={total} />}
            {kind === 'payment-terms' && <PaymentTermEditor lines={lines} setLines={setLines} />}
            {kind === 'landed-cost-vouchers' && <ChargeEditor lines={lines} setLines={setLines} />}
            <div className="flex justify-end gap-2 border-t border-[#e5e2dc] pt-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProcurementDashboard({ meta, data, loading }: any) {
  const counts = data?.counts || {};
  const cards = [
    ['Material Requests', counts.materialRequests, '/procurement/material-requests'],
    ['RFQs', counts.rfqs, '/procurement/rfqs'],
    ['Supplier Quotes', counts.supplierQuotations, '/procurement/supplier-quotations'],
    ['Purchase Orders', counts.purchaseOrders, '/procurement/purchase-orders'],
    ['Receipts', counts.purchaseReceipts, '/procurement/purchase-receipts'],
    ['Invoices', counts.purchaseInvoices, '/procurement/purchase-invoices'],
    ['Payments', counts.supplierPayments, '/procurement/supplier-payments'],
  ];
  return (
    <div className="space-y-4">
      <PageHeader title={meta.title} description={meta.description} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <a key={String(label)} href={String(href)} className="rounded-md border border-[#e5e2dc] bg-white p-4 shadow-sm hover:bg-[#f8faf9]">
            <p className="text-xs font-medium uppercase text-[#7c8591]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#1f2937]">{loading ? '...' : value || 0}</p>
          </a>
        ))}
      </div>
      <div className="rounded-md border border-[#e5e2dc] bg-white p-4">
        <p className="text-sm font-semibold text-[#1f2937]">Outstanding Payable</p>
        <p className="mt-2 text-3xl font-semibold text-[#c3423f]">{formatCurrency(Number(data?.outstandingPayable || 0))}</p>
      </div>
    </div>
  );
}

function BuyingSettings({ data, reload }: any) {
  const [form, setForm] = useState<any>({});
  useEffect(() => setForm(data || {}), [data]);
  async function save() {
    await api.patch('/procurement/settings', form);
    toast.success('Buying settings saved');
    reload();
  }
  return (
    <div className="space-y-4">
      <PageHeader title="Buying Settings" description="Control buying tolerances and document requirements" />
      <div className="grid gap-4 rounded-md border border-[#e5e2dc] bg-white p-4 md:grid-cols-3">
        <Field label="Default Currency"><Input value={form.defaultCurrency || 'USD'} onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })} /></Field>
        <Field label="Over Receipt Allowance %"><Input type="number" value={form.overReceiptAllowancePercent || 0} onChange={(e) => setForm({ ...form, overReceiptAllowancePercent: Number(e.target.value) })} /></Field>
        <Field label="Over Billing Allowance %"><Input type="number" value={form.overBillingAllowancePercent || 0} onChange={(e) => setForm({ ...form, overBillingAllowancePercent: Number(e.target.value) })} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.requirePurchaseOrderForInvoice} onChange={(e) => setForm({ ...form, requirePurchaseOrderForInvoice: e.target.checked })} /> PO required before invoice</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.requirePurchaseReceiptForInvoice} onChange={(e) => setForm({ ...form, requirePurchaseReceiptForInvoice: e.target.checked })} /> Receipt required before invoice</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.autoCreateMaterialRequest} onChange={(e) => setForm({ ...form, autoCreateMaterialRequest: e.target.checked })} /> Auto material request from reorder</label>
        <div className="md:col-span-3"><Field label="Default RFQ Terms"><Input value={form.defaultRfqTerms || ''} onChange={(e) => setForm({ ...form, defaultRfqTerms: e.target.value })} /></Field></div>
        <div className="md:col-span-3 flex justify-end"><Button onClick={save}>Save Settings</Button></div>
      </div>
    </div>
  );
}

function Tracker({ rows, loading }: any) {
  return (
    <div className="space-y-4">
      <PageHeader title="Procurement Tracker" description="MR to RFQ to Supplier Quotation to PO to Receipt to Invoice to Payment status per order" />
      <DataTable data={rows} isLoading={loading} columns={[
        { key: 'orderNo', header: 'PO' },
        { key: 'supplier', header: 'Supplier' },
        { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        { key: 'receivedPercent', header: 'Received %', render: (r: any) => `${Number(r.receivedPercent || 0).toFixed(0)}%` },
        { key: 'billedPercent', header: 'Billed %', render: (r: any) => `${Number(r.billedPercent || 0).toFixed(0)}%` },
        { key: 'total', header: 'Total', render: (r: any) => formatCurrency(Number(r.total || 0)) },
        { key: 'chain', header: 'Chain', render: (r: any) => `R:${r.receipts} I:${r.invoices} P:${r.payments}` },
      ]} />
    </div>
  );
}

function DocumentFields({ kind, form, setForm, suppliers, products, orders, receipts, invoices }: any) {
  return (
    <div className="grid gap-3 rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3 md:grid-cols-4">
      {usesSupplier(kind) && <Field label="Supplier"><select required className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.supplierId || ''} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}><option value="">Select supplier</option>{suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>}
      {kind === 'payment-terms' && <><Field label="Template Name"><Input required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Description"><Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></>}
      {kind === 'supplier-items' && <><Field label="Supplier"><select required className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.supplierId || ''} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}><option value="">Select supplier</option>{suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><Field label="Item"><select required className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.productId || ''} onChange={(e) => setForm({ ...form, productId: e.target.value })}><option value="">Select item</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}</select></Field><Field label="Supplier Item Code"><Input required value={form.supplierItemCode || ''} onChange={(e) => setForm({ ...form, supplierItemCode: e.target.value })} /></Field><Field label="Supplier Item Name"><Input value={form.supplierItemName || ''} onChange={(e) => setForm({ ...form, supplierItemName: e.target.value })} /></Field></>}
      {kind === 'communications' && <><Field label="Supplier"><select className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.supplierId || ''} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}><option value="">Select supplier</option>{suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><Field label="Channel"><select className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.channel || 'EMAIL'} onChange={(e) => setForm({ ...form, channel: e.target.value })}><option>EMAIL</option><option>PHONE</option><option>PORTAL</option><option>NOTE</option></select></Field><Field label="Subject"><Input value={form.subject || ''} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field><Field label="Message"><Input required value={form.message || ''} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field></>}
      {kind === 'purchase-receipts' && <Field label="From PO"><select className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.purchaseOrderId || ''} onChange={(e) => setForm({ ...form, purchaseOrderId: e.target.value })}><option value="">Manual receipt</option>{orders.map((o: any) => <option key={o.id} value={o.id}>{o.orderNo} - {o.supplier?.name}</option>)}</select></Field>}
      {kind === 'purchase-invoices' && <><Field label="PO"><select className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.purchaseOrderId || ''} onChange={(e) => setForm({ ...form, purchaseOrderId: e.target.value })}><option value="">No PO</option>{orders.map((o: any) => <option key={o.id} value={o.id}>{o.orderNo}</option>)}</select></Field><Field label="Receipt"><select className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.purchaseReceiptId || ''} onChange={(e) => setForm({ ...form, purchaseReceiptId: e.target.value })}><option value="">No receipt</option>{receipts.map((r: any) => <option key={r.id} value={r.id}>{r.receiptNo}</option>)}</select></Field></>}
      {kind === 'supplier-payments' && <><Field label="Invoice"><select required={form.type === 'INVOICE_PAYMENT'} className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.purchaseInvoiceId || ''} onChange={(e) => { const invoice = invoices.find((item: any) => item.id === e.target.value); setForm({ ...form, purchaseInvoiceId: e.target.value, supplierId: invoice?.supplierId || form.supplierId, amount: invoice ? Number(invoice.outstandingAmount || 0) : form.amount }); }}><option value="">{form.type === 'ADVANCE' ? 'Advance / unallocated' : 'Select invoice'}</option>{invoices.filter((i: any) => !['PAID', 'CANCELLED'].includes(i.status) && (!form.supplierId || i.supplierId === form.supplierId)).map((i: any) => <option key={i.id} value={i.id}>{i.invoiceNo} — {i.supplier?.name || 'Supplier'} — {formatCurrency(Number(i.outstandingAmount || 0), i.currency)}</option>)}</select></Field><Field label="Type"><select className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.type || 'INVOICE_PAYMENT'} onChange={(e) => setForm({ ...form, type: e.target.value, purchaseInvoiceId: e.target.value === 'ADVANCE' ? '' : form.purchaseInvoiceId })}><option>INVOICE_PAYMENT</option><option>ADVANCE</option></select></Field></>}
      {kind === 'landed-cost-vouchers' && <><Field label="Purchase Receipt"><select required className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.purchaseReceiptId || ''} onChange={(e) => setForm({ ...form, purchaseReceiptId: e.target.value })}><option value="">Select receipt</option>{receipts.map((r: any) => <option key={r.id} value={r.id}>{r.receiptNo}</option>)}</select></Field><Field label="Allocation Basis"><select className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.allocationBasis || 'VALUE'} onChange={(e) => setForm({ ...form, allocationBasis: e.target.value })}><option>VALUE</option><option>QUANTITY</option><option>WEIGHT</option></select></Field></>}
      {kind === 'quality-inspections' && <Field label="Purchase Receipt"><select className="h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={form.purchaseReceiptId || ''} onChange={(e) => setForm({ ...form, purchaseReceiptId: e.target.value })}><option value="">Select receipt</option>{receipts.map((r: any) => <option key={r.id} value={r.id}>{r.receiptNo}</option>)}</select></Field>}
      {kind === 'quality-inspections' && <><Field label="Inspected Qty"><Input type="number" value={form.inspectedQty || 0} onChange={(e) => setForm({ ...form, inspectedQty: Number(e.target.value) })} /></Field><Field label="Accepted Qty"><Input type="number" value={form.acceptedQty || 0} onChange={(e) => setForm({ ...form, acceptedQty: Number(e.target.value) })} /></Field><Field label="Rejected Qty"><Input type="number" value={form.rejectedQty || 0} onChange={(e) => setForm({ ...form, rejectedQty: Number(e.target.value) })} /></Field></>}
      {dateField(kind) && <Field label={dateField(kind) || 'Date'}><Input type="date" value={form.date || form.requiredBy || form.validFrom || form.postingDate || today()} onChange={(e) => setForm({ ...form, [dateKey(kind)]: e.target.value })} /></Field>}
      {kind === 'blanket-purchase-orders' && <Field label="Valid To"><Input type="date" value={form.validTo || today()} onChange={(e) => setForm({ ...form, validTo: e.target.value })} /></Field>}
      {['purchase-orders', 'purchase-invoices', 'supplier-quotations'].includes(kind) && <><Field label="Currency"><Input value={form.currency || 'USD'} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Field><Field label="Exchange Rate"><Input type="number" value={form.exchangeRate || 1} onChange={(e) => setForm({ ...form, exchangeRate: Number(e.target.value) })} /></Field><Field label="Shipping/Freight"><Input type="number" value={form.shippingAmount || 0} onChange={(e) => setForm({ ...form, shippingAmount: Number(e.target.value) })} /></Field></>}
      {kind === 'supplier-payments' && <><Field label="Amount"><Input type="number" required value={form.amount || 0} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field><Field label="Reference"><Input value={form.reference || ''} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field></>}
      <div className="md:col-span-4"><Field label="Notes / Terms"><Input value={form.notes || form.terms || ''} onChange={(e) => setForm({ ...form, notes: e.target.value, terms: e.target.value })} /></Field></div>
    </div>
  );
}

function PaymentTermEditor({ lines, setLines }: any) {
  const rows = lines.length ? lines : [{ label: 'Advance', percentage: 30, dueAfterDays: 0 }];
  return (
    <div className="space-y-2 rounded-md border border-[#e5e2dc] bg-white p-3">
      <div className="flex items-center justify-between"><Label>Schedule</Label><Button type="button" variant="outline" size="sm" onClick={() => setLines([...rows, { label: '', percentage: 0, dueAfterDays: 0 }])}>Add Term</Button></div>
      {rows.map((line: any, index: number) => (
        <div key={index} className="grid grid-cols-12 gap-2">
          <Input className="col-span-5 h-8" placeholder="Milestone" value={line.label || ''} onChange={(e) => updateLine(rows, setLines, index, { label: e.target.value })} />
          <Input className="col-span-3 h-8" type="number" placeholder="%" value={line.percentage || 0} onChange={(e) => updateLine(rows, setLines, index, { percentage: Number(e.target.value) })} />
          <Input className="col-span-3 h-8" type="number" placeholder="Due days" value={line.dueAfterDays || 0} onChange={(e) => updateLine(rows, setLines, index, { dueAfterDays: Number(e.target.value) })} />
          <Button type="button" variant="ghost" size="sm" className="col-span-1" onClick={() => setLines(rows.filter((_: any, i: number) => i !== index))}>×</Button>
        </div>
      ))}
    </div>
  );
}

function LineEditor({ kind, lines, setLines, products, total }: any) {
  return (
    <div className="space-y-2 rounded-md border border-[#e5e2dc] bg-white p-3">
      <div className="flex items-center justify-between"><Label>Items</Label><Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, blankLine])}>Add Row</Button></div>
      {lines.map((line: any, index: number) => (
        <div key={index} className="grid grid-cols-12 gap-2">
          <select className="col-span-5 h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={line.productId} onChange={(e) => {
            const product = products.find((p: any) => p.id === e.target.value);
            updateLine(lines, setLines, index, { productId: e.target.value, unitPrice: Number(product?.costPrice || 0), rate: Number(product?.costPrice || 0) });
          }}><option value="">Select item</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}</select>
          <Input className="col-span-2 h-8" type="number" value={line.quantity} onChange={(e) => updateLine(lines, setLines, index, { quantity: Number(e.target.value) })} />
          <Input className="col-span-2 h-8" type="number" value={line.unitPrice || line.rate || 0} onChange={(e) => updateLine(lines, setLines, index, { unitPrice: Number(e.target.value), rate: Number(e.target.value) })} />
          <Input className="col-span-1 h-8" type="number" value={line.taxRate || 0} onChange={(e) => updateLine(lines, setLines, index, { taxRate: Number(e.target.value) })} />
          <div className="col-span-1 py-1.5 text-right text-sm font-medium">{formatCurrency(Number(line.quantity || 0) * Number(line.unitPrice || line.rate || 0))}</div>
          <Button type="button" variant="ghost" size="sm" className="col-span-1" onClick={() => setLines(lines.filter((_: any, i: number) => i !== index))}>×</Button>
        </div>
      ))}
      <div className="text-right text-sm font-semibold">Preview subtotal: {formatCurrency(total)}</div>
      {kind === 'purchase-receipts' && <p className="text-xs text-[#7c8591]">For receipts, quantity is treated as received and accepted quantity unless a quality inspection later changes it.</p>}
    </div>
  );
}

function ChargeEditor({ lines, setLines }: any) {
  return (
    <div className="space-y-2 rounded-md border border-[#e5e2dc] bg-white p-3">
      <div className="flex items-center justify-between"><Label>Landed Charges</Label><Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, { type: 'FREIGHT', amount: 0, description: '' }])}>Add Charge</Button></div>
      {lines.map((line: any, index: number) => (
        <div key={index} className="grid grid-cols-12 gap-2">
          <select className="col-span-3 h-8 rounded-md border border-[#d9d4cc] bg-white px-2 text-sm" value={line.type || 'FREIGHT'} onChange={(e) => updateLine(lines, setLines, index, { type: e.target.value })}><option>FREIGHT</option><option>CUSTOMS</option><option>INSURANCE</option><option>HANDLING</option><option>OTHER</option></select>
          <Input className="col-span-6 h-8" value={line.description || ''} onChange={(e) => updateLine(lines, setLines, index, { description: e.target.value })} />
          <Input className="col-span-2 h-8" type="number" value={line.amount || 0} onChange={(e) => updateLine(lines, setLines, index, { amount: Number(e.target.value) })} />
          <Button type="button" variant="ghost" size="sm" className="col-span-1" onClick={() => setLines(lines.filter((_: any, i: number) => i !== index))}>×</Button>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: any) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function updateLine(lines: any[], setLines: any, index: number, patch: any) {
  const next = [...lines];
  next[index] = { ...next[index], ...patch };
  setLines(next);
}

function defaultForm(kind: ProcurementKind) {
  const base: any = { date: today(), currency: 'USD', exchangeRate: 1 };
  if (kind === 'material-requests') return { requiredBy: today(), source: 'MANUAL' };
  if (kind === 'rfqs') return { validUntil: today() };
  if (kind === 'blanket-purchase-orders') return { validFrom: today(), validTo: today(), currency: 'USD' };
  if (kind === 'purchase-receipts') return { postingDate: today() };
  if (kind === 'supplier-payments') return { date: today(), type: 'INVOICE_PAYMENT', method: 'BANK_TRANSFER', amount: 0 };
  if (kind === 'communications') return { channel: 'EMAIL', direction: 'OUTBOUND', message: '' };
  return base;
}

function payloadFor(kind: ProcurementKind, form: any, lines: any[]) {
  if (kind === 'landed-cost-vouchers') return { ...form, charges: lines.filter((line) => Number(line.amount || 0) > 0) };
  if (kind === 'payment-terms') return { ...form, terms: lines.filter((line) => line.label).map((line, index) => ({ ...line, rowOrder: index })) };
  if (kind === 'supplier-payments' || kind === 'quality-inspections' || kind === 'supplier-items' || kind === 'communications') return form;
  if (kind === 'purchase-receipts') return form.purchaseOrderId ? form : { ...form, supplierId: form.supplierId, items: lines.map((line) => ({ ...line, receivedQty: line.quantity, acceptedQty: line.quantity, rate: line.unitPrice || line.rate })) };
  if (kind === 'supplier-quotations') return { ...form, items: lines.map((line) => ({ ...line, rate: line.unitPrice || line.rate })) };
  return { ...form, items: lines };
}

function columnsFor(kind: ProcurementKind, status: (id: string, value: string) => void) {
  const actions = (row: any) => <Actions kind={kind} row={row} status={status} />;
  if (kind === 'material-requests') return [{ key: 'requestNo', header: 'Request #' }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'requiredBy', header: 'Required By', render: (r: any) => r.requiredBy ? formatDate(r.requiredBy) : '-' }, { key: 'items', header: 'Items', render: (r: any) => r.items?.length || 0 }, { key: 'actions', header: '', render: actions }];
  if (kind === 'rfqs') return [{ key: 'rfqNo', header: 'RFQ #' }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'validUntil', header: 'Valid Until', render: (r: any) => r.validUntil ? formatDate(r.validUntil) : '-' }, { key: 'suppliers', header: 'Suppliers', render: (r: any) => r.suppliers?.length || 0 }, { key: 'actions', header: '', render: actions }];
  if (kind === 'supplier-quotations') return [{ key: 'quotationNo', header: 'Quote #' }, { key: 'supplier', header: 'Supplier', render: (r: any) => r.supplier?.name }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'total', header: 'Total', render: (r: any) => formatCurrency(Number(r.total || 0), r.currency) }, { key: 'actions', header: '', render: actions }];
  if (kind === 'purchase-orders') return [{ key: 'orderNo', header: 'PO #' }, { key: 'supplier', header: 'Supplier', render: (r: any) => r.supplier?.name }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'receivedPercent', header: 'Received', render: (r: any) => `${Number(r.receivedPercent || 0).toFixed(0)}%` }, { key: 'total', header: 'Total', render: (r: any) => formatCurrency(Number(r.total || 0), r.currency) }, { key: 'actions', header: '', render: actions }];
  if (kind === 'purchase-receipts') return [{ key: 'receiptNo', header: 'Receipt #' }, { key: 'supplier', header: 'Supplier', render: (r: any) => r.supplier?.name }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'acceptedQty', header: 'Accepted' }, { key: 'landedCostAmount', header: 'Landed Cost', render: (r: any) => formatCurrency(Number(r.landedCostAmount || 0), r.currency) }, { key: 'actions', header: '', render: actions }];
  if (kind === 'purchase-invoices') return [{ key: 'invoiceNo', header: 'Invoice #' }, { key: 'supplier', header: 'Supplier', render: (r: any) => r.supplier?.name }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'total', header: 'Total', render: (r: any) => formatCurrency(Number(r.total || 0), r.currency) }, { key: 'outstandingAmount', header: 'Outstanding', render: (r: any) => formatCurrency(Number(r.outstandingAmount || 0), r.currency) }, { key: 'actions', header: '', render: actions }];
  if (kind === 'supplier-payments') return [{ key: 'paymentNo', header: 'Payment #' }, { key: 'supplier', header: 'Supplier', render: (r: any) => r.supplier?.name }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'type', header: 'Type' }, { key: 'amount', header: 'Amount', render: (r: any) => formatCurrency(Number(r.amount || 0), r.currency) }, { key: 'actions', header: '', render: actions }];
  if (kind === 'payment-terms') return [{ key: 'name', header: 'Template' }, { key: 'description', header: 'Description' }, { key: 'terms', header: 'Terms', render: (r: any) => r.terms?.length || 0 }, { key: 'isActive', header: 'Active', render: (r: any) => r.isActive ? 'Yes' : 'No' }];
  if (kind === 'supplier-items') return [{ key: 'supplier', header: 'Supplier', render: (r: any) => r.supplier?.name }, { key: 'product', header: 'Item', render: (r: any) => r.product?.name }, { key: 'supplierItemCode', header: 'Supplier Code' }, { key: 'supplierItemName', header: 'Supplier Name' }, { key: 'leadTimeDays', header: 'Lead Time' }];
  if (kind === 'communications') return [{ key: 'sentAt', header: 'Date', render: (r: any) => formatDate(r.sentAt) }, { key: 'channel', header: 'Channel' }, { key: 'subject', header: 'Subject' }, { key: 'message', header: 'Message' }, { key: 'direction', header: 'Direction' }];
  if (kind === 'landed-cost-vouchers') return [{ key: 'voucherNo', header: 'Voucher #' }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'allocationBasis', header: 'Basis' }, { key: 'totalCharges', header: 'Charges', render: (r: any) => formatCurrency(Number(r.totalCharges || 0)) }, { key: 'actions', header: '', render: actions }];
  if (kind === 'quality-inspections') return [{ key: 'inspectionNo', header: 'Inspection #' }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'inspectedQty', header: 'Inspected' }, { key: 'acceptedQty', header: 'Accepted' }, { key: 'rejectedQty', header: 'Rejected' }];
  return [{ key: 'agreementNo', header: 'Agreement #' }, { key: 'supplier', header: 'Supplier', render: (r: any) => r.supplier?.name }, { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> }, { key: 'validFrom', header: 'Valid From', render: (r: any) => formatDate(r.validFrom) }, { key: 'validTo', header: 'Valid To', render: (r: any) => formatDate(r.validTo) }];
}

function Actions({ kind, row, status }: any) {
  if (['material-requests', 'purchase-receipts', 'landed-cost-vouchers'].includes(kind) && row.status === 'DRAFT') return <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); status(row.id, 'SUBMITTED'); }}>Submit</Button>;
  if (kind === 'purchase-orders' && row.status === 'DRAFT') return <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); status(row.id, 'CONFIRMED'); }}>Confirm</Button>;
  if (kind === 'purchase-invoices' && row.status === 'DRAFT') return <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); status(row.id, 'SUBMITTED'); }}>Submit</Button>;
  if (kind === 'supplier-payments' && row.status === 'DRAFT') return <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); status(row.id, 'SUBMITTED'); }}>Submit</Button>;
  if (kind === 'rfqs' && row.status === 'DRAFT') return <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); status(row.id, 'SENT'); }}>Send</Button>;
  return <span className="text-xs text-[#8a929d]">-</span>;
}

function statusPath(kind: ProcurementKind, id: string) {
  const map: Record<string, string> = {
    'material-requests': `/procurement/material-requests/${id}/status`,
    rfqs: `/procurement/rfqs/${id}/status`,
    'purchase-orders': `/procurement/purchase-orders/${id}/status`,
    'purchase-receipts': `/procurement/purchase-receipts/${id}/status`,
    'landed-cost-vouchers': `/procurement/landed-cost-vouchers/${id}/status`,
    'purchase-invoices': `/procurement/purchase-invoices/${id}/status`,
    'supplier-payments': `/procurement/supplier-payments/${id}/status`,
  };
  return map[kind];
}

function needsLines(kind: ProcurementKind) {
  return ['material-requests', 'rfqs', 'supplier-quotations', 'blanket-purchase-orders', 'purchase-orders', 'purchase-receipts', 'purchase-invoices'].includes(kind);
}

function usesSupplier(kind: ProcurementKind) {
  return ['supplier-quotations', 'blanket-purchase-orders', 'purchase-orders', 'purchase-receipts', 'purchase-invoices', 'supplier-payments'].includes(kind);
}

function dateField(kind: ProcurementKind) {
  if (kind === 'material-requests') return 'Required By';
  if (kind === 'blanket-purchase-orders') return 'Valid From';
  if (kind === 'purchase-receipts') return 'Posting Date';
  if (kind === 'supplier-payments') return 'Payment Date';
  return ['purchase-orders', 'purchase-invoices', 'supplier-quotations'].includes(kind) ? 'Date' : null;
}

function dateKey(kind: ProcurementKind) {
  if (kind === 'material-requests') return 'requiredBy';
  if (kind === 'blanket-purchase-orders') return 'validFrom';
  if (kind === 'purchase-receipts') return 'postingDate';
  return 'date';
}

function singular(title: string) {
  return title.replace(/ies$/, 'y').replace(/s$/, '');
}
