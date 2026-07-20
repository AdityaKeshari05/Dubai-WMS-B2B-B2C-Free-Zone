'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StockLedgerEntry } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StockLedgerReportPage() {
  const [rows, setRows] = useState<StockLedgerEntry[]>([]);

  useEffect(() => {
    api.get('/inventory/reports/stock-ledger')
      .then((res) => setRows(res.data.data || []))
      .catch(() => toast.error('Failed to load stock ledger'));
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Stock Ledger" description="Immutable stock movement, quantity after transaction, valuation, and voucher reference" />
      <DataTable data={rows} columns={[
        { key: 'postingDate', header: 'Posting Date', render: (row: StockLedgerEntry) => formatDate(row.postingDate) },
        { key: 'item', header: 'Item', render: (row: StockLedgerEntry) => <span className="font-medium">{row.product?.sku} - {row.product?.name}</span> },
        { key: 'warehouse', header: 'Warehouse', render: (row: StockLedgerEntry) => row.warehouse?.name || row.warehouseId },
        { key: 'voucher', header: 'Voucher', render: (row: StockLedgerEntry) => <span className="font-mono text-xs">{row.voucherType} / {row.voucherNo}</span> },
        { key: 'actualQty', header: 'Qty Change', render: (row: StockLedgerEntry) => <span className={Number(row.actualQty) < 0 ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>{Number(row.actualQty).toLocaleString()}</span> },
        { key: 'qtyAfterTransaction', header: 'Balance', render: (row: StockLedgerEntry) => Number(row.qtyAfterTransaction).toLocaleString() },
        { key: 'valuationRate', header: 'Valuation Rate', render: (row: StockLedgerEntry) => formatCurrency(row.valuationRate) },
        { key: 'stockValue', header: 'Stock Value', render: (row: StockLedgerEntry) => formatCurrency(row.stockValue) },
      ]} />
    </div>
  );
}
