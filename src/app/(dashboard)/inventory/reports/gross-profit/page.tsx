'use client';

import { formatCurrency } from '@/lib/utils';
import { SimpleInventoryReport } from '@/components/inventory/SimpleInventoryReport';

export default function GrossProfitPage() {
  return <SimpleInventoryReport title="Gross Profit" description="Sales order revenue, estimated cost, profit, and margin" endpoint="/inventory/reports/gross-profit" columns={[
    { key: 'orderNo', header: 'Sales Order', render: (row: any) => <span className="font-mono text-xs">{row.orderNo}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'revenue', header: 'Revenue', render: (row: any) => formatCurrency(row.revenue) },
    { key: 'cost', header: 'Cost', render: (row: any) => formatCurrency(row.cost) },
    { key: 'grossProfit', header: 'Gross Profit', render: (row: any) => formatCurrency(row.grossProfit) },
    { key: 'grossMargin', header: 'Margin %', render: (row: any) => `${Number(row.grossMargin || 0).toFixed(2)}%` },
  ]} />;
}
