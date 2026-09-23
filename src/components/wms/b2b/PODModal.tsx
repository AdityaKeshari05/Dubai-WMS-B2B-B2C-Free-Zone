'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { shipmentService } from '@/lib/wms/services/shipmentService';

export function PODModal({ open, onOpenChange, orderId }: { open: boolean; onOpenChange: (open: boolean) => void; orderId: string }) {
  const [deliveredDate, setDeliveredDate] = useState(new Date().toISOString().slice(0, 10));
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!receivedBy) {
      toast.error('Enter who received the delivery.');
      return;
    }
    setSubmitting(true);
    try {
      shipmentService.recordPOD(orderId, 'b2b', { deliveredDate, receivedBy, notes });
      toast.success('Order marked as delivered');
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Generate Proof of Delivery</DialogTitle></DialogHeader>
        <div className="space-y-1">
          <Label>Delivered Date</Label>
          <Input type="date" value={deliveredDate} onChange={(e) => setDeliveredDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Received By</Label>
          <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder="Recipient name" />
        </div>
        <div className="space-y-1">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional delivery notes" />
        </div>
        <div className="rounded-md border border-dashed border-gray-300 px-3 py-4 text-center text-xs text-gray-400">
          POD document / signature upload placeholder
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Confirm Delivery</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
