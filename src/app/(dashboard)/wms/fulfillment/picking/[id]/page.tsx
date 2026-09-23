'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, PlayCircle, CheckCircle2, UserPlus, ScanBarcode, Check, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { PICKING_STATUS } from '@/lib/wms/status';
import { pickingService } from '@/lib/wms/services/pickingService';
import type { PickExceptionType } from '@/types';

const EXCEPTION_LABEL: Record<PickExceptionType, string> = {
  shortage: 'Shortage',
  damaged: 'Damaged',
  wrong_location: 'Wrong Location',
  barcode_mismatch: 'Barcode Mismatch',
};

export default function PickingTaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products, warehouses } = useWmsLookups();
  const task = useWmsDbSelector((s) => s.pickingTasks.find((t) => t.id === id));
  const locations = useWmsDbSelector((s) => s.locations);
  const productMap = new Map(products.map((p) => [p.id, p]));
  const warehouseMap = new Map(warehouses.map((w) => [w.id, w]));
  const locationMap = new Map(locations.map((l) => [l.id, l]));

  const [picker, setPicker] = useState('');
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [exceptionItem, setExceptionItem] = useState<string | null>(null);
  const [scans, setScans] = useState<Record<string, string>>({});

  if (!task) {
    return <div><PageHeader title="Task Not Found" /></div>;
  }

  const orderHref = task.orderType === 'b2b' ? `/wms/b2b/${task.orderId}` : `/b2c/${task.orderId}`;
  const allResolved = task.items.every((i) => i.status !== 'pending');

  function handleAssign() {
    if (!picker) return;
    pickingService.assignPicker(task!.id, picker);
    toast.success(`${picker} assigned to ${task!.taskNumber}`);
  }
  function handleStart() {
    pickingService.startTask(task!.id);
  }
  function handleConfirm(itemId: string, expected: number) {
    const qty = inputs[itemId] ?? expected;
    pickingService.confirmPickItem(task!.id, itemId, qty);
    toast.success(`${qty} unit(s) picked`);
  }
  function handleException(itemId: string, type: PickExceptionType) {
    const qty = type === 'shortage' ? (inputs[itemId] ?? 0) : 0;
    pickingService.confirmPickItem(task!.id, itemId, qty, { type, notes: 'Reported via picking screen' });
    toast(EXCEPTION_LABEL[type]);
    setExceptionItem(null);
  }
  function handleComplete() {
    pickingService.completeTask(task!.id);
    toast.success(`${task!.taskNumber} marked completed`);
  }

  return (
    <div>
      <Link href="/wms/fulfillment/picking" className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Picking
      </Link>
      <PageHeader
        title={task.taskNumber}
        description={`Order ${task.orderNumber} · ${warehouseMap.get(task.warehouseId)?.name ?? ''}`}
      >
        <Badge variant={PICKING_STATUS.variant(task.status)}>{PICKING_STATUS.label(task.status)}</Badge>
        {task.status === 'pending' || task.status === 'assigned' ? <Button size="sm" onClick={handleStart}><PlayCircle className="mr-1.5 h-3.5 w-3.5" />Start Picking</Button> : null}
        {allResolved && task.status !== 'completed' ? <Button size="sm" onClick={handleComplete}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Mark Completed</Button> : null}
      </PageHeader>
      <p className="mb-4 text-xs text-gray-400"><Link href={orderHref} className="text-[#2490ef] hover:underline">View order</Link></p>

      {!task.picker ? (
        <div className="mb-5 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <Input placeholder="Picker name" value={picker} onChange={(e) => setPicker(e.target.value)} className="w-56" />
          <Button size="sm" onClick={handleAssign}><UserPlus className="mr-1.5 h-3.5 w-3.5" />Assign Picker</Button>
        </div>
      ) : (
        <p className="mb-5 text-sm text-gray-600">Assigned to <span className="font-medium text-gray-900">{task.picker}</span></p>
      )}

      <div className="space-y-3">
        {task.items.map((item) => {
          const product = productMap.get(item.productId);
          const location = locationMap.get(item.locationId);
          return (
            <Card key={item.id}>
              <CardContent className="pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product?.sku} — {product?.name}</p>
                    <p className="text-xs text-gray-500">
                      Expected {item.expectedQty}
                      {location ? <> · Bin <span className="font-mono">{location.code}</span> · Zone {location.zone}</> : null}
                    </p>
                  </div>
                  <Badge variant={item.status === 'picked' ? 'success' : item.status === 'pending' ? 'secondary' : item.status === 'short' ? 'warning' : 'destructive'}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>

                {item.status === 'pending' ? (
                  exceptionItem === item.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input type="number" min={0} max={item.expectedQty} placeholder="Picked qty" value={inputs[item.id] ?? ''} onChange={(e) => setInputs((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))} className="w-28" />
                      <Button size="sm" variant="outline" onClick={() => handleException(item.id, 'shortage')}>Confirm Shortage</Button>
                      <Button size="sm" variant="outline" onClick={() => handleException(item.id, 'damaged')}>Damaged</Button>
                      <Button size="sm" variant="outline" onClick={() => handleException(item.id, 'wrong_location')}>Wrong Location</Button>
                      <Button size="sm" variant="ghost" onClick={() => setExceptionItem(null)}>Cancel</Button>
                    </div>
                  ) : (
                    (() => {
                      const scanned = scans[item.id] ?? '';
                      const requiresScan = !!product?.barcode;
                      const scanMatched = !requiresScan || scanned === product?.barcode;
                      return (
                        <div className="space-y-2">
                          {requiresScan ? (
                            <div className="flex items-center gap-2">
                              <ScanBarcode className="h-4 w-4 shrink-0 text-gray-400" />
                              <Input
                                placeholder="Scan or enter barcode to confirm SKU"
                                value={scanned}
                                onChange={(e) => setScans((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                className="w-64 font-mono text-xs"
                              />
                              {scanned ? (
                                scanMatched ? (
                                  <span className="flex items-center gap-1 text-xs font-medium text-green-600"><Check className="h-3.5 w-3.5" />Matched</span>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs font-medium text-red-600"><X className="h-3.5 w-3.5" />Barcode mismatch</span>
                                )
                              ) : null}
                            </div>
                          ) : null}
                          <div className="flex flex-wrap items-center gap-2">
                            <Input type="number" min={0} max={item.expectedQty} defaultValue={item.expectedQty} onChange={(e) => setInputs((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))} className="w-24" />
                            <Button size="sm" disabled={!scanMatched} onClick={() => handleConfirm(item.id, item.expectedQty)}>Confirm Pick</Button>
                            <Button size="sm" variant="outline" onClick={() => setExceptionItem(item.id)}>Report Exception</Button>
                          </div>
                        </div>
                      );
                    })()
                  )
                ) : (
                  <p className="text-xs text-gray-500">
                    Picked {item.pickedQty} of {item.expectedQty}
                    {item.exception ? ` · ${EXCEPTION_LABEL[item.exception.type]}: ${item.exception.notes}` : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
