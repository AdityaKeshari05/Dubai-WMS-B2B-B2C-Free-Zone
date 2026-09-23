'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { shipmentService } from '@/lib/wms/services/shipmentService';
import type { OrderType } from '@/lib/wms/services/allocationService';

const CARRIERS = ['Aramex', 'DHL Express', 'Emirates Post', 'Fetchr', 'SMSA Express'];

export function CreateShipmentModal({
  open,
  onOpenChange,
  orderId,
  orderType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderType: OrderType;
}) {
  const router = useRouter();
  const packages = useWmsDbSelector((s) =>
    s.packages.filter((p) => p.orderId === orderId && p.orderType === orderType && p.status === 'packed')
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [carrier, setCarrier] = useState(CARRIERS[0]);
  const [submitting, setSubmitting] = useState(false);

  // Re-sync the default selection every time the modal opens, since it stays
  // mounted (just hidden) while new packages get packed in the meantime.
  // Adjusting state during render (rather than in an effect) avoids an extra
  // commit - see https://react.dev/learn/you-might-not-need-an-effect
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSelected(packages.map((p) => p.id));
  }

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (selected.length === 0) {
      toast.error('Choose at least one packed carton to consolidate into this shipment.');
      return;
    }
    setSubmitting(true);
    try {
      const shipment = shipmentService.createShipment(orderId, orderType, { packageIds: selected, carrier });
      toast.success(`${shipment.shipmentNumber} consolidated ${selected.length} package(s)`);
      onOpenChange(false);
      router.push(`/wms/fulfillment/dispatch/${shipment.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>Consolidate packed cartons into a single shipment</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Label>Carrier</Label>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CARRIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Packages ({selected.length} selected)</Label>
          {packages.length === 0 ? (
            <p className="text-xs text-amber-600">No packed cartons available yet for this order.</p>
          ) : (
            <div className="rounded-md border border-[#e5e2dc]">
              {packages.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 border-b border-gray-100 px-3 py-2 text-sm last:border-b-0 hover:bg-gray-50">
                  <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                  <span className="font-medium text-gray-800">{p.packageNumber}</span>
                  <span className="text-xs text-gray-500">{p.boxType.replace('_', ' ')} · {p.weightKg}kg</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Create Shipment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
