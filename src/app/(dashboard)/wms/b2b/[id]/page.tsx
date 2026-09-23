'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Boxes, ClipboardList, PackagePlus, Truck, FileStack, CalendarClock, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { B2B_ORDER_STATUS, PRIORITY_VARIANT, PICKING_STATUS, PACKAGE_STATUS, SHIPMENT_STATUS } from '@/lib/wms/status';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { b2bOrderService } from '@/lib/wms/services/b2bOrderService';

import { AllocateOrderModal } from '@/components/wms/fulfillment/AllocateOrderModal';
import { CreatePickingTaskModal } from '@/components/wms/fulfillment/CreatePickingTaskModal';
import { CreatePackageModal } from '@/components/wms/fulfillment/CreatePackageModal';
import { CreateShipmentModal } from '@/components/wms/fulfillment/CreateShipmentModal';
import { CreateASNModal } from '@/components/wms/b2b/CreateASNModal';
import { PODModal } from '@/components/wms/b2b/PODModal';
import { ScheduleDeliveryModal } from '@/components/wms/b2b/ScheduleDeliveryModal';
import { PalletCartonBuilder } from '@/components/wms/b2b/PalletCartonBuilder';

type ModalKind = 'allocate' | 'pick' | 'package' | 'shipment' | 'asn' | 'pod' | 'schedule' | 'cancel' | null;

