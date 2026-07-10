'use client';

import { ReportPage } from '@/components/invoicing/InvoicingAdminPages';
import { formatCurrency } from '@/lib/utils';

export default function RevenueByItemPage() {
  return (
    <ReportPage
      title="Revenue by Item"
      description="Submitted invoice revenue grouped by product/item."
      endpoint="/invoicing/reports/revenue-by-item"
      columns={[
        { key: 'sku', header: 'SKU' },
        { key: 'name', header: 'Item' },
        { key: 'quantity', header: 'Qty' },
        { key: 'revenue', header: 'Revenue', render: (r: any) => formatCurrency(r.revenue) },
      ]}
    />
  );
}
