'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { asnService } from '@/lib/wms/services/asnService';
import { showApiError } from '@/lib/apiError';

export function CreateASNModal({ open, onOpenChange, orderId }: { open: boolean; onOpenChange: (open: boolean) => void; orderId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const [expectedDispatch, setExpectedDispatch] = useState(today);
  const [expectedDelivery, setExpectedDelivery] = useState(today);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const asn = asnService.createForOrder(orderId, { expectedDispatch, expectedDelivery });
      toast.success(`${asn.asnNumber} created and shared with customer`);
      onOpenChange(false);
    } catch (err) {
      showApiError(err, 'Could not create ASN');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create Advance Shipment Notice</DialogTitle></DialogHeader>
        <div className="space-y-1">
          <Label>Expected Dispatch Date</Label>
          <Input type="date" value={expectedDispatch} onChange={(e) => setExpectedDispatch(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Expected Delivery Date</Label>
          <Input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Issue ASN</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