export default function B2BOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products, customers } = useWmsLookups();
  const order = useWmsDbSelector((s) => s.b2bOrders.find((o) => o.id === id));
  const allocations = useWmsDbSelector((s) => s.allocations.filter((a) => a.orderId === id && a.orderType === 'b2b'));
  const pickingTasks = useWmsDbSelector((s) => s.pickingTasks.filter((t) => t.orderId === id && t.orderType === 'b2b'));
  const packages = useWmsDbSelector((s) => s.packages.filter((p) => p.orderId === id && p.orderType === 'b2b'));
  const shipments = useWmsDbSelector((s) => s.shipments.filter((sh) => sh.orderId === id && sh.orderType === 'b2b'));
  const asns = useWmsDbSelector((s) => s.asns.filter((a) => a.orderId === id));
  const logs = useWmsDbSelector((s) =>
    s.activityLogs.filter(
      (l) =>
        l.entityId === id ||
        pickingTasks.some((t) => t.id === l.entityId) ||
        packages.some((p) => p.id === l.entityId) ||
        shipments.some((sh) => sh.id === l.entityId) ||
        asns.some((a) => a.id === l.entityId)
    )
  );

  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState<ModalKind>(null);

  if (!order) {
    return (
      <div>
        <PageHeader title="Order Not Found" />
      </div>
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const customer = customers.find((c) => c.id === order.customerId);
  const totalAmount = order.items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discount / 100), 0);
  const needsAllocation = order.items.some((i) => i.quantity - i.allocatedQty > 0) && !['dispatched', 'delivered', 'cancelled'].includes(order.status);
  const canCreatePickTask = order.items.some((i) => i.allocatedQty - i.pickedQty > 0);
  const canPack = order.items.some((i) => i.pickedQty > i.packedQty);
  const canShip = packages.some((p) => p.status === 'packed') && !shipments.some((sh) => sh.status !== 'delivered' && sh.status !== 'failed');
  const canCancel = ['draft', 'confirmed', 'allocated', 'partially_fulfilled', 'backordered'].includes(order.status);

  function handleConfirm() {
    b2bOrderService.confirm(order!.id);
    toast.success('You can now allocate inventory');
  }
  function handleCancel() {
    b2bOrderService.cancel(order!.id);
    toast(`${order!.orderNumber} has been cancelled`);
    setModal(null);
  }

  return (
    <div>
      <Link href="/wms/b2b" className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to B2B Orders
      </Link>
      <PageHeader
        title={order.orderNumber}
        description={`${customer?.name ?? ''} · PO ${order.customerPO || '-'}`}
      >
        <Badge variant={PRIORITY_VARIANT[order.priority]}>{order.priority}</Badge>
        <Badge variant={B2B_ORDER_STATUS.variant(order.status)}>{B2B_ORDER_STATUS.label(order.status)}</Badge>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {order.status === 'draft' ? <Button size="sm" onClick={handleConfirm}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Confirm Order</Button> : null}
        {needsAllocation ? <Button size="sm" variant="outline" onClick={() => setModal('allocate')}><Boxes className="mr-1.5 h-3.5 w-3.5" />Allocate</Button> : null}
        {canCreatePickTask ? <Button size="sm" variant="outline" onClick={() => setModal('pick')}><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Create Picking Task</Button> : null}
        {canPack ? <Button size="sm" variant="outline" onClick={() => setModal('package')}><PackagePlus className="mr-1.5 h-3.5 w-3.5" />Create Package</Button> : null}
        {canShip ? <Button size="sm" variant="outline" onClick={() => setModal('shipment')}><Truck className="mr-1.5 h-3.5 w-3.5" />Create Shipment</Button> : null}
        <Button size="sm" variant="outline" onClick={() => setModal('asn')}><FileStack className="mr-1.5 h-3.5 w-3.5" />Create ASN</Button>
        <Button size="sm" variant="outline" onClick={() => setModal('schedule')}><CalendarClock className="mr-1.5 h-3.5 w-3.5" />Schedule Delivery</Button>
        {order.status === 'dispatched' ? <Button size="sm" variant="outline" onClick={() => setModal('pod')}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Generate POD</Button> : null}
        {canCancel ? <Button size="sm" variant="ghost" onClick={() => setModal('cancel')}><XCircle className="mr-1.5 h-3.5 w-3.5" />Cancel Order</Button> : null}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation ({allocations.length})</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment ({pickingTasks.length + packages.length + shipments.length})</TabsTrigger>
          <TabsTrigger value="asn">ASN ({asns.length})</TabsTrigger>
          <TabsTrigger value="pallets">Pallets &amp; Cartons</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card><CardContent className="pt-4">
                <h3 className="mb-1 text-xs font-semibold uppercase text-gray-500">Customer</h3>
                <p className="text-sm text-gray-900">{customer?.name}</p>
                <p className="text-xs text-gray-500">{customer?.email} · {customer?.phone}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4">
                <h3 className="mb-1 text-xs font-semibold uppercase text-gray-500">Delivery</h3>
                <p className="text-sm text-gray-900">{order.deliveryAddress || '-'}</p>
                <p className="text-xs text-gray-500">Expected: {formatDate(order.expectedDelivery)}</p>
                {order.deliveryScheduledAt ? <p className="text-xs text-gray-500">Scheduled: {formatDate(order.deliveryScheduledAt)}</p> : null}
                {order.pod ? <p className="mt-1 text-xs text-green-700">Delivered {formatDate(order.pod.deliveredDate)} · Received by {order.pod.receivedBy}</p> : null}
              </CardContent></Card>
            </div>

            <div className="overflow-hidden rounded-md border border-[#e5e2dc] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#f8faf9] text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">Customer SKU</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Allocated</th>
                    <th className="px-3 py-2 text-right">Picked</th>
                    <th className="px-3 py-2 text-right">Packed</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-900">{productMap.get(item.productId)?.name}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{item.customerSku ?? '-'}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{item.allocatedQty}{item.backorderQty > 0 ? <span className="ml-1 text-xs text-red-600">({item.backorderQty} BO)</span> : null}</td>
                      <td className="px-3 py-2 text-right">{item.pickedQty}</td>
                      <td className="px-3 py-2 text-right">{item.packedQty}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice, order.currency)}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100), order.currency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-[#f8faf9]">
                    <td colSpan={7} className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Order Total</td>
                    <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900">{formatCurrency(totalAmount, order.currency)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="allocation">
          <div className="space-y-2">
            {allocations.length === 0 ? <p className="text-sm text-gray-500">No allocations yet.</p> : allocations.map((a) => (
              <Card key={a.id}><CardContent className="pt-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{productMap.get(a.productId)?.name}</span>
                  <Badge variant="info">{a.strategy}</Badge>
                </div>
                <p className="text-xs text-gray-500">Requested {a.requestedQty} · Allocated {a.allocatedQty} · Backorder {a.backorderQty} · {formatDateTime(a.createdAt)}</p>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fulfillment">
          <div className="space-y-5">
            <FulfillmentGroup title="Picking Tasks" empty={pickingTasks.length === 0}>
              {pickingTasks.map((t) => (
                <Link key={t.id} href={`/wms/fulfillment/picking/${t.id}`} className="flex items-center justify-between rounded-md border border-[#e5e2dc] bg-white p-3 hover:border-blue-300">
                  <span className="text-sm font-medium text-[#2490ef]">{t.taskNumber}</span>
                  <Badge variant={PICKING_STATUS.variant(t.status)}>{PICKING_STATUS.label(t.status)}</Badge>
                </Link>
              ))}
            </FulfillmentGroup>
            <FulfillmentGroup title="Packages" empty={packages.length === 0}>
              {packages.map((p) => (
                <Link key={p.id} href={`/wms/fulfillment/packing/${p.id}`} className="flex items-center justify-between rounded-md border border-[#e5e2dc] bg-white p-3 hover:border-blue-300">
                  <span className="text-sm font-medium text-[#2490ef]">{p.packageNumber}</span>
                  <Badge variant={PACKAGE_STATUS.variant(p.status)}>{PACKAGE_STATUS.label(p.status)}</Badge>
                </Link>
              ))}
            </FulfillmentGroup>
            <FulfillmentGroup title="Shipments" empty={shipments.length === 0}>
              {shipments.map((sh) => (
                <Link key={sh.id} href={`/wms/fulfillment/dispatch/${sh.id}`} className="flex items-center justify-between rounded-md border border-[#e5e2dc] bg-white p-3 hover:border-blue-300">
                  <span className="text-sm font-medium text-[#2490ef]">{sh.shipmentNumber} · {sh.trackingNumber}</span>
                  <Badge variant={SHIPMENT_STATUS.variant(sh.status)}>{SHIPMENT_STATUS.label(sh.status)}</Badge>
                </Link>
              ))}
            </FulfillmentGroup>
          </div>
        </TabsContent>

        <TabsContent value="asn">
          <div className="space-y-2">
            {asns.length === 0 ? <p className="text-sm text-gray-500">No ASN issued yet.</p> : asns.map((a) => (
              <Card key={a.id}><CardContent className="pt-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{a.asnNumber}</span>
                  <Badge variant="info">{a.status}</Badge>
                </div>
                <p className="text-xs text-gray-500">Dispatch {formatDate(a.expectedDispatch)} · Delivery {formatDate(a.expectedDelivery)} · {a.items.length} item(s)</p>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pallets"><PalletCartonBuilder orderId={order.id} /></TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-2">
            {logs.length === 0 ? <p className="text-sm text-gray-500">No activity recorded yet.</p> : null}
            {logs.map((l) => (
              <div key={l.id} className="rounded-md border border-[#e5e2dc] bg-white px-3 py-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{l.description}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(l.timestamp)}</span>
                </div>
                <span className="text-xs text-gray-500">{l.actor}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <AllocateOrderModal open={modal === 'allocate'} onOpenChange={(v) => setModal(v ? 'allocate' : null)} orderId={order.id} orderType="b2b" warehouseId={order.warehouseId} items={order.items} products={products} />
      <CreatePickingTaskModal open={modal === 'pick'} onOpenChange={(v) => setModal(v ? 'pick' : null)} orderId={order.id} orderType="b2b" warehouseId={order.warehouseId} priority={order.priority} />
      <CreatePackageModal open={modal === 'package'} onOpenChange={(v) => setModal(v ? 'package' : null)} orderId={order.id} orderType="b2b" />
      <CreateShipmentModal open={modal === 'shipment'} onOpenChange={(v) => setModal(v ? 'shipment' : null)} orderId={order.id} orderType="b2b" />
      <CreateASNModal open={modal === 'asn'} onOpenChange={(v) => setModal(v ? 'asn' : null)} orderId={order.id} />
      <PODModal open={modal === 'pod'} onOpenChange={(v) => setModal(v ? 'pod' : null)} orderId={order.id} />
      <ScheduleDeliveryModal open={modal === 'schedule'} onOpenChange={(v) => setModal(v ? 'schedule' : null)} orderId={order.id} />

      <Dialog open={modal === 'cancel'} onOpenChange={(v) => setModal(v ? 'cancel' : null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cancel Order</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Are you sure you want to cancel {order.orderNumber}? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Keep Order</Button>
            <Button variant="destructive" onClick={handleCancel}>Cancel Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FulfillmentGroup({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">{title}</h3>
      {empty ? <p className="text-sm text-gray-400">None yet.</p> : <div className="space-y-2">{children}</div>}
    </div>
  );
}
