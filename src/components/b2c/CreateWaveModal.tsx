'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { waveService } from '@/lib/wms/services/waveService';

const CARRIERS = ['Any Carrier', 'Aramex', 'DHL Express', 'Emirates Post', 'Fetchr', 'SMSA Express'];

export function CreateWaveModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { warehouses } = useWmsLookups();
  const eligibleOrders = useWmsDbSelector((s) => s.b2cOrders.filter((o) => ['allocated', 'picking'].includes(o.fulfillmentStatus) && !o.waveId));

  const [name, setName] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [cutoffTime, setCutoffTime] = useState('');
  const [carrier, setCarrier] = useState('Any Carrier');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const scopedOrders = eligibleOrders.filter((o) => o.warehouseId === warehouseId);
  const customerOptions = useMemo(() => Array.from(new Set(scopedOrders.map((o) => o.customerName))).sort(), [scopedOrders]);
  const visibleOrders = customerFilter === 'all' ? scopedOrders : scopedOrders.filter((o) => o.customerName === customerFilter);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }
  function selectAllVisible() {
    setSelected(Array.from(new Set([...selected, ...visibleOrders.map((o) => o.id)])));
  }

  async function handleSubmit() {
    if (!name || selected.length === 0) {
      toast.error('Name the wave and select at least one order.');
      return;
    }
    setSubmitting(true);
    try {
      const wave = waveService.createWave({
        name,
        warehouseId,
        priority,
        cutoffTime,
        carrier: carrier === 'Any Carrier' ? undefined : carrier,
        orderIds: selected,
      });
      toast.success(`${wave.waveNumber} created with ${selected.length} order(s)`);
      onOpenChange(false);
      router.push(`/b2c/waves/${wave.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl">
        <DialogHeader><DialogTitle>Create Wave</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Wave Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning Wave 1" /></div>
          <div className="space-y-1.5">
            <Label>Warehouse</Label>
            <Select value={warehouseId} onValueChange={(v) => { setWarehouseId(v); setSelected([]); setCustomerFilter('all'); }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Carrier</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CARRIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Cutoff Time</Label><Input type="datetime-local" value={cutoffTime} onChange={(e) => setCutoffTime(e.target.value)} /></div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Filter by Customer</Label>
          </div>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customerOptions.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Eligible Orders ({selected.length} selected)</Label>
            {visibleOrders.length > 0 ? <Button size="sm" variant="ghost" onClick={selectAllVisible}>Select all matching</Button> : null}
          </div>
          {!warehouseId ? (
            <p className="text-xs text-gray-500">Select a warehouse to see eligible orders.</p>
          ) : visibleOrders.length === 0 ? (
            <p className="text-xs text-amber-600">No allocated orders without a wave match these filters yet.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-md border border-[#e5e2dc]">
              {visibleOrders.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm leading-5 last:border-b-0 hover:bg-gray-50">
                  <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
                  <span className="font-medium text-gray-800">{o.orderNumber}</span>
                  <span className="text-xs text-gray-500">{o.customerName}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>Create Wave</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
