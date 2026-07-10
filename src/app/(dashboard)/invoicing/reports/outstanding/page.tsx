'use client';

import { ReportPage } from '@/components/invoicing/InvoicingAdminPages';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function OutstandingReportPage() {
  return (
    <ReportPage
      title="Outstanding Invoices"
      description="Submitted invoices with open receivable balances."
      endpoint="/invoicing/reports/outstanding"
      columns={[
        { key: 'invoiceNo', header: 'Invoice #' },
        { key: 'customer', header: 'Customer', render: (i: any) => i.customer?.name || '-' },
        { key: 'dueDate', header: 'Due Date', render: (i: any) => i.dueDate ? formatDate(i.dueDate) : '-' },
        { key: 'status', header: 'Status', render: (i: any) => <StatusBadge status={i.status} /> },
        { key: 'total', header: 'Total', render: (i: any) => formatCurrency(i.total, i.currency) },
        { key: 'outstandingAmount', header: 'Outstanding', render: (i: any) => formatCurrency(i.outstandingAmount, i.currency) },
      ]}
    />
  );
}
