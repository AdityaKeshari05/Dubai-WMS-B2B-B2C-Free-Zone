'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Boxes, ClipboardList, PackagePlus, Truck, RotateCcw, CircleDollarSign, Undo2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { B2C_ORDER_STATUS, PICKING_STATUS, PACKAGE_STATUS, SHIPMENT_STATUS } from '@/lib/wms/status';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { shipmentService } from '@/lib/wms/services/shipmentService';

import { AllocateOrderModal } from '@/components/wms/fulfillment/AllocateOrderModal';
import { CreatePickingTaskModal } from '@/components/wms/fulfillment/CreatePickingTaskModal';
import { CreatePackageModal } from '@/components/wms/fulfillment/CreatePackageModal';
import { CreateShipmentModal } from '@/components/wms/fulfillment/CreateShipmentModal';
import { RTOModal } from '@/components/wms/b2c/RTOModal';
import { CreateReturnModal } from '@/components/wms/b2c/CreateReturnModal';

type ModalKind = 'allocate' | 'pick' | 'package' | 'shipment' | 'rto' | 'return' | null;

export default function B2COrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products, physicalQtyByProductId } = useWmsLookups();
  const order = useWmsDbSelector((s) => s.b2cOrders.find((o) => o.id === id));
  const pickingTasks = useWmsDbSelector((s) => s.pickingTasks.filter((t) => t.orderId === id && t.orderType === 'b2c'));
  const packages = useWmsDbSelector((s) => s.packages.filter((p) => p.orderId === id && p.orderType === 'b2c'));
  const shipments = useWmsDbSelector((s) => s.shipments.filter((sh) => sh.orderId === id && sh.orderType === 'b2c'));
  const returns = useWmsDbSelector((s) => s.returns.filter((r) => r.orderId === id && r.orderType === 'b2c'));
  const logs = useWmsDbSelector((s) =>
    s.activityLogs.filter((l) => l.entityId === id || pickingTasks.some((t) => t.id === l.entityId) || packages.some((p) => p.id === l.entityId) || shipments.some((sh) => sh.id === l.entityId))
  );

  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState<ModalKind>(null);

  if (!order) {
    return <div><PageHeader title="Order Not Found" /></div>;
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const activeShipment = shipments.find((sh) => sh.status !== 'delivered' && sh.status !== 'rto');
  const needsAllocation = order.items.some((i) => i.quantity - i.allocatedQty > 0) && !['shipped', 'delivered', 'rto', 'returned', 'cancelled'].includes(order.fulfillmentStatus);
  const canCreatePickTask = order.items.some((i) => i.allocatedQty - i.pickedQty > 0);
  const canPack = order.items.some((i) => i.pickedQty > i.packedQty);
  const canShip = packages.some((p) => p.status === 'packed') && !activeShipment;
  const canRTO = activeShipment && activeShipment.status !== 'delivered';
  const canReturn = order.fulfillmentStatus === 'delivered' || order.fulfillmentStatus === 'rto';

  function handleCod(status: 'collected' | 'failed') {
    shipmentService.updateCodCollection(order!.id, status);
    toast.success(`Collection marked ${status}`);
  }

  return (
    <div>
      <Link href="/wms/b2c" className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to B2C Orders
      </Link>
      <PageHeader title={order.orderNumber} description={`${order.customerName} · ${order.channel} · ${order.customerAddress}`}>
        <Badge variant={B2C_ORDER_STATUS.variant(order.fulfillmentStatus)}>{B2C_ORDER_STATUS.label(order.fulfillmentStatus)}</Badge>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {needsAllocation ? <Button size="sm" variant="outline" onClick={() => setModal('allocate')}><Boxes className="mr-1.5 h-3.5 w-3.5" />Allocate</Button> : null}
        {canCreatePickTask ? <Button size="sm" variant="outline" onClick={() => setModal('pick')}><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Create Picking Task</Button> : null}
        {canPack ? <Button size="sm" variant="outline" onClick={() => setModal('package')}><PackagePlus className="mr-1.5 h-3.5 w-3.5" />Create Package</Button> : null}
        {canShip ? <Button size="sm" variant="outline" onClick={() => setModal('shipment')}><Truck className="mr-1.5 h-3.5 w-3.5" />Create Shipment</Button> : null}
        {order.paymentMethod === 'cod' && order.codStatus === 'pending' ? (
          <>
            <Button size="sm" variant="outline" onClick={() => handleCod('collected')}><CircleDollarSign className="mr-1.5 h-3.5 w-3.5" />Mark COD Collected</Button>
            <Button size="sm" variant="ghost" onClick={() => handleCod('failed')}>Mark COD Failed</Button>
          </>
        ) : null}
        {canRTO ? <Button size="sm" variant="outline" onClick={() => setModal('rto')}><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Mark RTO</Button> : null}
        {canReturn ? <Button size="sm" variant="outline" onClick={() => setModal('return')}><Undo2 className="mr-1.5 h-3.5 w-3.5" />Create Return</Button> : null}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment ({pickingTasks.length + packages.length + shipments.length})</TabsTrigger>
          <TabsTrigger value="returns">Returns ({returns.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Card><CardContent className="pt-4"><h3 className="mb-1 text-xs font-semibold uppercase text-gray-500">Customer</h3><p className="text-sm text-gray-900">{order.customerName}</p><p className="text-xs text-gray-500">{order.customerPhone}</p></CardContent></Card>
              <Card><CardContent className="pt-4">
                <h3 className="mb-1 text-xs font-semibold uppercase text-gray-500">Payment</h3>
                <p className="text-sm text-gray-900">{order.paymentMethod === 'cod' ? `COD — ${formatCurrency(order.codAmount ?? 0, order.currency)}` : 'Prepaid'}</p>
                {order.paymentMethod === 'cod' ? <Badge variant={order.codStatus === 'collected' ? 'success' : order.codStatus === 'failed' ? 'destructive' : 'warning'}>{order.codStatus}</Badge> : null}
              </CardContent></Card>
              <Card><CardContent className="pt-4"><h3 className="mb-1 text-xs font-semibold uppercase text-gray-500">Tracking</h3><p className="font-mono text-sm text-gray-900">{order.trackingNumber ?? 'Not yet generated'}</p><p className="text-xs text-gray-500">{order.carrier ?? '-'}</p></CardContent></Card>
            </div>

            <div className="overflow-hidden rounded-md border border-[#e5e2dc] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#f8faf9] text-xs text-gray-500">
                  <tr><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Allocated</th><th className="px-3 py-2 text-right">Picked</th><th className="px-3 py-2 text-right">Packed</th><th className="px-3 py-2 text-right">Unit Price</th><th className="px-3 py-2 text-right">Total</th></tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-900">{productMap.get(item.productId)?.name}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{item.allocatedQty}</td>
                      <td className="px-3 py-2 text-right">{item.pickedQty}</td>
                      <td className="px-3 py-2 text-right">{item.packedQty}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice, order.currency)}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(item.quantity * item.unitPrice, order.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        <TabsContent value="returns">
          <div className="space-y-2">
            {returns.length === 0 ? <p className="text-sm text-gray-500">No returns for this order.</p> : returns.map((r) => (
              <Card key={r.id}><CardContent className="pt-3">
                <div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium text-gray-900">{r.returnNumber}</span><Badge variant="warning">{r.status}</Badge></div>
                <p className="text-xs text-gray-500">{r.items.map((i) => `${productMap.get(i.productId)?.name} × ${i.quantity}`).join(', ')}</p>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-2">
            {logs.length === 0 ? <p className="text-sm text-gray-500">No activity recorded yet.</p> : null}
            {logs.map((l) => (
              <div key={l.id} className="rounded-md border border-[#e5e2dc] bg-white px-3 py-2.5 text-sm">
                <div className="flex items-center justify-between"><span className="font-medium text-gray-900">{l.description}</span><span className="text-xs text-gray-400">{formatDateTime(l.timestamp)}</span></div>
                <span className="text-xs text-gray-500">{l.actor}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <AllocateOrderModal open={modal === 'allocate'} onOpenChange={(v) => setModal(v ? 'allocate' : null)} orderId={order.id} orderType="b2c" warehouseId={order.warehouseId} items={order.items} products={products} physicalQtyByProductId={physicalQtyByProductId} />
      <CreatePickingTaskModal open={modal === 'pick'} onOpenChange={(v) => setModal(v ? 'pick' : null)} orderId={order.id} orderType="b2c" warehouseId={order.warehouseId} priority="normal" />
      <CreatePackageModal open={modal === 'package'} onOpenChange={(v) => setModal(v ? 'package' : null)} orderId={order.id} orderType="b2c" />
      <CreateShipmentModal open={modal === 'shipment'} onOpenChange={(v) => setModal(v ? 'shipment' : null)} orderId={order.id} orderType="b2c" />
      {activeShipment ? <RTOModal open={modal === 'rto'} onOpenChange={(v) => setModal(v ? 'rto' : null)} shipmentId={activeShipment.id} /> : null}
      <CreateReturnModal open={modal === 'return'} onOpenChange={(v) => setModal(v ? 'return' : null)} order={order} products={products} />
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
