'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { Quotation } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 20;

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/sales/quotations', { params: { page, limit } });
      setQuotations(res.data.data.items);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load quotations'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchQuotations(); }, [page]);

  const handleConvert = async (id: string) => {
    try {
      await api.post(`/sales/quotations/${id}/convert`);
      toast.success('Quotation converted to sales order');
      fetchQuotations();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'quotationNo', header: 'Quotation #', render: (q: Quotation) => <span className="font-mono text-sm font-semibold text-blue-600">{q.quotationNo}</span> },
    { key: 'customer', header: 'Customer', render: (q: Quotation) => (q.customer as any)?.name || '—' },
    { key: 'date', header: 'Date', render: (q: Quotation) => formatDate(q.date) },
    { key: 'validUntil', header: 'Valid Until', render: (q: Quotation) => q.validUntil ? formatDate(q.validUntil) : '—' },
    { key: 'total', header: 'Total', render: (q: Quotation) => <span className="font-semibold">{formatCurrency(q.total, q.currency)}</span> },
    { key: 'status', header: 'Status', render: (q: Quotation) => <StatusBadge status={q.status} /> },
    { key: 'actions', header: '', render: (q: Quotation) => (
      q.status === 'ACCEPTED' || q.status === 'SENT' ? (
        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleConvert(q.id); }}>→ Order</Button>
      ) : null
    )},
  ];

  return (
    <div>
      <PageHeader title="Quotations" description="Manage sales quotations" />
      {quotations.length === 0 && !isLoading ? (
        <EmptyState icon={FileText} title="No quotations" description="Quotations will appear here" />
      ) : (
        <>
          <DataTable columns={columns} data={quotations} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
