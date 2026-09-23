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
import { b2cOrderService } from '@/lib/wms/services/b2cOrderService';
import { formatCurrency } from '@/lib/utils';
import type { B2CChannel } from '@/types';

interface DraftLine {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export function CreateB2COrderModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { products, warehouses, customers } = useWmsLookups();

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [channel, setChannel] = useState<B2CChannel>('website');
  const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod'>('prepaid');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [warehouseId, setWarehouseId] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([{ productId: '', quantity: 1, unitPrice: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  function applyCustomer(id: string) {
    setCustomerId(id);
    const c = customers.find((x) => x.id === id);
    if (c) {
      setCustomerName(c.name);
      setCustomerPhone(c.phone ?? '');
      setCustomerAddress([c.address, c.city].filter(Boolean).join(', '));
    }
  }
  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0 }]);
  }
  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  async function handleSubmit() {
    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (lines.some((line) => line.productId && (!Number.isInteger(line.quantity) || line.quantity < 1 || line.unitPrice < 0))) {
      toast.error('Each product needs a positive whole quantity and a non-negative unit price.');
      return;
    }
    if (!customerName || !warehouseId || validLines.length === 0) {
      toast.error('Enter customer details and at least one product line.');
      return;
    }
    setSubmitting(true);
    try {
      const order = b2cOrderService.create({
        channel,
        customerName,
        customerPhone,
        customerAddress,
        warehouseId,
        paymentMethod,
        priority,
        orderDate: new Date().toISOString().slice(0, 10),
        currency: 'USD',
        items: validLines,
      });
      toast.success(`${order.orderNumber} has been created`);
      onOpenChange(false);
      router.push(`/b2c/${order.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl">
        <DialogHeader><DialogTitle>Create B2C Order</DialogTitle></DialogHeader>

        <div className="space-y-1.5">
          <Label>Quick-fill Customer (optional)</Label>
          <Select value={customerId} onValueChange={applyCustomer}>
            <SelectTrigger><SelectValue placeholder="Custom / new customer" /></SelectTrigger>
            <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Customer Name</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" /></div>
        </div>
        <div className="space-y-1.5">
          <Label>Delivery Address</Label>
          <Textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Full address" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as B2CChannel)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="noon">Noon</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Payment</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'prepaid' | 'cod')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="prepaid">Prepaid</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fulfilling Warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
              <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>Line Items</Label>
          <Button size="sm" variant="outline" onClick={addLine}><Plus className="mr-1 h-3.5 w-3.5" />Add Line</Button>
        </div>
        <div className="overflow-x-auto rounded-md border border-[#e5e2dc]">
          <table className="min-w-[600px] text-sm sm:min-w-full">
            <thead className="bg-[#f8faf9] text-xs text-gray-500">
              <tr><th className="px-4 py-3 text-left">Product</th><th className="px-3 py-3 text-right">Qty</th><th className="px-3 py-3 text-right">Unit Price</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3"></th></tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <Select value={line.productId} onValueChange={(v) => { const p = products.find((x) => x.id === v); updateLine(idx, { productId: v, unitPrice: p?.salePrice ?? 0 }); }}>
                      <SelectTrigger className="min-w-44"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-3"><Input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })} className="w-16 text-right" /></td>
                  <td className="px-3 py-3"><Input type="number" min={0} value={line.unitPrice} onChange={(e) => updateLine(idx, { unitPrice: Number(e.target.value) })} className="w-24 text-right" /></td>
                  <td className="px-3 py-3 text-right font-medium text-gray-900">{formatCurrency(line.quantity * line.unitPrice)}</td>
                  <td className="px-3 py-3"><button onClick={() => removeLine(idx)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-right text-sm font-semibold text-gray-900">Order Total: {formatCurrency(total)}</div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
