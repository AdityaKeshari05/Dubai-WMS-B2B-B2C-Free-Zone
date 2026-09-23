'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { wmsDb } from '@/lib/wms/db';
import { inventoryService } from '@/lib/wms/inventoryService';
import { allocationService } from '@/lib/wms/services/allocationService';
import { b2cOrderService } from '@/lib/wms/services/b2cOrderService';
import { pickingService } from '@/lib/wms/services/pickingService';
import { packingService } from '@/lib/wms/services/packingService';
import { shipmentService } from '@/lib/wms/services/shipmentService';
import { batchPickingService } from '@/lib/wms/services/batchPickingService';
import { ImportOrdersModal } from './ImportOrdersModal';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { B2COrder, ShipmentStatus } from '@/types';

export type B2COperation = 'import' | 'sync' | 'allocation' | 'batch' | 'single' | 'packing' | 'labels' | 'tracking' | 'cod' | 'rto';

const copy: Record<B2COperation, { title: string; description: string }> = {
  import: { title: 'E-Commerce Order Import', description: 'Upload, map, validate, and import order lines from a CSV file.' },
  sync: { title: 'Order Sync', description: 'Review the canonical order statuses and run a local sync cycle.' },
  allocation: { title: 'Order Allocation', description: 'Reserve available warehouse stock against new B2C orders.' },
  batch: { title: 'Batch Picking', description: 'Pick grouped SKUs and apply confirmations to the linked orders.' },
  single: { title: 'Single-Order Picking', description: 'Confirm allocated quantities for one order at a time.' },
  packing: { title: 'Packing Workflow', description: 'Create a package, verify items and quantities, then mark it packed.' },
  labels: { title: 'Shipping Label Generation', description: 'Create mock carrier labels and linked shipment records.' },
  tracking: { title: 'Tracking Number Management', description: 'Dispatch shipments and advance their shared tracking status.' },
  cod: { title: 'COD Support', description: 'Review cash-on-delivery amounts and simulate collection results.' },
  rto: { title: 'RTO Management', description: 'Mark a shipped order as Return to Origin with a reason.' },
};

function ActionButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <Button size="sm" variant="outline" className="h-9 px-3 text-sm" disabled={disabled} onClick={onClick}>{children}</Button>;
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-md border border-[#e5e2dc] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">{children}</div>;
}

