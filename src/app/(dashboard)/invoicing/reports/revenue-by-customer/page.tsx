'use client';

import { ReportPage } from '@/components/invoicing/InvoicingAdminPages';
import { formatCurrency } from '@/lib/utils';

export default function RevenueByCustomerPage() {
  return (
    <ReportPage
      title="Revenue by Customer"
      description="Submitted invoice revenue grouped by customer."
      endpoint="/invoicing/reports/revenue-by-customer"
      columns={[
        { key: 'customerName', header: 'Customer' },
        { key: 'invoiceCount', header: 'Invoices' },
        { key: 'revenue', header: 'Revenue', render: (r: any) => formatCurrency(r.revenue) },
      ]}
    />
  );
}
