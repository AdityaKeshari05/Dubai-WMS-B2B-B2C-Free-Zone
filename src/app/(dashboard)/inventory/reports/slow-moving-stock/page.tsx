'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { Product, Warehouse } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SlowMovingStockPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [days, setDays] = useState(90);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productId: '', warehouseId: '', quantity: 1, reservedQty: 0 });

  const totals = useMemo(() => rows.reduce((acc, row) => ({ items: acc.items + 1, quantity: acc.quantity + Number(row.quantity || 0) }), { items: 0, quantity: 0 }), [rows]);

  const load = async () => {
    const [reportRes, productRes, warehouseRes] = await Promise.all([
      api.get('/inventory/reports/slow-moving-stock', { params: { days } }),
      api.get('/inventory/products', { params: { limit: 500, type: 'PRODUCT' } }),
      api.get('/inventory/warehouses'),
    ]);
    setRows(reportRes.data.data || []);
    setProducts(productRes.data.data.items || []);
    setWarehouses(warehouseRes.data.data || []);
  };

  useEffect(() => { load().catch(() => toast.error('Failed to load slow moving stock')); }, [days]);

  const createManualStock = async () => {
    if (!form.productId || !form.warehouseId) return toast.error('Select product and warehouse');
    try {
      await api.post('/inventory/reports/slow-moving-stock/manual', form);
      toast.success('Stock level updated');
      setOpen(false);
      setForm({ productId: '', warehouseId: '', quantity: 1, reservedQty: 0 });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update stock level');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Slow Moving Stock" description="Items with stock on hand but no issue movement during the selected period" action={{ label: 'Manual Stock Level', onClick: () => setOpen(true), icon: Plus }} />
      <Card>
        <CardContent className="grid gap-3 pt-4 md:grid-cols-[1.4fr_1fr_1fr_180px]">
          <Logic label="Logic" value={`Quantity > 0 and no stock issue in last ${days} days`} />
          <Logic label="Items" value={totals.items.toLocaleString()} />
          <Logic label="Qty On Hand" value={totals.quantity.toLocaleString()} />
          <div className="space-y-1.5">
            <Label>Threshold Days</Label>
            <Input type="number" min={1} value={days} onChange={(event) => setDays(Number(event.target.value || 90))} />
          </div>
        </CardContent>
      </Card>
      <DataTable data={rows} columns={[
        { key: 'sku', header: 'SKU', render: (row: any) => <span className="font-mono text-xs">{row.sku}</span> },
        { key: 'productName', header: 'Item' },
        { key: 'warehouse', header: 'Warehouse' },
        { key: 'quantity', header: 'Qty' },
        { key: 'lastIssueDate', header: 'Last Issue', render: (row: any) => row.lastIssueDate ? new Date(row.lastIssueDate).toLocaleDateString() : 'Never' },
        { key: 'ageDays', header: 'Age Days', render: (row: any) => row.ageDays ?? 'No issue' },
      ]} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Manual Stock Level</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              This updates real product stock in a warehouse. The item appears here only if it has quantity on hand and no issue movement within the report threshold.
            </div>
            <Field label="Product">
              <Select value={form.productId} onValueChange={(productId) => setForm((prev) => ({ ...prev, productId }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.sku} - {product.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Warehouse">
              <Select value={form.warehouseId} onValueChange={(warehouseId) => setForm((prev) => ({ ...prev, warehouseId }))}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>{warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Quantity On Hand">
                <Input type="number" min="0.000001" step="0.000001" value={form.quantity} onChange={(event) => setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))} />
              </Field>
              <Field label="Reserved Qty">
                <Input type="number" min="0" step="0.000001" value={form.reservedQty} onChange={(event) => setForm((prev) => ({ ...prev, reservedQty: Number(event.target.value) }))} />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={createManualStock}>Save Stock Level</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Logic({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-[#6b7280]">{label}</p><p className="mt-1 text-sm font-semibold text-[#1f2937]">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
