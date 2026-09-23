'use client';

import { useWmsDbSelector } from "@/lib/wms/useWmsDb";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { cycleCountService } from "@/lib/wms/cycleCountService";
import toast from "react-hot-toast";

const TODAY = new Date().toISOString().split("T")[0];

export function NewCycleCountModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { products, warehouses } = useWmsLookups();
  const locations = useWmsDbSelector((s) => s.locations);
  const router = useRouter();

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [zone, setZone] = useState("");
  const [assignedUser, setAssignedUser] = useState("Utkarsh Pratap");
  const [countDate, setCountDate] = useState(TODAY);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const zones = Array.from(new Set(locations.filter((l) => l.warehouseId === warehouseId).map((l) => l.zone)));

  function toggleProduct(id: string) {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (!warehouseId || selectedProducts.length === 0) {
      toast.error("Select a warehouse and at least one product.");
      return;
    }
    setSubmitting(true);
    try {
      const session = cycleCountService.createSession({
        warehouseId,
        zone: zone || undefined,
        assignedUser,
        countDate,
        productIds: selectedProducts });
      toast.success(`${session.countNumber} created with ${session.lines.length} line(s).`);
      onOpenChange(false);
      router.push(`/inventory/wms-counts/${session.id}`);
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
          <DialogTitle>New Cycle Count</DialogTitle>
          <DialogDescription>Select the scope for this physical count session</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Warehouse</Label>
              <Select value={warehouseId} onValueChange={(val) => { setWarehouseId(val); setZone(""); }}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Zone (optional)</Label>
              <Select value={zone || "all_zones"} onValueChange={(val) => setZone(val === "all_zones" ? "" : val)}>
                <SelectTrigger><SelectValue placeholder="All Zones" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_zones">All Zones</SelectItem>
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Assigned User</Label>
              <Input
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Count Date</Label>
              <Input
                type="date"
                value={countDate}
                onChange={(e) => setCountDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Products ({selectedProducts.length} selected)</Label>
            <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
              {products.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 border-b border-gray-100 px-3 py-2 text-sm last:border-b-0 hover:bg-gray-50">
                  <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={selectedProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                  <span className="font-mono text-xs text-gray-500">{p.sku}</span>
                  <span className="text-gray-800">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Create Count Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
