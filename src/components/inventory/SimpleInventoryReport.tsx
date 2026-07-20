'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';

export function SimpleInventoryReport({ title, description, endpoint, columns }: { title: string; description: string; endpoint: string; columns: any[] }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.get(endpoint)
      .then((res) => setRows(Array.isArray(res.data.data) ? res.data.data : res.data.data?.rows || []))
      .catch(() => toast.error(`Failed to load ${title}`));
  }, [endpoint, title]);
  return <div className="space-y-4"><PageHeader title={title} description={description} /><DataTable data={rows} columns={columns} /></div>;
}
