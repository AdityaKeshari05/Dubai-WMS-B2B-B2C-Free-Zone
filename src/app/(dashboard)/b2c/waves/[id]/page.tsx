'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, PlayCircle, Layers } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { B2C_ORDER_STATUS } from '@/lib/wms/status';
import { waveService } from '@/lib/wms/services/waveService';
import { batchPickingService } from '@/lib/wms/services/batchPickingService';

export default function WaveDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products } = useWmsLookups();
  const wave = useWmsDbSelector((s) => s.waves.find((w) => w.id === id));
  const orders = useWmsDbSelector((s) => s.b2cOrders.filter((o) => wave?.orderIds.includes(o.id)));
  const tasks = useWmsDbSelector((s) => s.pickingTasks.filter((t) => t.waveId === id && t.orderType === 'b2c'));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const [starting, setStarting] = useState(false);
  const [pickInputs, setPickInputs] = useState<Record<string, number>>({});

  if (!wave) {
    return <div><PageHeader title="Wave Not Found" /></div>;
  }

  const groups = batchPickingService.groupByProduct(tasks);

  async function handleStartBatchPicking() {
    setStarting(true);
    try {
      waveService.release(wave!.id);
      toast.success('Wave released; its existing order tasks are ready for batch picking.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start batch picking');
    } finally {
      setStarting(false);
    }
  }

  function handleConfirmGroup(productId: string) {
    const group = groups.find((g) => g.productId === productId);
    const qty = pickInputs[productId];
    if (!group || !qty) return;
    try {
      batchPickingService.distributePick(group, qty);
      setPickInputs((prev) => ({ ...prev, [productId]: 0 }));
      toast.success(`${qty} unit(s) distributed across orders`);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not confirm this batch.'); }
  }

  return (
    <div className="space-y-5">
      <Link href="/b2c/waves" className="inline-flex items-center gap-2 text-sm leading-5 text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Waves
      </Link>
      <PageHeader title={wave.name} description={`${wave.waveNumber} · ${wave.orderIds.length} order(s)`}>
        {wave.status === 'planning' ? (
          <Button size="sm" onClick={handleStartBatchPicking} disabled={starting}><PlayCircle className="mr-1.5 h-3.5 w-3.5" />Release Wave</Button>
        ) : (
          <Badge variant="purple">Batch Picking In Progress</Badge>
        )}
      </PageHeader>

      <div className="overflow-x-auto rounded-md border border-[#e5e2dc] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8faf9] text-xs leading-5 text-[#7c8591]"><tr><th className="px-4 py-3 text-left">Order #</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-right">Items</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100">
                <td className="px-4 py-3 leading-5"><Link href={`/b2c/${o.id}`} className="font-medium text-[#2490ef]">{o.orderNumber}</Link></td>
                <td className="px-4 py-3 leading-5">{o.customerName}</td>
                <td className="px-4 py-3 text-right leading-5">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td className="px-4 py-3 leading-5"><Badge variant={B2C_ORDER_STATUS.variant(o.fulfillmentStatus)}>{B2C_ORDER_STATUS.label(o.fulfillmentStatus)}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length > 0 ? (
        <>
          <h3 className="flex items-center gap-2 text-sm font-semibold leading-5 text-gray-900"><Layers className="h-4 w-4" /> Batch Pick by Product</h3>
          <div className="overflow-x-auto rounded-md border border-[#e5e2dc] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8faf9] text-xs leading-5 text-[#7c8591]"><tr><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-right">Expected</th><th className="px-4 py-3 text-right">Picked</th><th className="px-4 py-3 text-left">Orders</th><th className="px-4 py-3 text-left">Pick Quantity</th></tr></thead>
              <tbody>
                {groups.map((g) => {
                  const product = productMap.get(g.productId);
                  const remaining = g.totalExpectedQty - g.totalPickedQty;
                  return (
                    <tr key={g.productId} className="border-t border-gray-100">
                      <td className="px-4 py-3 leading-5 font-medium text-gray-900">{product?.sku} — {product?.name}</td>
                      <td className="px-4 py-3 text-right leading-5">{g.totalExpectedQty}</td>
                      <td className="px-4 py-3 text-right leading-5">{g.totalPickedQty}</td>
                      <td className="max-w-xs px-4 py-3 text-sm leading-5 text-gray-500">{g.taskItems.map((t) => t.orderNumber).join(', ')}</td>
                      <td className="px-4 py-3">
                        {remaining === 0 ? (
                          <Badge variant="success">Complete</Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input type="number" min={0} max={remaining} disabled={wave.status === 'planning'} value={pickInputs[g.productId] ?? ''} onChange={(e) => setPickInputs((prev) => ({ ...prev, [g.productId]: Number(e.target.value) }))} className="w-20 text-right" placeholder="0" />
                            <Button size="sm" disabled={wave.status === 'planning'} onClick={() => handleConfirmGroup(g.productId)}>Confirm</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
