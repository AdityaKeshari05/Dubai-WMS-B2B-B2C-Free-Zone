'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const reportTypes = [
  ['open-order-book', 'Open order book'], ['quotation-conversion', 'Quotation conversion'],
  ['delivery-performance', 'Delivery performance'], ['price-variance', 'Price variance'],
  ['gross-margin', 'Gross margin'], ['performance', 'Customer / territory performance'],
  ['backorders', 'Backorders'], ['order-ageing', 'Sales order ageing'],
];

function JsonTable({ rows }: { rows: any[] }) {
  if (!rows.length) return <p className="py-8 text-center text-sm text-gray-500">No records found.</p>;
  const columns = Object.keys(rows[0]).filter(k => !Array.isArray(rows[0][k]) && typeof rows[0][k] !== 'object').slice(0, 8);
  return <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-gray-50">{columns.map(c => <th key={c} className="p-2 text-left font-medium">{c.replace(/([A-Z])/g, ' $1')}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || index} className="border-b">{columns.map(c => <td key={c} className="max-w-56 truncate p-2">{String(row[c] ?? '—')}</td>)}</tr>)}</tbody></table></div>;
}

export function SalesEnquiriesPage() {
  const [rows, setRows] = useState<any[]>([]), [customers, setCustomers] = useState<any[]>([]), [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ customerId: '', productId: '', requirements: '', targetQty: '1', targetPrice: '', targetDate: '' });
  const load = () => api.get('/sales/enquiries').then(r => setRows(r.data?.data?.items || [])).catch(e => showApiError(e, 'Could not load enquiries'));
  useEffect(() => { load(); Promise.all([api.get('/customers?limit=100'), api.get('/inventory/products?limit=100')]).then(([c, p]) => { setCustomers(c.data?.data?.items || c.data?.data || []); setProducts(p.data?.data?.items || p.data?.data || []); }).catch(() => undefined); }, []);
  const create = async () => { try { await api.post('/sales/enquiries', { customerId: form.customerId, requirements: form.requirements, targetDate: form.targetDate || undefined, items: [{ productId: form.productId, targetQty: Number(form.targetQty), targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined }] }); showApiSuccess('Sales enquiry created'); load(); } catch (e) { showApiError(e, 'Could not create enquiry'); } };
  const act = async (id: string, action: 'submit' | 'convert-to-quotation') => { try { await api.post(`/sales/enquiries/${id}/${action}`); showApiSuccess(action === 'submit' ? 'Enquiry submitted' : 'Quotation created'); load(); } catch (e) { showApiError(e, 'Operation failed'); } };
  return <div><PageHeader title="Sales Enquiries" description="Customer requirements and target quantity, date and price before quotation" />
    <Card className="mb-5"><CardHeader><CardTitle>New enquiry</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">
      <select className="h-10 rounded-md border px-3" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}><option value="">Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select className="h-10 rounded-md border px-3" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}><option value="">Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <Input placeholder="Requirements" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
      <Input type="number" min="0.000001" placeholder="Target quantity" value={form.targetQty} onChange={e => setForm({ ...form, targetQty: e.target.value })} />
      <Input type="number" min="0" placeholder="Target price" value={form.targetPrice} onChange={e => setForm({ ...form, targetPrice: e.target.value })} />
      <Input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
      <Button disabled={!form.customerId || !form.productId} onClick={create}>Create enquiry</Button>
    </CardContent></Card>
    <Card><CardContent className="pt-6"><div className="space-y-3">{rows.map(row => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-mono font-semibold text-blue-600">{row.enquiryNo}</p><p className="text-sm text-gray-500">{row.customer?.name} · {row.status} · {row.requirements || 'No requirements note'}</p></div><div className="flex gap-2">{row.status === 'DRAFT' && <Button size="sm" onClick={() => act(row.id, 'submit')}>Submit</Button>}{row.status === 'SUBMITTED' && <Button size="sm" onClick={() => act(row.id, 'convert-to-quotation')}>Create quotation</Button>}</div></div>)}{!rows.length && <p className="py-8 text-center text-sm text-gray-500">No enquiries yet.</p>}</div></CardContent></Card>
  </div>;
}

export function SalesFulfilmentPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/sales/fulfilment-dashboard').then(r => setRows(r.data?.data || [])).catch(e => showApiError(e, 'Could not load fulfilment')); }, []);
  return <div><PageHeader title="Sales Fulfilment" description="Ordered, reserved, produced, delivered, invoiced and backordered quantities" /><Card><CardContent className="pt-6"><JsonTable rows={rows.map(r => ({ orderNo: r.orderNo, customer: r.customer?.name, status: r.status, orderedQty: r.orderedQty, producedQty: r.producedQty, deliveredQty: r.deliveredQty, invoicedQty: r.invoicedQty, backorderQty: r.backorderQty, creditStatus: r.creditStatus }))} /></CardContent></Card></div>;
}

export function SalesReportsPage() {
  const [type, setType] = useState(reportTypes[0][0]), [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get(`/sales/reports/${type}`).then(r => setRows(Array.isArray(r.data?.data) ? r.data.data : [r.data?.data])).catch(e => showApiError(e, 'Could not load report')); }, [type]);
  return <div><PageHeader title="Sales Reports" description="Conversion, delivery, margin, variance, backorder, performance and ageing" /><div className="mb-4 flex flex-wrap gap-2">{reportTypes.map(([key, label]) => <Button key={key} size="sm" variant={type === key ? 'default' : 'outline'} onClick={() => setType(key)}>{label}</Button>)}</div><Card><CardHeader><CardTitle>{reportTypes.find(r => r[0] === type)?.[1]}</CardTitle></CardHeader><CardContent><JsonTable rows={rows} /></CardContent></Card></div>;
}

export function SalesConfigurationPage() {
  const sections = [
    ['Pricing engine', 'Contract, customer-group, territory/channel and general prices; quantity breaks, UOM, promotions and margin approval.', '/inventory/pricing'],
    ['Credit control', 'Maintain customer limits, credit days and hold state. Exposure is enforced when an order is submitted.', '/customers'],
    ['Tax templates', 'Configure HSN/tax templates. Sales documents store branch, place-of-supply, GST mode and address snapshots.', '/invoicing/tax-templates'],
    ['Approvals', 'Discount, margin and credit exceptions use the platform approval engine.', '/settings'],
  ];
  return <div><PageHeader title="Sales Configuration" description="Masters and policies used by the end-to-end sales lifecycle" /><div className="grid gap-4 md:grid-cols-2">{sections.map(([title, text, href]) => <Card key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-gray-600">{text}</p><Button asChild variant="outline"><Link href={href}>Open configuration</Link></Button></CardContent></Card>)}</div></div>;
}
