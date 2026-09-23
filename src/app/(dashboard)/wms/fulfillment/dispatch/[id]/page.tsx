'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Circle, Truck, Send, ScanBarcode } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { SHIPMENT_STATUS } from '@/lib/wms/status';
import { shipmentService } from '@/lib/wms/services/shipmentService';
import { DispatchDocuments } from '@/components/wms/fulfillment/DispatchDocuments';
import type { ShipmentStatus } from '@/types';

export default function DispatchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products, customers } = useWmsLookups();
  const shipment = useWmsDbSelector((s) => s.shipments.find((sh) => sh.id === id));
  const packages = useWmsDbSelector((s) => s.packages.filter((p) => shipment?.packageIds.includes(p.id)));
  const b2bOrder = useWmsDbSelector((s) => s.b2bOrders.find((o) => o.id === shipment?.orderId));
  const b2cOrder = useWmsDbSelector((s) => s.b2cOrders.find((o) => o.id === shipment?.orderId));
  const productMap = new Map(products.map((p) => [p.id, p]));
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  const [checks, setChecks] = useState({ order: false, cartons: false, items: false });
  const [scannedTracking, setScannedTracking] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!shipment) {
    return <div><PageHeader title="Shipment Not Found" /></div>;
  }

  const orderNumber = b2bOrder?.orderNumber ?? b2cOrder?.orderNumber ?? '-';
  const orderHref = shipment.orderType === 'b2b' ? `/wms/b2b/${shipment.orderId}` : `/b2c/${shipment.orderId}`;
  const customerName = b2bOrder ? customerMap.get(b2bOrder.customerId)?.name ?? '-' : b2cOrder?.customerName ?? '-';
  const address = b2bOrder?.deliveryAddress ?? b2cOrder?.customerAddress ?? '-';
  const trackingScanned = scannedTracking === shipment.trackingNumber;
  const allChecked = Object.values(checks).every(Boolean) && trackingScanned;

  function toggle(key: keyof typeof checks) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function handleDispatch() {
    shipmentService.dispatch(shipment!.id);
    toast.success(`${shipment!.shipmentNumber} is on its way`);
    setConfirmOpen(false);
  }
  function handleAdvance(status: ShipmentStatus) {
    shipmentService.advanceTracking(shipment!.id, status);
    toast.success(`Shipment moved to ${SHIPMENT_STATUS.label(status)}`);
  }

  const checklist: { key: keyof typeof checks; label: string; value: string }[] = [
    { key: 'order', label: 'Order matches shipment', value: orderNumber },
    { key: 'cartons', label: 'Cartons verified', value: `${packages.length} package(s)` },
    { key: 'items', label: 'Items match manifest', value: `${packages.reduce((s, p) => s + p.items.reduce((a, i) => a + i.qty, 0), 0)} unit(s)` },
  ];

  return (
    <div>
      <Link href="/wms/fulfillment/dispatch" className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dispatch
      </Link>
      <PageHeader title={shipment.shipmentNumber} description={`Order ${orderNumber} · ${customerName} · ${shipment.carrier}`}>
        <Badge variant={SHIPMENT_STATUS.variant(shipment.status)}>{SHIPMENT_STATUS.label(shipment.status)}</Badge>
      </PageHeader>
      <p className="mb-4 text-xs text-gray-400"><Link href={orderHref} className="text-[#2490ef] hover:underline">View order</Link></p>

      <Card className="mb-4"><CardContent className="pt-4">
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Dispatch Verification</h3>
        <div className="space-y-2">
          {checklist.map((c) => (
            <button key={c.key} onClick={() => toggle(c.key)} disabled={shipment.status !== 'label_created'} className="flex w-full items-center justify-between rounded-md border border-[#e5e2dc] px-3 py-2.5 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
              <span className="flex items-center gap-2">{checks[c.key] ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-gray-300" />}{c.label}</span>
              <span className="text-xs text-gray-500">{c.value}</span>
            </button>
          ))}

          <div className={`rounded-md border px-3 py-2.5 text-sm ${trackingScanned ? 'border-green-200 bg-green-50' : 'border-[#e5e2dc]'}`}>
            <div className="mb-1.5 flex items-center gap-2">
              {trackingScanned ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-gray-300" />}
              Final scan — tracking number
            </div>
            <div className="flex items-center gap-2 pl-6">
              <ScanBarcode className="h-4 w-4 shrink-0 text-gray-400" />
              <Input
                placeholder={`Scan ${shipment.trackingNumber}`}
                value={scannedTracking}
                onChange={(e) => setScannedTracking(e.target.value)}
                disabled={shipment.status !== 'label_created'}
                className="h-8 font-mono text-xs"
              />
            </div>
          </div>
        </div>
        {shipment.status === 'label_created' ? (
          <Button className="mt-4" disabled={!allChecked} onClick={() => setConfirmOpen(true)}><Truck className="mr-1.5 h-3.5 w-3.5" />Dispatch Shipment</Button>
        ) : (
          <p className="mt-4 text-sm text-green-700">This shipment has already been dispatched.</p>
        )}
      </CardContent></Card>

      {shipment.status !== 'label_created' && SHIPMENT_STATUS.nextStatuses(shipment.status).length > 0 ? (
        <Card className="mb-4"><CardContent className="pt-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Tracking Progress</h3>
          <div className="flex flex-wrap gap-2">
            {SHIPMENT_STATUS.nextStatuses(shipment.status).map((next) => (
              <Button key={next} size="sm" variant={next === 'rto' || next === 'failed' ? 'outline' : 'default'} onClick={() => handleAdvance(next)}>
                <Send className="mr-1.5 h-3.5 w-3.5" />Mark {SHIPMENT_STATUS.label(next)}
              </Button>
            ))}
          </div>
        </CardContent></Card>
      ) : null}

      <DispatchDocuments shipment={shipment} packages={packages} productMap={productMap} customerName={customerName} orderNumber={orderNumber} address={address} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Dispatch Shipment</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Confirm dispatch of {shipment.shipmentNumber}. Order and inventory status will update accordingly.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDispatch}>Dispatch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
