'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PICKING_TASK_STATUS, PRIORITY_VARIANT } from '@/lib/wms/status';

export default function B2BPickingPage() {
  const router = useRouter();
  const allTasks = useWmsDbSelector((s) => s.pickingTasks);
  const orders = useWmsDbSelector((s) => s.b2bOrders);
  const { workers } = useWmsLookups();

  // Only show picking tasks for B2B orders
  const tasks = useMemo(() => allTasks.filter(t => t.orderType === 'b2b'), [allTasks]);
  const workerMap = useMemo(() => new Map(workers.map(w => [w.id, w.name])), [workers]);

  return (
    <div>
      <PageHeader 
        title="6.8 B2B Picking" 
        description="Picking tasks for bulk/wholesale customer orders"
      />

      <DataTable
        data={tasks}
        onRowClick={(t) => router.push(`/wms/fulfillment/picking/${t.id}`)}
        emptyMessage="No B2B picking tasks assigned."
        columns={[
          { key: 'task', header: 'Task #', render: (t) => <span className="font-medium text-[#2490ef]">{t.id}</span> },
          { key: 'order', header: 'Order #', render: (t) => {
            const order = orders.find(o => o.id === t.orderId);
            return <span className="text-gray-900">{order?.orderNumber || t.orderId}</span>;
          }},
          { key: 'assignee', header: 'Assigned To', render: (t) => t.assignedTo ? workerMap.get(t.assignedTo) : <span className="text-gray-400 italic">Unassigned</span> },
          { key: 'items', header: 'Lines', render: (t) => t.items.length },
          { key: 'priority', header: 'Priority', render: (t) => <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge> },
          { key: 'status', header: 'Status', render: (t) => <Badge variant={PICKING_TASK_STATUS.variant(t.status)}>{PICKING_TASK_STATUS.label(t.status)}</Badge> },
          { key: 'date', header: 'Created', render: (t) => formatDate(t.createdAt) },
        ]}
      />
    </div>
  );
}
