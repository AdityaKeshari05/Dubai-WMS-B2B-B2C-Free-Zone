'use client';

import { ReportPage } from '@/components/invoicing/InvoicingAdminPages';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RevenueByPeriodPage() {
  return (
    <ReportPage
      title="Revenue by Period"
      description="Submitted invoice revenue grouped by accounting period."
      endpoint="/invoicing/reports/revenue-by-period"
      columns={[
        { key: 'period', header: 'Period', render: (r: any) => formatDate(r.period) },
        { key: 'invoiceCount', header: 'Invoices' },
        { key: 'revenue', header: 'Revenue', render: (r: any) => formatCurrency(Number(r.revenue || 0)) },
      ]}
    />
  );
}
