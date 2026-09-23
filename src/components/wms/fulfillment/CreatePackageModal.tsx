'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { packingService } from '@/lib/wms/services/packingService';
import { showApiError } from '@/lib/apiError';
import type { OrderType } from '@/lib/wms/services/allocationService';
import type { BoxType } from '@/types';

const BOX_OPTIONS: { value: BoxType; label: string; dims: { l: number; w: number; h: number } }[] = [
  { value: 'small_box', label: 'Small Box (30x20x15 cm)', dims: { l: 30, w: 20, h: 15 } },
  { value: 'medium_box', label: 'Medium Box (45x35x25 cm)', dims: { l: 45, w: 35, h: 25 } },
  { value: 'large_box', label: 'Large Box (60x45x40 cm)', dims: { l: 60, w: 45, h: 40 } },
  { value: 'carton', label: 'Carton (standard)', dims: { l: 50, w: 40, h: 40 } },
  { value: 'custom', label: 'Custom', dims: { l: 0, w: 0, h: 0 } },
];

export function CreatePackageModal({
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
  const [boxType, setBoxType] = useState<BoxType>('medium_box');
  const [weightKg, setWeightKg] = useState(1);
  const [dims, setDims] = useState({ l: 45, w: 35, h: 25 });
  const [submitting, setSubmitting] = useState(false);

  function handleBoxChange(value: BoxType) {
    setBoxType(value);
    const preset = BOX_OPTIONS.find((b) => b.value === value);
    if (preset && value !== 'custom') setDims(preset.dims);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const pkg = packingService.createPackage(orderId, orderType, { boxType, weightKg, dimensions: dims });
      toast.success(`${pkg.packageNumber} is ready for verification`);
      onOpenChange(false);
      router.push(`/wms/fulfillment/packing/${pkg.id}`);
    } catch (err) {
      showApiError(err, 'Could not create package');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Package</DialogTitle>
          <DialogDescription>Select packaging for picked items</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Label>Box / Carton Type</Label>
          <Select value={boxType} onValueChange={(v) => handleBoxChange(v as BoxType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BOX_OPTIONS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1"><Label>Length (cm)</Label><Input type="number" value={dims.l} onChange={(e) => setDims((d) => ({ ...d, l: Number(e.target.value) }))} /></div>
          <div className="space-y-1"><Label>Width (cm)</Label><Input type="number" value={dims.w} onChange={(e) => setDims((d) => ({ ...d, w: Number(e.target.value) }))} /></div>
          <div className="space-y-1"><Label>Height (cm)</Label><Input type="number" value={dims.h} onChange={(e) => setDims((d) => ({ ...d, h: Number(e.target.value) }))} /></div>
        </div>
        <div className="space-y-1">
          <Label>Weight (kg)</Label>
          <Input type="number" step="0.1" min={0.1} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Create Package</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
