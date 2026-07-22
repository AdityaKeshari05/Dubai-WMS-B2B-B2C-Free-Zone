'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarDays, FileText, Filter, ListFilter, PackagePlus, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { InvoiceStatus, SalesInvoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const statuses: Array<{ label: string; value: '' | InvoiceStatus }> = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

function readPagination(payload: any) {
  if (payload?.data?.items) return payload.data;
  if (Array.isArray(payload?.data)) {
    return {
      items: payload.data,
      total: payload.pagination?.total || payload.data.length,
      page: payload.pagination?.page || 1,
      limit: payload.pagination?.limit || 20,
      totalPages: payload.pagination?.totalPages || 1,
    };
  }
  return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
}

function invoiceTotal(invoice: SalesInvoice) {
  return Number(invoice.grandTotal ?? invoice.total ?? 0);
}

function invoiceOutstanding(invoice: SalesInvoice) {
  return Number(invoice.outstandingAmount ?? invoiceTotal(invoice) - Number(invoice.amountPaid || 0));
}

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | InvoiceStatus>('');
  const limit = 20;

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/invoices', {
          params: {
            page,
            limit,
            search: search || undefined,
            status: status || undefined,
          },
        });
        const paged = readPagination(res.data);
        setInvoices(paged.items);
        setTotal(paged.total);
        setTotalPages(paged.totalPages);
      } catch {
        toast.error('Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [page, search, status]);

  return (
    <div className="min-h-[calc(100vh-92px)]">
      <div className="mb-3 flex items-center justify-between border-b border-[#e5e2dc] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f1f5f7] text-[#4b5563]">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1f2937]">Sales Invoice</h1>
            <p className="text-xs text-[#7c8591]">List View · Accounts Receivable</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/sales/orders">
              <PackagePlus className="mr-2 h-4 w-4" />
              Get from
            </Link>
          </Button>
          <Button asChild>
            <Link href="/invoicing/sales-invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Sales Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[72px] space-y-5 border-r border-[#e5e2dc] pr-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#7c8591]">
                <ListFilter className="h-3.5 w-3.5" />
                Views
              </p>
              <div className="space-y-1">
                <button className="w-full rounded-md bg-[#eef6fd] px-2.5 py-1.5 text-left text-sm font-medium text-[#1674c4]">List View</button>
                <Link href="/invoicing/reports/aging" className="block rounded-md px-2.5 py-1.5 text-sm text-[#4b5563] hover:bg-[#f4f5f6]">Aging Report</Link>
                <Link href="/invoicing/reports/outstanding" className="block rounded-md px-2.5 py-1.5 text-sm text-[#4b5563] hover:bg-[#f4f5f6]">Outstanding</Link>
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#7c8591]">
                <Filter className="h-3.5 w-3.5" />
                Filter By
              </p>
              <div className="space-y-2">
                <FilterBox label="Assigned To" value="Me" />
                <FilterBox label="Created By" value="All Users" />
                <FilterBox label="Tags" value="Show Tags" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-[#7c8591]">Saved Filters</p>
              <div className="space-y-1.5">
                <button className="rounded-md bg-[#f4f5f6] px-2 py-1 text-xs font-medium text-[#4b5563]">Status is Not Cancelled</button>
                <button className="rounded-md bg-[#f4f5f6] px-2 py-1 text-xs font-medium text-[#4b5563]">Outstanding &gt; 0</button>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="rounded-md border border-[#e5e2dc] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="border-b border-[#e5e2dc] p-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative max-w-xl flex-1">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3af]" />
                  <Input
                    className="bg-[#f8faf9] pl-8"
                    placeholder="Search by invoice ID, title, or customer"
                    value={search}
                    onChange={event => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                  <Button variant="outline" size="sm"><SlidersHorizontal className="mr-2 h-3.5 w-3.5" />Filter</Button>
                  <Button variant="outline" size="sm"><CalendarDays className="mr-2 h-3.5 w-3.5" />Created On</Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {statuses.map(tab => (
                  <button
                    key={tab.label}
                    className={status === tab.value ? 'rounded-md bg-[#2490ef] px-2.5 py-1.5 text-xs font-medium text-white' : 'rounded-md border border-[#e5e2dc] bg-white px-2.5 py-1.5 text-xs font-medium text-[#4b5563] hover:bg-[#f8faf9]'}
                    onClick={() => {
                      setStatus(tab.value);
                      setPage(1);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {invoices.length === 0 && !isLoading ? (
              <EmptyState
                icon={FileText}
                title="No invoices yet"
                description="Create a draft invoice or pull one from a submitted sales order."
                action={{ label: 'New Invoice', onClick: () => { window.location.href = '/invoicing/sales-invoices/new'; } }}
              />
            ) : (
              <>
                <InvoiceDeskTable invoices={invoices} isLoading={isLoading} />
                {total > limit && <div className="border-t border-[#f0ede8] px-3 py-2"><Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} /></div>}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function FilterBox({ label, value }: { label: string; value: string }) {
  return (
    <button className="flex h-8 w-full items-center justify-between rounded-md border border-[#e5e2dc] bg-white px-2.5 text-left text-xs text-[#4b5563] shadow-sm">
      <span>{label}</span>
      <span className="text-[#9aa3af]">{value}</span>
    </button>
  );
}

function InvoiceDeskTable({ invoices, isLoading }: { invoices: SalesInvoice[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="divide-y divide-[#f0ede8]">
        {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-12 animate-pulse bg-[#f8faf9]" />)}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-sm">
        <thead className="border-b border-[#e5e2dc] bg-[#fbfaf8] text-xs font-medium text-[#6b7280]">
          <tr>
            <th className="w-10 px-3 py-2 text-left"><input type="checkbox" className="h-3.5 w-3.5 rounded border-[#d9d4cc]" /></th>
            <th className="px-3 py-2 text-left">Title</th>
            <th className="px-3 py-2 text-left">Customer</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-right">Grand Total</th>
            <th className="px-3 py-2 text-right">Paid</th>
            <th className="px-3 py-2 text-right">Outstanding</th>
            <th className="px-3 py-2 text-left">Due Date</th>
            <th className="px-3 py-2 text-left">ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0ede8] bg-white">
          {invoices.map(invoice => (
            <tr key={invoice.id} className="cursor-pointer hover:bg-[#f8faf9]" onClick={() => { window.location.href = `/invoicing/sales-invoices/${invoice.id}`; }}>
              <td className="px-3 py-2"><input type="checkbox" className="h-3.5 w-3.5 rounded border-[#d9d4cc]" onClick={event => event.stopPropagation()} /></td>
              <td className="px-3 py-2">
                <Link href={`/invoicing/sales-invoices/${invoice.id}`} className="font-medium text-[#1f2937] hover:text-[#1674c4]">
                  {invoice.customer?.name || invoice.invoiceNo}
                </Link>
                <div className="text-xs text-[#8a929d]">{formatDate(invoice.date)}</div>
              </td>
              <td className="px-3 py-2 text-[#374151]">{invoice.customer?.name || '-'}</td>
              <td className="px-3 py-2"><StatusBadge status={invoice.status} /></td>
              <td className="px-3 py-2 text-right font-medium">{formatCurrency(invoiceTotal(invoice), invoice.currency)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(Number(invoice.amountPaid || 0), invoice.currency)}</td>
              <td className="px-3 py-2 text-right font-semibold text-[#c3423f]">{formatCurrency(invoiceOutstanding(invoice), invoice.currency)}</td>
              <td className="px-3 py-2 text-[#6b7280]">{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</td>
              <td className="px-3 py-2 font-mono text-xs text-[#1674c4]">{invoice.invoiceNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
