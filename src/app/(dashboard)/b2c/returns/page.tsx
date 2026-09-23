'use client';
import { Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { RETURN_STATUS } from '@/lib/wms/status';
import { returnService } from '@/lib/wms/services/returnService';
import { locationService } from '@/lib/wms/services/locationService';
import { formatDateTime } from '@/lib/utils';
import type { ReturnStatus } from '@/types';

const NEXT_ACTION: Partial<Record<ReturnStatus, { label: string; next: ReturnStatus }>> = {
  requested: { label: 'Approve', next: 'approved' },
  approved: { label: 'Mark Received', next: 'received' },
  received: { label: 'Inspect', next: 'inspected' },
};

export default function ReturnsPage() {
  const returns = useWmsDbSelector((s) => s.returns.filter((r) => r.orderType === 'b2c'));
  const { products, warehouses } = useWmsLookups();
  const productMap = new Map(products.map((p) => [p.id, p]));

  function advance(returnId: string, status: ReturnStatus) {
    const warehouseId = warehouses[0]?.id ?? '';
    const returnsBin = locationService.ensureDefaultBin(warehouseId);
    returnService.advance(returnId, status, warehouseId, returnsBin.id);
    toast.success(`Moved to ${status}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Customer Returns" description="Return requests, inspection and restocking" />
      <DataTable
        comfortable
        data={[...returns].reverse()}
        emptyMessage="No returns yet"
        columns={[
          { key: 'returnNumber', header: 'Return #', render: (r) => <span className="font-medium text-gray-900">{r.returnNumber}</span> },
          { key: 'customerName', header: 'Customer' },
          { key: 'items', header: 'Items', render: (r) => r.items.map((i) => `${productMap.get(i.productId)?.name} ×${i.quantity} (${i.condition})`).join(', ') },
          { key: 'status', header: 'Status', render: (r) => <Badge variant={RETURN_STATUS.variant(r.status)}>{RETURN_STATUS.label(r.status)}</Badge> },
          { key: 'requested', header: 'Requested', render: (r) => formatDateTime(r.createdAt) },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => {
              const action = NEXT_ACTION[r.status as ReturnStatus];
              if (action) return <Button size="sm" variant="outline" onClick={() => advance(r.id, action.next)}>{action.label}</Button>;
              if (r.status === 'inspected') {
                return (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => advance(r.id, 'restocked')}>Restock</Button>
                    <Button size="sm" variant="destructive" onClick={() => advance(r.id, 'damaged')}>Mark Damaged</Button>
                  </div>
                );
              }
              return <span className="text-xs text-gray-400">-</span>;
            },
          },
        ]}
      />
      {returns.length === 0 ? <p className="flex items-center gap-2 text-sm leading-5 text-gray-500"><Undo2 className="h-4 w-4 shrink-0" />Returns created from an order&apos;s detail page will show here.</p> : null}
    </div>
  );
}
