'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { returnService } from '@/lib/wms/services/returnService';
import type { B2COrder, Product } from '@/types';

const REASONS = ['Wrong item received', 'Item defective', 'No longer needed', 'Better price found', 'Size/fit issue', 'Other'];

export function CreateReturnModal({ open, onOpenChange, order, products }: { open: boolean; onOpenChange: (open: boolean) => void; order: B2COrder; products: Product[] }) {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const [productId, setProductId] = useState(order.items[0]?.productId ?? '');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState(REASONS[0]);
  const [condition, setCondition] = useState<'good' | 'damaged'>('good');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const ret = returnService.createReturn({ orderId: order.id, orderType: 'b2c', customerName: order.customerName, items: [{ productId, quantity, reason, condition }] });
      toast.success(`${ret.returnNumber} created`);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Create Return</DialogTitle></DialogHeader>
        <div className="space-y-1">
          <Label>Product</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{order.items.map((i) => <SelectItem key={i.productId} value={i.productId}>{productMap.get(i.productId)?.name ?? i.productId}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Quantity</Label><Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></div>
          <div className="space-y-1">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as 'good' | 'damaged')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="good">Good</SelectItem><SelectItem value="damaged">Damaged</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label>Reason</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Request Return</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
