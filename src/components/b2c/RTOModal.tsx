'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { shipmentService } from '@/lib/wms/services/shipmentService';

const REASONS = ['Customer unavailable', 'Refused delivery', 'Wrong address', 'Customer requested cancellation', 'Other'];

export function RTOModal({ open, onOpenChange, shipmentId }: { open: boolean; onOpenChange: (open: boolean) => void; shipmentId: string }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      shipmentService.markRTO(shipmentId, notes ? `${reason} — ${notes}` : reason);
      toast('Shipment flagged as return to origin');
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader><DialogTitle>Mark Return to Origin</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          <Label>Reason</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>Mark RTO</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
