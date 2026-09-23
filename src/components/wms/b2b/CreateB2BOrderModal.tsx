'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { b2bOrderService } from '@/lib/wms/services/b2bOrderService';
import { formatCurrency } from '@/lib/utils';

interface DraftLine {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export function CreateB2BOrderModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { products, warehouses, customers } = useWmsLookups();
  const skuMappings = useWmsDbSelector((s) => s.customerSkuMappings);
  const pricing = useWmsDbSelector((s) => s.customerPricing);

  const [customerId, setCustomerId] = useState('');
  const [customerPO, setCustomerPO] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  function priceFor(productId: string) {
    const custom = pricing.find((p) => p.customerId === customerId && p.productId === productId);
    if (custom) return custom.price;
    return products.find((p) => p.id === productId)?.salePrice ?? 0;
  }
  function skuFor(productId: string) {
    return skuMappings.find((m) => m.customerId === customerId && m.productId === productId)?.customerSku;
  }
  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  }
  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (1 - l.discount / 100), 0);

  async function handleSubmit() {
    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (!customerId || !warehouseId || validLines.length === 0) {
      toast.error('Select a customer, warehouse and at least one product line.');
      return;
    }
    setSubmitting(true);
    try {
      const order = b2bOrderService.create({
        customerId,
        customerPO,
        orderDate: new Date().toISOString().slice(0, 10),
        expectedDelivery: expectedDelivery || new Date().toISOString().slice(0, 10),
        priority,
        deliveryAddress,
        warehouseId,
        currency: customers.find((c) => c.id === customerId)?.currency || 'USD',
        items: validLines.map((l) => ({ productId: l.productId, customerSku: skuFor(l.productId), quantity: l.quantity, unitPrice: l.unitPrice, discount: l.discount })),
      });
      toast.success(`${order.orderNumber} created as a draft`);
      onOpenChange(false);
      router.push(`/wms/b2b/${order.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>Create B2B Order</DialogTitle></DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>{customers.filter(c => c.type === 'b2b').map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Customer PO Number</Label>
            <Input value={customerPO} onChange={(e) => setCustomerPO(e.target.value)} placeholder="PO-XXXX" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Expected Delivery</Label>
            <Input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Fulfilling Warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
              <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Delivery Address</Label>
          <Textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Full delivery address" />
        </div>

        <div className="mb-1 flex items-center justify-between">
          <Label>Line Items</Label>
          <Button size="sm" variant="outline" onClick={addLine}><Plus className="mr-1 h-3.5 w-3.5" />Add Line</Button>
        </div>
        <div className="overflow-hidden rounded-md border border-[#e5e2dc]">
          <table className="w-full text-sm">
            <thead className="bg-[#f8faf9] text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Customer SKU</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit Price</th>
                <th className="px-3 py-2 text-right">Disc %</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <Select value={line.productId} onValueChange={(v) => updateLine(idx, { productId: v, unitPrice: priceFor(v) })}>
                      <SelectTrigger className="min-w-44"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">{skuFor(line.productId) ?? '-'}</td>
                  <td className="px-3 py-2"><Input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })} className="w-16 text-right" /></td>
                  <td className="px-3 py-2"><Input type="number" min={0} value={line.unitPrice} onChange={(e) => updateLine(idx, { unitPrice: Number(e.target.value) })} className="w-24 text-right" /></td>
                  <td className="px-3 py-2"><Input type="number" min={0} max={100} value={line.discount} onChange={(e) => updateLine(idx, { discount: Number(e.target.value) })} className="w-16 text-right" /></td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(line.quantity * line.unitPrice * (1 - line.discount / 100))}</td>
                  <td className="px-2 py-2"><button onClick={() => removeLine(idx)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-right text-sm font-semibold text-gray-900">Order Total: {formatCurrency(total)}</div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
