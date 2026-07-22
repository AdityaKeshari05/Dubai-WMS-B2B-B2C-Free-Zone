'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';

const reportTabs = [
  ['trial', 'Trial Balance', '/accounting/reports/trial-balance'],
  ['gl', 'General Ledger', '/accounting/reports/general-ledger'],
  ['pl', 'P&L', '/accounting/reports/profit-and-loss'],
  ['bs', 'Balance Sheet', '/accounting/reports/balance-sheet'],
  ['cf', 'Cash Flow', '/accounting/reports/cash-flow'],
  ['budget', 'Budget vs Actual', '/accounting/reports/budget-vs-actual'],
  ['arap', 'AR/AP Ledger', '/accounting/reports/ar-ap-ledger'],
  ['tax', 'Tax Ledger', '/accounting/reports/tax-ledger'],
];

export default function AccountingReportsPage() {
  const [active, setActive] = useState('trial');
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [dates, setDates] = useState({ fromDate: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10), toDate: new Date().toISOString().slice(0, 10) });

  const load = async (key = active) => {
    const endpoint = reportTabs.find(([tab]) => tab === key)?.[2] || reportTabs[0][2];
    try {
      const res = await api.get(endpoint, { params: dates });
      const data = res.data.data;
      setSummary(data);
      setRows(Array.isArray(data) ? data : data.items || data.rows || data.lines || data.assets || data.unreconciledGL || []);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load report'); }
  };

  const columns = active === 'gl' ? [
    { key: 'postingDate', header: 'Date', render: (r: any) => formatDate(r.postingDate) },
    { key: 'account', header: 'Account', render: (r: any) => r.account ? `${r.account.code} - ${r.account.name}` : r.accountId },
    { key: 'voucher', header: 'Voucher', render: (r: any) => `${r.voucherType} / ${r.voucherId}` },
    { key: 'debit', header: 'Debit', render: (r: any) => formatCurrency(r.debitBase || r.debit || 0) },
    { key: 'credit', header: 'Credit', render: (r: any) => formatCurrency(r.creditBase || r.credit || 0) },
  ] : [
    { key: 'account', header: 'Account', render: (r: any) => r.accountName || r.account?.name || r.partyId || r.orderNo || r.accountCode || '-' },
    { key: 'type', header: 'Type', render: (r: any) => r.accountType || r.type || r.partyType || '-' },
    { key: 'debit', header: 'Debit', render: (r: any) => r.debit !== undefined ? formatCurrency(r.debit) : '-' },
    { key: 'credit', header: 'Credit', render: (r: any) => r.credit !== undefined ? formatCurrency(r.credit) : '-' },
    { key: 'amount', header: 'Amount', render: (r: any) => formatCurrency(r.amount ?? r.balance ?? r.outstanding ?? r.actual ?? r.netCashFlow ?? 0) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Accounting Reports" description="GL-based financial statements and audit reports" />
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-[#e5e2dc] p-3">
        <div><label className="text-xs text-[#6b7280]">From</label><Input type="date" value={dates.fromDate} onChange={(e) => setDates((d) => ({ ...d, fromDate: e.target.value }))} /></div>
        <div><label className="text-xs text-[#6b7280]">To</label><Input type="date" value={dates.toDate} onChange={(e) => setDates((d) => ({ ...d, toDate: e.target.value }))} /></div>
        <Button onClick={() => load()}>Generate</Button>
      </div>
      <Tabs value={active} onValueChange={(value) => { setActive(value); setRows([]); setSummary(null); }}>
        <TabsList className="flex h-auto flex-wrap">{reportTabs.map(([key, label]) => <TabsTrigger key={key} value={key}>{label}</TabsTrigger>)}</TabsList>
        {reportTabs.map(([key]) => <TabsContent key={key} value={key} className="space-y-3">
          {summary && !Array.isArray(summary) && <div className="grid gap-3 md:grid-cols-4">{['income','expense','netProfit','netCashFlow','bookBalance','bankBalance','totalTaxDebit','totalTaxCredit'].filter((k) => summary[k] !== undefined).map((k) => <div key={k} className="rounded-md border border-[#e5e2dc] p-3"><p className="text-xs text-[#6b7280]">{k}</p><p className="font-semibold">{formatCurrency(summary[k])}</p></div>)}</div>}
          <DataTable data={rows} columns={columns} />
        </TabsContent>)}
      </Tabs>
    </div>
  );
}
