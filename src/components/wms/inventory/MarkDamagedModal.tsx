'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { inventoryService } from "@/lib/wms/inventoryService";
import toast from "react-hot-toast";
import type { InventoryRow } from "./useInventory";

export function MarkDamagedModal({ open, onOpenChange, row }: { open: boolean; onOpenChange: (open: boolean) => void; row: InventoryRow | null }) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open || !row) return null;
  const goodQty = row.item.physicalQty - row.item.damagedQty;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      inventoryService.markDamaged({
        productId: row.product.id,
        warehouseId: row.warehouse.id,
        locationId: row.location.id,
        batchId: row.batch?.id,
        quantity,
        reason: reason || "Damaged during handling",
      });
      toast.success(`${quantity} unit(s) moved to damaged stock.`);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Stock Damaged</DialogTitle>
          <DialogDescription>{row.product.sku} — {row.product.name} @ {row.location.code}</DialogDescription>
        </DialogHeader>

        <div className="mb-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Good stock available: <span className="font-semibold text-gray-900">{goodQty}</span>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              max={goodQty}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Reason</Label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Dropped during handling"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>Mark Damaged</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
