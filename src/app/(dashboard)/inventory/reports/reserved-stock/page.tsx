'use client';

import { SimpleInventoryReport } from '@/components/inventory/SimpleInventoryReport';

export default function ReservedStockPage() {
  return <SimpleInventoryReport title="Reserved Stock" description="Open stock reservations linked to confirmed sales orders" endpoint="/inventory/reports/reserved-stock" columns={[
    { key: 'item', header: 'Item', render: (row: any) => `${row.product?.sku || ''} ${row.product?.name || ''}`.trim() },
    { key: 'warehouse', header: 'Warehouse', render: (row: any) => row.warehouse?.name || '-' },
    { key: 'salesOrder', header: 'Sales Order', render: (row: any) => row.salesOrder?.orderNo || '-' },
    { key: 'customer', header: 'Customer', render: (row: any) => row.salesOrder?.customer?.name || '-' },
    { key: 'reservedQty', header: 'Reserved' },
    { key: 'fulfilledQty', header: 'Fulfilled' },
    { key: 'openQty', header: 'Open' },
    { key: 'status', header: 'Status' },
  ]} />;
}
