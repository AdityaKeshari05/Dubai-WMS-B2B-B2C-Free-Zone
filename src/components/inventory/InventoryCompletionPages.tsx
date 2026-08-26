'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { showApiError, showApiSuccess } from '@/lib/apiError';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function Grid({ rows }: { rows: any[] }) {
  if (!rows.length) return <p className="py-8 text-center text-sm text-gray-500">No records found.</p>;
  const columns = Object.keys(rows[0]).filter(k => !Array.isArray(rows[0][k]) && typeof rows[0][k] !== 'object').slice(0, 9);
  return <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-gray-50">{columns.map(c => <th className="p-2 text-left" key={c}>{c.replace(/([A-Z])/g, ' $1')}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr className="border-b" key={r.id || i}>{columns.map(c => <td className="max-w-48 truncate p-2" key={c}>{String(r[c] ?? '—')}</td>)}</tr>)}</tbody></table></div>;
}

export function ReconciliationsPage() {
  const [rows, setRows] = useState<any[]>([]), [warehouses, setWarehouses] = useState<any[]>([]), [warehouseId, setWarehouseId] = useState(''), [blindCount, setBlindCount] = useState(false);
  const load = () => api.get('/inventory/reconciliations').then(r => setRows(r.data?.data?.items || [])).catch(e => showApiError(e, 'Could not load reconciliations'));
  useEffect(() => { load(); api.get('/inventory/warehouses').then(r => setWarehouses(r.data?.data || [])); }, []);
  const create = async () => { try { await api.post('/inventory/reconciliations', { warehouseId, blindCount }); showApiSuccess('Reconciliation created'); load(); } catch (e) { showApiError(e, 'Could not create reconciliation'); } };
  const act = async (id: string, action: string) => { try { await api.post(`/inventory/reconciliations/${id}/${action}`); showApiSuccess(`Reconciliation ${action} completed`); load(); } catch (e) { showApiError(e, 'Operation failed'); } };
  const template = async (id: string) => { try { const r = await api.get(`/inventory/reconciliations/${id}/template`); const a = document.createElement('a'); a.href = r.data.data.content; a.download = r.data.data.fileName; a.click(); } catch (e) { showApiError(e, 'Could not download template'); } };
  const upload = async (id: string, file?: File) => {
    if (!file) return;
    try {
      const lines = (await file.text()).split(/\r?\n/).slice(1).filter(Boolean);
      const items = lines.map(line => { const cells = [...line.matchAll(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)].map(match => match[1].replace(/^"|"$/g, '').replace(/""/g, '"')); return { itemId: cells[0], countedQty: Number(cells[4]) }; }).filter(item => item.itemId && Number.isFinite(item.countedQty));
      await api.post(`/inventory/reconciliations/${id}/counts`, { items });
      showApiSuccess('Count file uploaded and variances calculated'); load();
    } catch (e) { showApiError(e, 'Could not upload count file'); }
  };
  return <div><PageHeader title="Stock Reconciliation" description="Blind physical counts, warehouse freeze, variance approval and immutable adjustments" /><Card className="mb-4"><CardContent className="flex flex-wrap items-center gap-3 pt-6"><select className="h-10 rounded-md border px-3" value={warehouseId} onChange={e => setWarehouseId(e.target.value)}><option value="">Warehouse</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={blindCount} onChange={e => setBlindCount(e.target.checked)} /> Blind count</label><Button disabled={!warehouseId} onClick={create}>Create count</Button></CardContent></Card><div className="space-y-3">{rows.map(r => <Card key={r.id}><CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6"><div><p className="font-mono font-semibold">{r.reconciliationNo}</p><p className="text-sm text-gray-500">{r.warehouse?.name} · {r.status} · {r.items?.length || 0} rows</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => template(r.id)}>Template</Button>{r.status === 'COUNTING' && <label className="inline-flex h-9 cursor-pointer items-center rounded-md border px-3 text-sm font-medium">Upload counts<input type="file" accept=".csv,text/csv" className="hidden" onChange={e => upload(r.id, e.target.files?.[0])} /></label>}{r.status === 'DRAFT' && <Button size="sm" onClick={() => act(r.id, 'start')}>Start & freeze</Button>}{r.status === 'PENDING_APPROVAL' && <Button size="sm" onClick={() => act(r.id, 'approve')}>Approve</Button>}{r.status === 'APPROVED' && <Button size="sm" onClick={() => act(r.id, 'submit')}>Post adjustment</Button>}</div></CardContent></Card>)}</div></div>;
}

export function TransfersPage() {
  const [rows, setRows] = useState<any[]>([]), [warehouses, setWarehouses] = useState<any[]>([]), [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ sourceWarehouseId: '', destinationWarehouseId: '', transitWarehouseId: '', productId: '', quantity: '1', transporter: '', vehicleNo: '' });
  const [editingTransfer, setEditingTransfer] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => api.get('/inventory/transfer-orders').then(r => setRows(r.data?.data || [])).catch(e => showApiError(e, 'Could not load transfers'));
  useEffect(() => { load(); Promise.all([api.get('/inventory/warehouses'), api.get('/inventory/products?limit=200')]).then(([w, p]) => { setWarehouses(w.data?.data || []); setProducts(p.data?.data?.items || []); }); }, []);
  
  const create = async () => {
    try {
      await api.post('/inventory/transfer-orders', { ...form, items: [{ productId: form.productId, quantity: Number(form.quantity) }] });
      showApiSuccess('Transfer order created');
      setForm({ sourceWarehouseId: '', destinationWarehouseId: '', transitWarehouseId: '', productId: '', quantity: '1', transporter: '', vehicleNo: '' });
      load();
    } catch (e) {
      showApiError(e, 'Could not create transfer');
    }
  };

  const handleOpenEdit = (transfer: any) => {
    setEditingTransfer(transfer);
    const firstItem = transfer.items?.[0];
    setForm({
      sourceWarehouseId: transfer.sourceWarehouseId || '',
      destinationWarehouseId: transfer.destinationWarehouseId || '',
      transitWarehouseId: transfer.transitWarehouseId || '',
      productId: firstItem?.productId || '',
      quantity: String(firstItem?.quantity || '1'),
      transporter: transfer.transporter || '',
      vehicleNo: transfer.vehicleNo || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingTransfer || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.put(`/inventory/transfer-orders/${editingTransfer.id}`, {
        ...form,
        items: [{ productId: form.productId, quantity: Number(form.quantity) }],
      });
      showApiSuccess('Transfer order updated');
      setIsEditOpen(false);
      setEditingTransfer(null);
      load();
    } catch (e) {
      showApiError(e, 'Could not update transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this draft transfer order?')) return;
    try {
      await api.delete(`/inventory/transfer-orders/${id}`);
      showApiSuccess('Transfer order deleted');
      load();
    } catch (e) {
      showApiError(e, 'Could not delete transfer order');
    }
  };

  const act = async (id: string, operation: string) => {
    try {
      await api.post(`/inventory/transfer-orders/${id}/${operation}`, operation === 'receive' ? { items: rows.find(r => r.id === id)?.items.map((i: any) => ({ id: i.id, quantity: Number(i.dispatchedQty) - Number(i.receivedQty) })) } : {});
      showApiSuccess(`Transfer ${operation} completed`);
      load();
    } catch (e) {
      showApiError(e, 'Transfer operation failed');
    }
  };

  return (
    <div>
      <PageHeader title="Transfer Orders" description="Same-plant transfers and cross-plant dispatch through goods in transit" />
      <Card className="mb-4">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-3">
          {(['sourceWarehouseId', 'destinationWarehouseId', 'transitWarehouseId'] as const).map((key, index) => (
            <select key={key} className="h-10 rounded-md border px-3" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}>
              <option value="">{['Source warehouse', 'Destination warehouse', 'Transit warehouse (cross-plant)'][index]}</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          ))}
          <select className="h-10 rounded-md border px-3" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}>
            <option value="">Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Input type="number" min="0.000001" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          <Input placeholder="Transporter" value={form.transporter} onChange={e => setForm({ ...form, transporter: e.target.value })} />
          <Button onClick={create} disabled={!form.sourceWarehouseId || !form.destinationWarehouseId || !form.productId}>Create transfer</Button>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        {rows.map(r => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div>
                <p className="font-mono font-semibold">{r.transferNo}</p>
                <p className="text-sm text-gray-500">{r.sourceWarehouse?.name} → {r.transitWarehouse?.name ? `${r.transitWarehouse.name} → ` : ''}{r.destinationWarehouse?.name} · {r.status}</p>
              </div>
              <div className="flex items-center gap-2">
                {r.status === 'DRAFT' && (
                  <>
                    <Button size="sm" onClick={() => act(r.id, 'submit')}>Submit</Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600" title="Edit Transfer" onClick={() => handleOpenEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-red-600" title="Delete Transfer" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {r.status === 'SUBMITTED' && <Button size="sm" onClick={() => act(r.id, 'dispatch')}>Dispatch</Button>}
                {['IN_TRANSIT', 'PARTIALLY_RECEIVED'].includes(r.status) && <Button size="sm" onClick={() => act(r.id, 'receive')}>Receive remaining</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Draft Transfer Order ({editingTransfer?.transferNo})</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 pt-4 md:grid-cols-2">
            <select className="h-10 rounded-md border px-3" value={form.sourceWarehouseId} onChange={e => setForm({ ...form, sourceWarehouseId: e.target.value })}>
              <option value="">Source warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3" value={form.destinationWarehouseId} onChange={e => setForm({ ...form, destinationWarehouseId: e.target.value })}>
              <option value="">Destination warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3" value={form.transitWarehouseId} onChange={e => setForm({ ...form, transitWarehouseId: e.target.value })}>
              <option value="">Transit warehouse (optional)</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}>
              <option value="">Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Input type="number" min="0.000001" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            <Input placeholder="Transporter" value={form.transporter} onChange={e => setForm({ ...form, transporter: e.target.value })} />
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={isSubmitting || !form.sourceWarehouseId || !form.destinationWarehouseId || !form.productId}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const reports = [['reorder', 'Reorder'], ['stock-ageing', 'Stock ageing'], ['batch-expiry', 'Batch expiry'], ['warehouse-bin-balance', 'Warehouse / bin balance'], ['stock-out-history', 'Stock-out history'], ['dead-stock', 'Dead stock'], ['transfers-in-transit', 'Transfers in transit'], ['reconciliation-variance', 'Reconciliation variance'], ['ledger-consistency', 'Ledger consistency']];
export function InventoryAdvancedReportsPage() { const [type, setType] = useState('reorder'), [data, setData] = useState<any>([]); useEffect(() => { api.get(`/inventory/reports/advanced/${type}`).then(r => setData(r.data?.data)).catch(e => showApiError(e, 'Could not load report')); }, [type]); const rows = Array.isArray(data) ? data : data?.errors || []; return <div><PageHeader title="Inventory Monitoring" description="Reorder, ageing, expiry, traceability, in-transit and ledger integrity" /><div className="mb-4 flex flex-wrap gap-2">{reports.map(([k, l]) => <Button size="sm" variant={type === k ? 'default' : 'outline'} key={k} onClick={() => setType(k)}>{l}</Button>)}</div><Card><CardHeader><CardTitle>{reports.find(r => r[0] === type)?.[1]}</CardTitle></CardHeader><CardContent>{type === 'ledger-consistency' && data?.healthy && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">Stock levels, ledger totals and valuation layers are consistent.</p>}<Grid rows={rows} /></CardContent></Card></div>; }

export function TraceabilityPage() { const [batchId, setBatchId] = useState(''), [batches, setBatches] = useState<any[]>([]), [data, setData] = useState<any>(null); useEffect(() => { api.get('/inventory/batches').then(r => setBatches(r.data?.data || [])); }, []); const trace = () => api.get(`/inventory/traceability/batches/${batchId}`).then(r => setData(r.data.data)).catch(e => showApiError(e, 'Could not trace batch')); return <div><PageHeader title="Batch & Serial Traceability" description="Backward raw-material/vendor trace and forward finished-batch/customer trace" /><Card className="mb-4"><CardContent className="flex gap-3 pt-6"><select className="h-10 flex-1 rounded-md border px-3" value={batchId} onChange={e => setBatchId(e.target.value)}><option value="">Select batch</option>{batches.map(b => <option value={b.id} key={b.id}>{b.batchNo} · {b.product?.name}</option>)}</select><Button disabled={!batchId} onClick={trace}>Trace</Button></CardContent></Card>{data && <div className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle>Backward trace</CardTitle></CardHeader><CardContent><pre className="overflow-auto text-xs">{JSON.stringify(data.backward, null, 2)}</pre></CardContent></Card><Card><CardHeader><CardTitle>Forward trace</CardTitle></CardHeader><CardContent><pre className="overflow-auto text-xs">{JSON.stringify(data.forward, null, 2)}</pre></CardContent></Card></div>}</div>; }

export function InventoryConfigurationPage() { const cards = [['Item masters', 'HSN, item nature, shelf life, inspection stages, batch/serial strategy, backflush, drawing/revision and accounting defaults.', '/inventory/products'], ['Warehouse structure', 'Plant linkage, stores/WIP/FG/QC/rejected/scrap/transit/job-worker types, location hierarchy and count freeze.', '/inventory/warehouses'], ['UOM and pricing', 'Stock UOM, alternate UOM conversions, price lists and product-specific conversion factors.', '/inventory/pricing'], ['Material requests', 'Demand-driven issue, purchasing and manufacturing flow with partial quantities.', '/procurement/material-requests']]; return <div><PageHeader title="Inventory Configuration" description="Masters and policies controlling stock, valuation, replenishment and traceability" /><div className="grid gap-4 md:grid-cols-2">{cards.map(([title, text, href]) => <Card key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-gray-600">{text}</p><Button asChild variant="outline"><Link href={href}>Open</Link></Button></CardContent></Card>)}</div></div>; }
