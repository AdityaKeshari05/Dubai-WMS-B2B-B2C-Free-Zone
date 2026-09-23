'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { pickingService } from '@/lib/wms/services/pickingService';
import { showApiError } from '@/lib/apiError';
import type { OrderType } from '@/lib/wms/services/allocationService';

export function CreatePickingTaskModal({
  open,
  onOpenChange,
  orderId,
  orderType,
  warehouseId,
  priority,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderType: OrderType;
  warehouseId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}) {
  const router = useRouter();
  const [picker, setPicker] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const task = pickingService.createTaskFromOrder(orderId, orderType, {
        warehouseId,
        priority,
        picker: picker || undefined,
        dueTime: dueTime || undefined,
      });
      toast.success(`${task.taskNumber} is ready for picking`);
      onOpenChange(false);
      router.push(`/wms/fulfillment/picking/${task.id}`);
    } catch (err) {
      showApiError(err, 'Could not create picking task');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Picking Task</DialogTitle>
          <DialogDescription>Generated from this order&apos;s allocated inventory</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Label>Assign Picker (optional)</Label>
          <Input value={picker} onChange={(e) => setPicker(e.target.value)} placeholder="e.g. Mohammed Rizvi" />
        </div>
        <div className="space-y-1">
          <Label>Due Time (optional)</Label>
          <Input type="datetime-local" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
