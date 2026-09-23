'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inventoryService } from "@/lib/wms/inventoryService";
import toast from "react-hot-toast";
import type { InventoryRow } from "./useInventory";

const REASONS = ["Stock count correction", "Damaged in warehouse", "Data entry error", "Found stock", "Expired write-off", "Other"];

export function AdjustStockModal({ open, onOpenChange, row }: { open: boolean; onOpenChange: (open: boolean) => void; row: InventoryRow | null }) {
  const [type, setType] = useState<"increase" | "decrease">("increase");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open || !row) return null;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      inventoryService.adjustStock({
        productId: row.product.id,
        warehouseId: row.warehouse.id,
        locationId: row.location.id,
        batchId: row.batch?.id,
        type,
        quantity,
        reason,
        notes,
      });
      toast.success(`${row.product.name} ${type}d by ${quantity} unit(s).`);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>{row.product.sku} — {row.product.name} @ {row.location.code}</DialogDescription>
        </DialogHeader>

        <div className="mb-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Current physical quantity: <span className="font-semibold text-gray-900">{row.item.physicalQty}</span>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Adjustment Type</Label>
              <Select value={type} onValueChange={(val: "increase" | "decrease") => setType(val)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase</SelectItem>
                  <SelectItem value="decrease">Decrease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>

          <p className="text-xs text-gray-500">
            New physical quantity will be{" "}
            <span className="font-semibold text-gray-900">
              {type === "increase" ? row.item.physicalQty + quantity : Math.max(0, row.item.physicalQty - quantity)}
            </span>
            .
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Apply Adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
