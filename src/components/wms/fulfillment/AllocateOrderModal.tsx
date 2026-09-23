'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { allocationService, type OrderType } from '@/lib/wms/services/allocationService';
import { inventoryService } from '@/lib/wms/inventoryService';
import { showApiError } from '@/lib/apiError';
import type { AllocationStrategy, Product } from '@/types';

export function AllocateOrderModal({
  open,
  onOpenChange,
  orderId,
  orderType,
  warehouseId,
  items,
  products,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderType: OrderType;
  warehouseId: string;
  items: { productId: string; quantity: number; allocatedQty: number }[];
  products: Product[];
}) {
  const [strategy, setStrategy] = useState<AllocationStrategy>('FEFO');
  const [submitting, setSubmitting] = useState(false);

  const pending = items.filter((i) => i.quantity - i.allocatedQty > 0);
  const productMap = new Map(products.map((p) => [p.id, p]));

  async function handleConfirm() {
    setSubmitting(true);
    try {
      allocationService.allocateOrder(orderId, orderType, strategy);
      toast.success(`Inventory allocated using ${strategy} strategy`);
      onOpenChange(false);
    } catch (err) {
      showApiError(err, 'Allocation failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Allocate Inventory</DialogTitle>
          <DialogDescription>Reserve stock against this order&apos;s line items</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Label>Allocation Strategy</Label>
          <Select value={strategy} onValueChange={(v) => setStrategy(v as AllocationStrategy)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FEFO">FEFO — First Expired, First Out</SelectItem>
              <SelectItem value="FIFO">FIFO — First In, First Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {pending.map((item) => {
            const product = productMap.get(item.productId);
            const remaining = item.quantity - item.allocatedQty;
            const preview = inventoryService.previewAllocationBatches(item.productId, warehouseId, remaining, strategy);
            const willAllocate = remaining - preview.unallocated;
            return (
              <div key={item.productId} className="rounded-md border border-[#e5e2dc] p-3 text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{product?.sku} — {product?.name}</span>
                  <span className="text-xs text-gray-500">Need {remaining}</span>
                </div>
                {preview.plan.length > 0 ? (
                  <ul className="mb-1 space-y-0.5">
                    {preview.plan.map((p, idx) => (
                      <li key={idx} className="text-xs text-gray-500">
                        {p.take} unit(s) from bin {p.item.locationId}
                        {p.batch ? ` · batch ${p.batch.batchNumber} (exp ${p.batch.expiryDate})` : ''}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {willAllocate > 0 ? <p className="text-xs text-green-700">Will allocate {willAllocate} unit(s)</p> : null}
                {preview.unallocated > 0 ? <p className="text-xs text-red-600">{preview.unallocated} unit(s) will be backordered</p> : null}
              </div>
            );
          })}
          {pending.length === 0 ? <p className="text-sm text-gray-500">All items are already fully allocated.</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={submitting}>Allocate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
