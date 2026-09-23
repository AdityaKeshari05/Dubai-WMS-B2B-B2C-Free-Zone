'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import { inventoryService } from "@/lib/wms/inventoryService";
import toast from "react-hot-toast";

const REASONS = ["Stock count correction", "Damaged in warehouse", "Data entry error", "Found stock", "Expired write-off", "Other"];

export function NewAdjustmentModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { products, warehouses } = useWmsLookups();
  const batches = useWmsDbSelector((s) => s.batches);
  const locations = useWmsDbSelector((s) => s.locations);
  const items = useWmsDbSelector((s) => s.inventoryItems);

  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [type, setType] = useState<"increase" | "decrease">("increase");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const warehouseOptions = type === "decrease" && productId
    ? warehouses.filter((w) => items.some((i) => i.productId === productId && i.warehouseId === w.id && i.physicalQty > 0))
    : warehouses;

  const binOptions = type === "decrease" && productId
    ? locations.filter((l) => l.warehouseId === warehouseId && l.type === "bin" && items.some((i) => i.productId === productId && i.locationId === l.id && i.physicalQty > 0))
    : locations.filter((l) => l.warehouseId === warehouseId && l.type === "bin");

  const batchOptions = batches.filter((b) => b.productId === productId);
  const current = items.find(
    (i) => i.productId === productId && i.warehouseId === warehouseId && i.locationId === locationId && i.batchId === (batchId || undefined)
  );

  async function handleSubmit() {
    if (!productId || !warehouseId || !locationId) {
      toast.error("Select a product, warehouse and bin.");
      return;
    }
    setSubmitting(true);
    try {
      inventoryService.adjustStock({
        productId,
        warehouseId,
        locationId,
        batchId: batchId || undefined,
        type,
        quantity,
        reason,
        notes });
      toast.success("The adjustment has been applied.");
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
          <DialogTitle>New Stock Adjustment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={(val) => { setProductId(val); setBatchId(""); }}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Warehouse</Label>
              <Select value={warehouseId} onValueChange={(val) => { setWarehouseId(val); setLocationId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouseOptions.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Bin</Label>
              <Select value={locationId} onValueChange={(val) => {
                setLocationId(val);
                if (type === "decrease") {
                  const availableItem = items.find(i => i.productId === productId && i.locationId === val && i.physicalQty > 0);
                  if (availableItem) setBatchId(availableItem.batchId || "");
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Select bin" /></SelectTrigger>
                <SelectContent>
                  {binOptions.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.code} ({l.zone})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {batchOptions.length > 0 ? (
            <div className="grid gap-2">
              <Label>Batch</Label>
              <Select value={batchId || "no_batch"} onValueChange={(val) => setBatchId(val === "no_batch" ? "" : val)}>
                <SelectTrigger><SelectValue placeholder="No batch" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_batch">No batch</SelectItem>
                  {batchOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.batchNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {current ? (
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
              Current physical quantity: <span className="font-semibold text-gray-900">{current.physicalQty}</span>
            </div>
          ) : null}

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Apply Adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
