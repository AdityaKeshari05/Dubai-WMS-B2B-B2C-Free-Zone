'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LeadImportDialog } from '@/components/crm/LeadImportDialog';
import { LeadImportBatch } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function LeadImportsPage() {
  const [imports, setImports] = useState<LeadImportBatch[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const res = await api.get('/crm/leads/imports');
    setImports(res.data.data || []);
  };

  useEffect(() => { load().catch(() => toast.error('Failed to load imports')); }, []);

  return (
    <div>
      <PageHeader title="Lead Imports" description="Audit CSV imports, duplicate skips, and failed rows" action={{ label: 'Import Leads', onClick: () => setOpen(true), icon: Upload }} />
      <DataTable data={imports} columns={[
        { key: 'fileName', header: 'File' },
        { key: 'status', header: 'Status', render: (row: LeadImportBatch) => <StatusBadge status={row.status} /> },
        { key: 'totalRows', header: 'Rows' },
        { key: 'createdRows', header: 'Created' },
        { key: 'duplicateRows', header: 'Duplicates' },
        { key: 'failedRows', header: 'Failed' },
        { key: 'createdAt', header: 'Imported', render: (row: LeadImportBatch) => formatDateTime(row.createdAt) },
      ]} />
      <LeadImportDialog open={open} onOpenChange={setOpen} onImported={load} />
    </div>
  );
}
