'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AgingRow {
  customerId: string;
  customerName: string;
  currency: string;
  current: number;
  days0To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  totalOutstanding: number;
}

interface AgingTotals {
  current: number;
  days0To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  totalOutstanding: number;
}

export default function AgingReportPage() {
  const [rows, setRows] = useState<AgingRow[]>([]);
  const [totals, setTotals] = useState<AgingTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices/aging-report')
      .then(res => {
        setRows(res.data?.data || []);
        setTotals(res.data?.totals || null);
      })
      .catch(() => toast.error('Failed to load aging report'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#1f2937]">Accounts Receivable Aging</h1>
        <p className="text-sm text-[#6b7280]">Outstanding balances grouped by customer and overdue age.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Aging Buckets</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-10" />)}</div>
          ) : rows.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No outstanding invoices" description="There is no receivable aging data to show yet." />
          ) : (
            <div className="overflow-x-auto rounded-md border border-[#e5e2dc]">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-[#f8faf9] text-xs uppercase text-[#6b7280]">
                  <tr>
                    <th className="px-3 py-2 text-left">Customer</th>
                    <th className="px-3 py-2 text-right">Current</th>
                    <th className="px-3 py-2 text-right bg-yellow-50">0-30</th>
                    <th className="px-3 py-2 text-right bg-orange-50">31-60</th>
                    <th className="px-3 py-2 text-right bg-red-50">61-90</th>
                    <th className="px-3 py-2 text-right bg-red-100">90+</th>
                    <th className="px-3 py-2 text-right">Total Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ede8]">
                  {rows.map(row => (
                    <tr key={row.customerId}>
                      <td className="px-3 py-2 font-medium">{row.customerName}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(row.current, row.currency)}</td>
                      <td className="px-3 py-2 text-right bg-yellow-50/60">{formatCurrency(row.days0To30, row.currency)}</td>
                      <td className="px-3 py-2 text-right bg-orange-50/70">{formatCurrency(row.days31To60, row.currency)}</td>
                      <td className="px-3 py-2 text-right bg-red-50/80">{formatCurrency(row.days61To90, row.currency)}</td>
                      <td className="px-3 py-2 text-right bg-red-100/80 font-semibold text-[#c3423f]">{formatCurrency(row.days90Plus, row.currency)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(row.totalOutstanding, row.currency)}</td>
                    </tr>
                  ))}
                </tbody>
                {totals && (
                  <tfoot className="sticky bottom-0 border-t border-[#d9d4cc] bg-white font-semibold">
                    <tr>
                      <td className="px-3 py-2">Totals</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(totals.current)}</td>
                      <td className="px-3 py-2 text-right bg-yellow-50">{formatCurrency(totals.days0To30)}</td>
                      <td className="px-3 py-2 text-right bg-orange-50">{formatCurrency(totals.days31To60)}</td>
                      <td className="px-3 py-2 text-right bg-red-50">{formatCurrency(totals.days61To90)}</td>
                      <td className="px-3 py-2 text-right bg-red-100 text-[#c3423f]">{formatCurrency(totals.days90Plus)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(totals.totalOutstanding)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
