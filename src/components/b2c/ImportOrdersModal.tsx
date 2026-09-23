'use client';

import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download, FileUp, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { b2cOrderService } from '@/lib/wms/services/b2cOrderService';
import type { B2CChannel, B2CPaymentMethod } from '@/types';

const FIELDS = [
  { key: 'orderNumber', label: 'Order Number', required: true },
  { key: 'customerName', label: 'Customer Name', required: true },
  { key: 'customerEmail', label: 'Customer Email', required: false },
  { key: 'customerPhone', label: 'Customer Phone', required: false },
  { key: 'sku', label: 'SKU', required: true },
  { key: 'productName', label: 'Product Name', required: false },
  { key: 'quantity', label: 'Quantity', required: true },
  { key: 'unitPrice', label: 'Unit Price', required: true },
  { key: 'paymentMethod', label: 'Payment Method', required: true },
  { key: 'paymentStatus', label: 'Payment Status', required: false },
  { key: 'shippingAddress', label: 'Shipping Address', required: true },
  { key: 'city', label: 'City', required: false },
  { key: 'country', label: 'Country', required: false },
  { key: 'warehouse', label: 'Warehouse', required: false },
  { key: 'priority', label: 'Priority', required: false },
  { key: 'channel', label: 'Channel', required: false },
] as const;
type FieldKey = typeof FIELDS[number]['key'];
type CsvRow = Record<string, string>;
type ReviewRow = { source: CsvRow; errors: string[]; mapped: Partial<Record<FieldKey, string>> };

const aliases: Record<FieldKey, string[]> = {
  orderNumber: ['order number', 'order no', 'order #', 'external order id', 'order id'],
  customerName: ['customer name', 'name', 'buyer name'], customerEmail: ['customer email', 'email', 'buyer email'],
  customerPhone: ['customer phone', 'phone', 'mobile', 'telephone'], sku: ['sku', 'item sku', 'product sku'],
  productName: ['product name', 'item name', 'product'], quantity: ['quantity', 'qty', 'item quantity'],
  unitPrice: ['unit price', 'price', 'item price'], paymentMethod: ['payment method', 'payment', 'method'],
  paymentStatus: ['payment status', 'paid status'], shippingAddress: ['shipping address', 'address', 'delivery address'],
  city: ['city', 'shipping city'], country: ['country', 'shipping country'], warehouse: ['warehouse', 'warehouse name'],
  priority: ['priority'], channel: ['channel', 'source', 'order source'],
};

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const records: string[][] = [];
  let row: string[] = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { value += '"'; i++; }
      else if (c === '"') quoted = false;
      else value += c;
    } else if (c === '"' && value.length === 0) quoted = true;
    else if (c === ',') { row.push(value.trim()); value = ''; }
    else if (c === '\n') { row.push(value.trim()); records.push(row); row = []; value = ''; }
    else if (c !== '\r') value += c;
  }
  if (value.length || row.length) { row.push(value.trim()); records.push(row); }
  const headers = (records.shift() ?? []).map((h) => h.replace(/^\uFEFF/, '').trim());
  return { headers, rows: records.filter((r) => r.some((cell) => cell.trim())).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? '']))) };
}

function downloadTemplate() {
  const csv = [FIELDS.map((f) => f.label).join(','), 'WEB-1001,Alex Morgan,alex@example.com,+971500000000,MUG-001,Sample Mug,2,25.00,COD,pending,"12 Marina Road",Dubai,UAE,Main Warehouse,normal,website'].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'b2c-order-import-template.csv'; link.click(); URL.revokeObjectURL(url);
}