export function B2COperationsPage({ operation }: { operation: B2COperation }) {
  const orders = useWmsDbSelector((s) => s.b2cOrders);
  const tasks = useWmsDbSelector((s) => s.pickingTasks.filter((t) => t.orderType === 'b2c'));
  const packages = useWmsDbSelector((s) => s.packages.filter((p) => p.orderType === 'b2c'));
  const shipments = useWmsDbSelector((s) => s.shipments.filter((s) => s.orderType === 'b2c'));
  const lastSync = useWmsDbSelector((s) => s.meta.lastSync);
  const { products } = useWmsLookups();
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [batchQty, setBatchQty] = useState<Record<string, number>>({});
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id;
  const productSku = (id: string) => products.find((p) => p.id === id)?.sku ?? id;
  const orderFor = (id: string) => orders.find((o) => o.id === id);
  const visibleOrders = useMemo(() => orders.filter((o) => !search || `${o.orderNumber} ${o.customerName} ${o.trackingNumber ?? ''}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);

  function allocate(order: B2COrder) {
    try { allocationService.allocateOrder(order.id, 'b2c'); toast.success(`${order.orderNumber} allocated; inventory reserved.`); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not allocate order.'); }
  }
  function confirmTask(taskId: string) {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      pickingService.startTask(taskId);
      task.items.filter((i) => i.status !== 'picked').forEach((item) => pickingService.confirmPickItem(taskId, item.id, item.expectedQty));
      pickingService.completeTask(taskId);
      toast.success(`${task.orderNumber} picked and updated.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not confirm pick.'); }
  }
  function makePackage(order: B2COrder) {
    try {
      packingService.createPackage(order.id, 'b2c', { boxType: 'medium_box', weightKg: 1, dimensions: { l: 30, w: 20, h: 15 } });
      toast.success(`Package created for ${order.orderNumber}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not create package.'); }
  }
  function verifyAndPack(packageId: string) {
    try {
      for (const field of ['skuVerified', 'quantityVerified'] as const) packingService.setVerification(packageId, field, true);
      packingService.markPacked(packageId);
      toast.success('Package verified and marked packed.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not pack package.'); }
  }
  function generateLabel(order: B2COrder) {
    try {
      const readyPackage = packages.find((p) => p.orderId === order.id && p.status === 'packed');
      if (!readyPackage) throw new Error('Pack the order before generating its shipping label.');
      packingService.generateLabel(readyPackage.id, 'Aramex');
      const refreshed = packages.find((p) => p.id === readyPackage.id);
      shipmentService.createShipment(order.id, 'b2c', { packageIds: [readyPackage.id], carrier: 'Aramex' });
      toast.success(`Mock label created${refreshed?.shippingLabel?.trackingNumber ? `: ${refreshed.shippingLabel.trackingNumber}` : ''}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not generate label.'); }
  }
  function nextTracking(shipmentId: string, status: ShipmentStatus) {
    shipmentService.advanceTracking(shipmentId, status);
    toast.success(`Tracking updated to ${status.replaceAll('_', ' ')}.`);
  }
  function confirmBatch(productId: string) {
    const group = batchGroups.find((candidate) => candidate.productId === productId);
    if (!group) return;
    try {
      batchPickingService.distributePick(group, batchQty[productId] ?? 0);
      setBatchQty((previous) => ({ ...previous, [productId]: 0 }));
      toast.success(`${group.totalExpectedQty} unit(s) distributed to their order lines.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not confirm batch pick.'); }
  }

  const syncAction = () => { b2cOrderService.sync(); toast.success('Order sync completed. Shared order states are current.'); };
  const eligible = orders.filter((o) => o.fulfillmentStatus === 'new');
  const pendingTasks = tasks.filter((t) => t.status !== 'picked' && t.status !== 'completed');
  const batchGroups = batchPickingService.groupByProduct(tasks.filter((t) => t.type === 'batch' && t.status !== 'completed'));
  const pendingPack = orders.filter((o) => o.items.some((i) => i.pickedQty > i.packedQty));
  const statusLabel = (status: string) => status.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());

  return <div className="space-y-5">
    <PageHeader title={copy[operation].title} description={copy[operation].description}>
      {operation === 'import' && <Button onClick={() => setImportOpen(true)}>Import Orders</Button>}
      {operation === 'sync' && <Button onClick={syncAction}>Sync Now</Button>}
      {operation === 'batch' && <ActionButton onClick={() => {
        const ids = Array.from(new Set(pendingTasks.map((t) => t.orderId)));
        if (!ids.length) { toast.error('No allocated orders are waiting to be picked.'); return; }
        useBatchType(ids); toast.success(`${ids.length} order task(s) grouped into batch picking.`);
      }}>Group pending tasks</ActionButton>}
      <Button variant="outline" asChild><Link href="/b2c">All B2C Orders</Link></Button>
    </PageHeader>

    {operation === 'sync' && <p className="mb-4 text-sm text-gray-500">Last sync: {lastSync ? formatDateTime(lastSync) : 'Not synced yet'} · statuses below come from the same B2C orders used throughout fulfillment.</p>}
    {operation === 'import' && <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">Select a CSV file to map its fields to current products and create orders in the shared runtime state.</div>}
    {['allocation', 'batch', 'single', 'packing', 'labels', 'tracking', 'cod', 'rto'].includes(operation) && <input aria-label="Search B2C orders" placeholder="Search order, customer, or tracking..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full max-w-md rounded-md border border-[#e5e2dc] px-3 text-sm leading-5" />}

    {operation === 'allocation' && <Panel><Rows headers={['Order / customer', 'SKU / quantity', 'Available / allocated', 'Status', 'Action']}>
      {visibleOrders.filter((o) => o.fulfillmentStatus === 'new').map((o) => <tr key={o.id}><td><OrderLink order={o} /></td><td>{o.items.map((i) => <div key={i.id} className="text-sm">{productSku(i.productId)} × {i.quantity}</div>)}</td><td>{o.items.map((i) => <div key={i.id} className="text-sm">{inventoryService.availableForProduct(i.productId, o.warehouseId)} available · {i.allocatedQty} allocated</div>)}</td><td><Badge variant="secondary">New</Badge></td><td><ActionButton onClick={() => allocate(o)}>Allocate stock</ActionButton></td></tr>)}
      {visibleOrders.every((o) => o.fulfillmentStatus !== 'new') && <Empty colSpan={5}>No orders are waiting for allocation.</Empty>}
    </Rows></Panel>}

    {(operation === 'import' || operation === 'sync') && <Panel><Rows headers={['Order / customer', 'Source', 'Items', 'Total', 'Fulfillment']}>
      {visibleOrders.map((o) => <tr key={o.id}><td><OrderLink order={o} /></td><td>{o.channel}</td><td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td><td>{formatCurrency(o.amount, o.currency)}</td><td><Badge variant="secondary">{statusLabel(o.fulfillmentStatus)}</Badge></td></tr>)}
    </Rows></Panel>}

    {operation === 'batch' && <Panel><Rows headers={['SKU / product', 'Required', 'Picked', 'Orders receiving units', 'Confirm quantity']}>
      {batchGroups.map((group) => { const remaining = group.totalExpectedQty - group.totalPickedQty; return <tr key={group.productId}><td><div className="font-medium">{productSku(group.productId)}</div><div className="text-xs text-gray-500">{productName(group.productId)}</div></td><td>{group.totalExpectedQty}</td><td>{group.totalPickedQty}</td><td className="max-w-xs text-xs">{group.taskItems.map((item) => `${item.orderNumber} × ${item.expectedQty}`).join(', ')}</td><td>{remaining > 0 ? <div className="flex items-center gap-2"><input type="number" min={remaining} max={remaining} value={batchQty[group.productId] ?? ''} onChange={(event) => setBatchQty((previous) => ({ ...previous, [group.productId]: Number(event.target.value) }))} className="h-8 w-20 rounded border px-2 text-right" placeholder={String(remaining)} /><ActionButton onClick={() => confirmBatch(group.productId)}>Confirm</ActionButton></div> : <Badge variant="success">Complete</Badge>}</td></tr>; })}
      {batchGroups.length === 0 && <Empty colSpan={5}>{pendingTasks.length ? 'Group pending tasks to build the SKU batch list.' : 'Allocate an order first; allocation creates its linked picking task.'}</Empty>}
    </Rows></Panel>}

    {operation === 'single' && <Panel><Rows headers={['Task / order', 'Pick items', 'Picker / status', 'Action']}>
      {tasks.filter((t) => t.type === 'single').map((t) => <tr key={t.id}><td><OrderLink order={orderFor(t.orderId)} fallback={t.orderNumber} /><div className="text-xs text-gray-500">{t.taskNumber} · single task</div></td><td>{t.items.map((i) => <div key={i.id} className="text-sm">{productSku(i.productId)}: {i.pickedQty}/{i.expectedQty}</div>)}</td><td>{statusLabel(t.status)}</td><td><ActionButton disabled={t.status === 'picked' || t.status === 'completed'} onClick={() => confirmTask(t.id)}>Confirm full pick</ActionButton></td></tr>)}
      {!tasks.some((t) => t.orderType === 'b2c' && t.type === 'single') && <Empty colSpan={4}>Allocate an order first; allocation creates its linked single-order picking task.</Empty>}
    </Rows></Panel>}

    {operation === 'packing' && <Panel><Rows headers={['Order / customer', 'Picked / required', 'Package', 'Action']}>
      {visibleOrders.filter((o) => pendingPack.includes(o)).map((o) => { const pkg = packages.find((p) => p.orderId === o.id && p.status !== 'ready_to_ship'); return <tr key={o.id}><td><OrderLink order={o} /></td><td>{o.items.map((i) => <div key={i.id} className="text-sm">{productSku(i.productId)}: {i.pickedQty}/{i.quantity}</div>)}</td><td>{pkg?.packageNumber ?? 'Not created'}</td><td>{!pkg ? <ActionButton onClick={() => makePackage(o)}>Create package</ActionButton> : <ActionButton onClick={() => verifyAndPack(pkg.id)} disabled={pkg.status === 'packed'}>{pkg.status === 'packed' ? 'Packed' : 'Verify & pack'}</ActionButton>}</td></tr>; })}
      {pendingPack.length === 0 && <Empty colSpan={4}>No picked quantities are waiting for packing.</Empty>}
    </Rows></Panel>}

    {operation === 'labels' && <Panel><Rows headers={['Order', 'Package', 'Label / tracking', 'Action']}>
      {visibleOrders.filter((o) => o.fulfillmentStatus === 'packed' || shipments.some((s) => s.orderId === o.id)).map((o) => { const sh = shipments.find((s) => s.orderId === o.id); const pkg = packages.find((p) => p.orderId === o.id); return <tr key={o.id}><td><OrderLink order={o} /></td><td>{pkg?.packageNumber ?? '—'}</td><td>{sh ? <><div>{sh.carrier}</div><div className="font-mono text-xs">{sh.trackingNumber}</div></> : 'Not generated'}</td><td><ActionButton disabled={!!sh} onClick={() => generateLabel(o)}>{sh ? 'Label generated' : 'Generate mock label'}</ActionButton></td></tr>; })}
      {!orders.some((o) => o.fulfillmentStatus === 'packed' || shipments.some((s) => s.orderId === o.id)) && <Empty colSpan={4}>Pack an order to make it eligible for a label.</Empty>}
    </Rows></Panel>}

    {operation === 'tracking' && <Panel><Rows headers={['Order', 'Carrier / tracking', 'Current status', 'Update']}>
      {shipments.map((s) => { const o = orderFor(s.orderId); const options: ShipmentStatus[] = s.status === 'label_created' ? ['picked_up'] : s.status === 'picked_up' ? ['in_transit'] : s.status === 'in_transit' ? ['out_for_delivery', 'failed', 'delivered'] : s.status === 'out_for_delivery' ? ['delivered', 'failed'] : []; return <tr key={s.id}><td><OrderLink order={o} fallback={s.shipmentNumber} /></td><td>{s.carrier}<div className="font-mono text-xs leading-5">{s.trackingNumber}</div></td><td><Badge variant="secondary">{statusLabel(s.status)}</Badge></td><td><div className="flex flex-wrap gap-2">{options.map((status) => <ActionButton key={status} onClick={() => status === 'picked_up' ? shipmentService.dispatch(s.id) : nextTracking(s.id, status)}>{statusLabel(status)}</ActionButton>)}</div></td></tr>; })}
      {shipments.length === 0 && <Empty colSpan={4}>Generate a shipping label to create a tracked shipment.</Empty>}
    </Rows></Panel>}

    {operation === 'cod' && <Panel><Rows headers={['Order', 'COD amount', 'Collection status', 'Action']}>
      {visibleOrders.filter((o) => o.paymentMethod === 'cod').map((o) => <tr key={o.id}><td><OrderLink order={o} /></td><td>{formatCurrency(o.codAmount ?? o.amount, o.currency)}</td><td><Badge variant="secondary">{statusLabel(o.codStatus ?? 'pending')}</Badge></td><td>{o.codStatus === 'pending' && <div className="flex flex-wrap gap-2"><ActionButton onClick={() => { shipmentService.updateCodCollection(o.id, 'collected'); toast.success('COD collected.'); }}>Mark collected</ActionButton><ActionButton onClick={() => { shipmentService.updateCodCollection(o.id, 'failed'); toast.success('COD collection failed.'); }}>Mark failed</ActionButton></div>}</td></tr>)}
      {!orders.some((o) => o.paymentMethod === 'cod') && <Empty colSpan={4}>Create or import an order with COD to see collection details.</Empty>}
    </Rows></Panel>}

    {operation === 'rto' && <Panel><Rows headers={['Order', 'Carrier / tracking', 'Reason', 'RTO status / action']}>
      {visibleOrders.filter((o) => o.fulfillmentStatus === 'shipped' || o.fulfillmentStatus === 'rto').map((o) => { const s = shipments.find((sh) => sh.orderId === o.id); const stages = ['initiated', 'in_transit', 'received', 'inspected', 'completed'] as const; const next = s?.rtoStatus ? stages[stages.indexOf(s.rtoStatus) + 1] : undefined; return <tr key={o.id}><td><OrderLink order={o} /></td><td>{s?.carrier ?? '—'}<div className="font-mono text-xs leading-5">{s?.trackingNumber ?? '—'}</div></td><td>{s?.rtoReason ?? o.rtoReason ?? '—'}</td><td>{o.fulfillmentStatus === 'shipped' ? <ActionButton disabled={!s} onClick={() => { try { shipmentService.markRTO(s!.id, 'Delivery failed / customer unavailable'); toast.success('RTO linked to the original order.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not start RTO.'); } }}>Mark delivery failed / RTO</ActionButton> : <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{statusLabel(s?.rtoStatus ?? 'initiated')}</Badge>{next && s && <ActionButton onClick={() => { try { shipmentService.advanceRTO(s.id, next); toast.success(`RTO moved to ${statusLabel(next)}.`); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not update RTO.'); } }}>Advance</ActionButton>}</div>}</td></tr>; })}
      {!orders.some((o) => o.fulfillmentStatus === 'shipped' || o.fulfillmentStatus === 'rto') && <Empty colSpan={4}>Only shipped orders can enter the RTO workflow.</Empty>}
    </Rows></Panel>}

    {operation === 'allocation' && eligible.length > 0 && <p className="mt-3 text-xs text-gray-500">Reserved inventory is shared with the WMS inventory ledger. Allocating again is only offered for new orders.</p>}
    <ImportOrdersModal open={importOpen} onOpenChange={setImportOpen} />
  </div>;

  function useBatchType(orderIds: string[]) {
    const taskIds = new Set(tasks.filter((t) => orderIds.includes(t.orderId) && t.status !== 'picked' && t.status !== 'completed').map((t) => t.id));
    wmsDb.mutate((draft) => {
      draft.pickingTasks.forEach((task) => { if (taskIds.has(task.id)) task.type = 'batch'; });
    });
  }
}

function OrderLink({ order, fallback }: { order?: B2COrder; fallback?: string }) {
  return order ? <Link className="font-medium text-blue-700 hover:underline" href={`/b2c/${order.id}`}>{order.orderNumber}<div className="text-xs font-normal text-gray-500">{order.customerName}</div></Link> : <span>{fallback ?? 'Order'}</span>;
}

function Rows({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-[#f8faf9] text-xs uppercase text-[#7c8591]"><tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-semibold">{header}</th>)}</tr></thead><tbody className="divide-y divide-[#f0ede8] [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle">{children}</tbody></table></div>;
}

function Empty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) { return <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-gray-500">{children}</td></tr>; }
