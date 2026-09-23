'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { allocationService, type OrderType } from '@/lib/wms/services/allocationService';
import { inventoryService } from '@/lib/wms/services/inventoryService';
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
  physicalQtyByProductId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderType: OrderType;
  warehouseId: string;
  items: { productId: string; quantity: number; allocatedQty: number }[];
  products: Product[];
  physicalQtyByProductId: Record<string, number>;
}) {
  const [strategy, setStrategy] = useState<AllocationStrategy>('FEFO');
  const [submitting, setSubmitting] = useState(false);

  const pending = items.filter((i) => i.quantity - i.allocatedQty > 0);
  const productMap = new Map(products.map((p) => [p.id, p]));

  async function handleConfirm() {
    setSubmitting(true);
    try {
      allocationService.allocateOrder(orderId, orderType, physicalQtyByProductId, strategy);
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
            const physicalQty = physicalQtyByProductId[item.productId] ?? 0;
            const available = inventoryService.getAvailableQty(item.productId, warehouseId, physicalQty);
            const willAllocate = Math.min(available, remaining);
            const willBackorder = remaining - willAllocate;
            return (
              <div key={item.productId} className="rounded-md border border-[#e5e2dc] p-3 text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{product?.sku} — {product?.name}</span>
                  <span className="text-xs text-gray-500">Need {remaining} · Available {available}</span>
                </div>
                {willAllocate > 0 ? (
                  <p className="text-xs text-green-700">Will allocate {willAllocate} unit(s)</p>
                ) : null}
                {willBackorder > 0 ? (
                  <p className="text-xs text-red-600">{willBackorder} unit(s) will be backordered</p>
                ) : null}
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
