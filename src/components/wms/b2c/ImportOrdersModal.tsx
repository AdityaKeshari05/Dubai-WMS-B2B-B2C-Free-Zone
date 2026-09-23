'use client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { b2cOrderService } from '@/lib/wms/services/b2cOrderService';

export function ImportOrdersModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { products, customers, warehouses } = useWmsLookups();
  const [count, setCount] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; failed: number } | null>(null);

  async function handleImport() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const res = b2cOrderService.importSample(count, warehouses[0]?.id ?? '', 'USD', products, customers);
    setResult(res);
    setSubmitting(false);
    if (res.imported > 0) toast.success(`${res.imported} order(s) imported from marketplace channels`);
    else toast.error('No products or customers available to import against yet.');
  }

  function close() {
    setResult(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Import Orders</DialogTitle>
          <DialogDescription>Pull sample orders from connected marketplace channels</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="mt-3 text-sm font-semibold text-gray-900">Import finished</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div><div className="text-lg font-semibold text-green-600">{result.imported}</div><div className="text-xs text-gray-500">Imported</div></div>
              <div><div className="text-lg font-semibold text-amber-600">{result.skipped}</div><div className="text-xs text-gray-500">Skipped</div></div>
              <div><div className="text-lg font-semibold text-red-600">{result.failed}</div><div className="text-xs text-gray-500">Failed</div></div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <Label>Number of orders to import</Label>
            <Input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            <p className="mt-2 text-xs text-gray-500">Simulates pulling new orders from Amazon, Noon, and the website channel using real products and customers already in the system.</p>
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={close}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleImport} disabled={submitting}>Import</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
