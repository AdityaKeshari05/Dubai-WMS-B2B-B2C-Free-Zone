'use client';

import { SimpleInventoryReport } from '@/components/inventory/SimpleInventoryReport';

export default function SlowMovingStockPage() {
  return <SimpleInventoryReport title="Slow Moving Stock" description="Items with stock on hand but no issue in the last 90 days" endpoint="/inventory/reports/slow-moving-stock" columns={[
    { key: 'sku', header: 'SKU', render: (row: any) => <span className="font-mono text-xs">{row.sku}</span> },
    { key: 'productName', header: 'Item' },
    { key: 'warehouse', header: 'Warehouse' },
    { key: 'quantity', header: 'Qty' },
    { key: 'lastIssueDate', header: 'Last Issue', render: (row: any) => row.lastIssueDate ? new Date(row.lastIssueDate).toLocaleDateString() : 'Never' },
    { key: 'ageDays', header: 'Age Days', render: (row: any) => row.ageDays ?? 'No issue' },
  ]} />;
}