export function ImportOrdersModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { products, warehouses } = useWmsLookups();
  const inputRef = useRef<HTMLInputElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, string>>>({});
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [imported, setImported] = useState<number | null>(null);

  const reviewed = useMemo(() => rows.map((row) => {
    const mapped = Object.fromEntries(FIELDS.map((field) => [field.key, mapping[field.key] ? row.source[mapping[field.key]!] ?? '' : ''])) as Partial<Record<FieldKey, string>>;
    const errors: string[] = [];
    for (const field of FIELDS.filter((f) => f.required)) if (!mapped[field.key]?.trim()) errors.push(`${field.label} is required`);
    const qty = Number(mapped.quantity), price = Number(mapped.unitPrice);
    if (mapped.quantity && (!Number.isInteger(qty) || qty < 1)) errors.push('Quantity must be a positive whole number');
    if (mapped.unitPrice && (!Number.isFinite(price) || price < 0)) errors.push('Unit Price must be zero or more');
    const sku = mapped.sku?.trim().toLowerCase();
    if (sku && !products.some((p) => p.sku.toLowerCase() === sku)) errors.push(`Unknown SKU: ${mapped.sku}`);
    const method = mapped.paymentMethod?.trim().toLowerCase();
    if (method && !['cod', 'cash on delivery', 'prepaid', 'paid', 'card', 'online'].includes(method)) errors.push(`Unknown payment method: ${mapped.paymentMethod}`);
    const paymentStatus = mapped.paymentStatus?.trim().toLowerCase();
    if (paymentStatus && !['pending', 'paid', 'failed', 'refunded', 'unpaid'].includes(paymentStatus)) errors.push(`Unknown payment status: ${mapped.paymentStatus}`);
    return { ...row, mapped, errors };
  }), [rows, mapping, products]);
  const validCount = reviewed.filter((r) => r.errors.length === 0).length;
  const errorCount = reviewed.length - validCount;
  const importableRows = reviewed.filter((row) => {
    const orderNumber = row.mapped.orderNumber?.trim();
    return Boolean(orderNumber) && reviewed.filter((candidate) => candidate.mapped.orderNumber?.trim() === orderNumber).every((candidate) => candidate.errors.length === 0);
  });

  async function readFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { toast.error('Choose a CSV file.'); return; }
    try {
      const parsed = parseCsv(await file.text());
      if (parsed.headers.length < 2 || parsed.rows.length === 0) throw new Error('The CSV needs a header row and at least one order line.');
      const nextMapping: Partial<Record<FieldKey, string>> = {};
      for (const field of FIELDS) {
        const match = parsed.headers.find((header) => aliases[field.key].includes(header.trim().toLowerCase()));
        if (match) nextMapping[field.key] = match;
      }
      setHeaders(parsed.headers); setRows(parsed.rows.map((source) => ({ source, mapped: {}, errors: [] })));
      setMapping(nextMapping); setFileName(file.name); setImported(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not read this CSV file.'); }
  }

  function confirmImport() {
    const valid = importableRows;
    if (!valid.length) { toast.error('Fix the column mapping or CSV errors before importing.'); return; }
    const groups = new Map<string, typeof valid>();
    for (const item of valid) { const key = item.mapped.orderNumber!.trim(); groups.set(key, [...(groups.get(key) ?? []), item]); }
    let created = 0;
    try {
      for (const [externalNumber, lines] of groups) {
        const first = lines[0].mapped;
        const warehouse = warehouses.find((w) => w.name.toLowerCase() === first.warehouse?.trim().toLowerCase()) ?? warehouses[0];
        if (!warehouse) throw new Error('Create a warehouse before importing orders.');
        const method = first.paymentMethod!.trim().toLowerCase();
        const paymentMethod: B2CPaymentMethod = ['cod', 'cash on delivery'].includes(method) ? 'cod' : 'prepaid';
        const status = first.paymentStatus?.trim().toLowerCase();
        const paymentStatus = status === 'unpaid' ? 'pending' : ['pending', 'paid', 'failed', 'refunded'].includes(status ?? '') ? status as 'pending' | 'paid' | 'failed' | 'refunded' : paymentMethod === 'cod' ? 'pending' : 'paid';
        const channelRaw = first.channel?.trim().toLowerCase();
        const channel: B2CChannel = ['amazon', 'noon', 'website', 'marketplace', 'manual'].includes(channelRaw ?? '') ? channelRaw as B2CChannel : 'marketplace';
        const order = b2cOrderService.create({
          sourceOrderNumber: externalNumber, channel, customerName: first.customerName!.trim(), customerPhone: first.customerPhone?.trim() ?? '',
          customerAddress: [first.shippingAddress?.trim(), first.city?.trim(), first.country?.trim()].filter(Boolean).join(', '),
          warehouseId: warehouse.id, paymentMethod, paymentStatus, priority: ['low', 'normal', 'high', 'urgent'].includes(first.priority?.trim().toLowerCase() ?? '') ? first.priority!.trim().toLowerCase() as 'low' | 'normal' | 'high' | 'urgent' : 'normal',
          orderDate: new Date().toISOString().slice(0, 10), currency: 'USD',
          items: lines.map(({ mapped }) => { const product = products.find((p) => p.sku.toLowerCase() === mapped.sku!.trim().toLowerCase())!; return { productId: product.id, quantity: Number(mapped.quantity), unitPrice: Number(mapped.unitPrice) }; }),
        });
        if (order) created++;
      }
      setImported(created);
      toast.success(`${created} order${created === 1 ? '' : 's'} imported into B2C.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Import failed.'); }
  }

  function close() { onOpenChange(false); setHeaders([]); setRows([]); setMapping({}); setFileName(''); setImported(null); }
  return <Dialog open={open} onOpenChange={(value) => value ? onOpenChange(true) : close()}>
    <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-5xl overflow-y-auto p-5 sm:p-6">
      <DialogHeader><DialogTitle>Import B2C Orders</DialogTitle><DialogDescription>Upload a CSV, map its columns, review validation, then import valid order lines into the shared B2C workflow.</DialogDescription></DialogHeader>
      {imported !== null ? <div className="flex flex-col items-center gap-3 py-8 text-center"><CheckCircle2 className="h-10 w-10 text-green-600" /><p className="font-semibold">{imported} orders added to the current session</p><p className="text-sm text-gray-500">They are available in Orders and Allocation. Refreshing the browser clears these temporary records.</p></div> : <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-[#f8faf9] p-4"><div><p className="font-medium">Start with the CSV template</p><p className="mt-1 text-sm text-gray-500">One row per item. Rows with the same Order Number become one order.</p></div><Button variant="outline" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" />Download Import Template</Button></div>
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => readFile(event.target.files?.[0])} />
        <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files[0]); }} className={`flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed p-7 text-center ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}><FileUp className="h-8 w-8 text-gray-500" /><span className="font-medium">{fileName || 'Choose a CSV file or drag it here'}</span><span className="text-sm text-gray-500">CSV files are parsed locally in your browser.</span><span className="inline-flex items-center text-sm text-blue-700"><Upload className="mr-1 h-4 w-4" />Select CSV</span></button>
        {headers.length > 0 && <>
          <section className="space-y-3"><div><h3 className="font-semibold">Map CSV columns</h3><p className="text-sm text-gray-500">Required fields are marked. Column names are matched automatically when possible.</p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{FIELDS.map((field) => <div className="space-y-1.5" key={field.key}><Label>{field.label}{field.required ? ' *' : ''}</Label><Select value={mapping[field.key] ?? '__skip'} onValueChange={(value) => setMapping((prev) => ({ ...prev, [field.key]: value === '__skip' ? undefined : value }))}><SelectTrigger><SelectValue placeholder="Choose column" /></SelectTrigger><SelectContent><SelectItem value="__skip">Not mapped</SelectItem>{headers.map((header) => <SelectItem key={`${field.key}-${header}`} value={header}>{header}</SelectItem>)}</SelectContent></Select></div>)}</div></section>
          <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">Review rows</h3><p className="text-sm text-gray-500">{validCount} valid row(s), {errorCount} with errors, {reviewed.length} total. {new Set(importableRows.map((r) => r.mapped.orderNumber)).size} complete order(s) ready.</p></div>{errorCount > 0 && <span className="text-sm text-amber-700">An order is skipped if any of its lines has an error.</span>}</div><div className="max-h-64 overflow-auto rounded-md border"><table className="min-w-[820px] text-left text-sm"><thead className="sticky top-0 bg-[#f8faf9]"><tr>{['Order', 'Customer', 'SKU', 'Qty', 'Unit Price', 'Result'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y">{reviewed.map((r, i) => <tr key={i}><td className="px-3 py-2">{r.mapped.orderNumber || '—'}</td><td className="px-3 py-2">{r.mapped.customerName || '—'}</td><td className="px-3 py-2">{r.mapped.sku || '—'}</td><td className="px-3 py-2">{r.mapped.quantity || '—'}</td><td className="px-3 py-2">{r.mapped.unitPrice || '—'}</td><td className="px-3 py-2">{r.errors.length ? <span className="text-red-700" title={r.errors.join('; ')}>{r.errors.join('; ')}</span> : <span className="text-green-700">Ready</span>}</td></tr>)}</tbody></table></div></section>
        </>}
      </div>}
      <DialogFooter className="gap-2 sm:justify-between">{imported === null ? <><Button variant="outline" onClick={close}><X className="mr-1 h-4 w-4" />Cancel</Button><Button onClick={confirmImport} disabled={!importableRows.length}>Confirm Import ({new Set(importableRows.map((r) => r.mapped.orderNumber)).size} orders)</Button></> : <Button onClick={close}>Done</Button>}</DialogFooter>
    </DialogContent>
  </Dialog>;
}
