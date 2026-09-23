'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { inventoryService, availableQty } from "@/lib/wms/inventoryService";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import toast from "react-hot-toast";
import type { InventoryRow } from "./useInventory";

export function TransferModal({
  open,
  onOpenChange,
  presetRow,
  warehouseScope }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetRow?: InventoryRow | null;
  warehouseScope?: "cross_warehouse";
}) {
  const { products, warehouses } = useWmsLookups();
  const batches = useWmsDbSelector((s) => s.batches);
  const locations = useWmsDbSelector((s) => s.locations);
  const items = useWmsDbSelector((s) => s.inventoryItems);

  const [productId, setProductId] = useState(presetRow?.product.id ?? "");
  const [fromWarehouseId, setFromWarehouseId] = useState(presetRow?.warehouse.id ?? "");
  const [fromLocationId, setFromLocationId] = useState(presetRow?.location.id ?? "");
  const [batchId, setBatchId] = useState(presetRow?.batch?.id ?? "");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const sourceCandidates = items.filter((i) => i.productId === productId && (!fromWarehouseId || i.warehouseId === fromWarehouseId));
  const sourceItem = items.find(
    (i) => i.productId === productId && i.warehouseId === fromWarehouseId && i.locationId === fromLocationId && i.batchId === (batchId || undefined)
  );
  const maxAvailable = sourceItem ? availableQty(sourceItem) : 0;
  const destLocations = locations.filter((l) => l.warehouseId === toWarehouseId && l.type === "bin");
  const fromLocations = locations.filter((l) => l.warehouseId === fromWarehouseId);
  const productBatches = batches.filter((b) => b.productId === productId);

  async function handleSubmit() {
    if (!productId || !fromWarehouseId || !fromLocationId || !toWarehouseId || !toLocationId) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      inventoryService.transferStock({
        productId,
        fromWarehouseId,
        fromLocationId,
        toWarehouseId,
        toLocationId,
        batchId: batchId || undefined,
        quantity,
        reason: reason || "Manual transfer" });
      toast.success(`${quantity} unit(s) moved successfully.`);
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
          <DialogTitle>{warehouseScope === "cross_warehouse" ? "Warehouse Transfer" : "Stock Transfer"}</DialogTitle>
          <DialogDescription>Move stock between bins or warehouses</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={(val) => { setProductId(val); setFromWarehouseId(""); setFromLocationId(""); setBatchId(""); }}>
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
              <Label>From Warehouse</Label>
              <Select value={fromWarehouseId} onValueChange={(val) => { setFromWarehouseId(val); setFromLocationId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses
                    .filter((w) => items.some((i) => i.productId === productId && i.warehouseId === w.id && availableQty(i) > 0))
                    .map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>From Bin</Label>
              <Select value={fromLocationId} onValueChange={(val) => {
                setFromLocationId(val);
                const availableItem = items.find(i => i.productId === productId && i.locationId === val && i.physicalQty > 0);
                if (availableItem) setBatchId(availableItem.batchId || "");
              }}>
                <SelectTrigger><SelectValue placeholder="Select bin" /></SelectTrigger>
                <SelectContent>
                  {fromLocations
                    .filter((l) => items.some((i) => i.productId === productId && i.warehouseId === fromWarehouseId && i.locationId === l.id && availableQty(i) > 0))
                    .map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.code} ({l.zone})</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {productBatches.length > 0 ? (
            <div className="grid gap-2">
              <Label>Batch</Label>
              <Select value={batchId || "no_batch"} onValueChange={(val) => setBatchId(val === "no_batch" ? "" : val)}>
                <SelectTrigger><SelectValue placeholder="No batch" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_batch">No batch</SelectItem>
                  {productBatches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.batchNumber} (exp {b.expiryDate})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>To Warehouse</Label>
              <Select value={toWarehouseId} onValueChange={(val) => { setToWarehouseId(val); setToLocationId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>To Bin</Label>
              <Select value={toLocationId} onValueChange={setToLocationId}>
                <SelectTrigger><SelectValue placeholder="Select bin" /></SelectTrigger>
                <SelectContent>
                  {destLocations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.code} ({l.zone})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Quantity {sourceItem ? `(max ${maxAvailable})` : ""}</Label>
              <Input
                type="number"
                min={1}
                max={maxAvailable || undefined}
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
                placeholder="e.g. Rebalance stock"
              />
            </div>
          </div>
          {sourceCandidates.length === 0 && productId ? (
            <p className="text-xs text-amber-600">No stock records found for this product at the selected source.</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Confirm Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
