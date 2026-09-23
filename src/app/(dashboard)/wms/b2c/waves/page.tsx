'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Layers } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { formatDateTime } from '@/lib/utils';
import { CreateWaveModal } from '@/components/wms/b2c/CreateWaveModal';

const WAVE_VARIANT = { planning: 'secondary', released: 'info', picking: 'purple', completed: 'success' } as const;

export default function WavesPage() {
  const router = useRouter();
  const waves = useWmsDbSelector((s) => s.waves);
  const { warehouses } = useWmsLookups();
  const warehouseMap = new Map(warehouses.map((w) => [w.id, w]));
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Wave Picking" description="Group B2C orders into waves for batch fulfillment" action={{ label: 'Create Wave', onClick: () => setOpen(true), icon: Plus }} />
      <DataTable
        data={[...waves].reverse()}
        onRowClick={(w) => router.push(`/wms/b2c/waves/${w.id}`)}
        emptyMessage="No waves yet"
        columns={[
          { key: 'waveNumber', header: 'Wave #', render: (w) => <span className="font-medium text-[#2490ef]">{w.waveNumber}</span> },
          { key: 'name', header: 'Name' },
          { key: 'warehouse', header: 'Warehouse', render: (w) => warehouseMap.get(w.warehouseId)?.name ?? '—' },
          { key: 'orders', header: 'Orders', render: (w) => w.orderIds.length },
          { key: 'priority', header: 'Priority', render: (w) => <span className="capitalize">{w.priority}</span> },
          { key: 'cutoff', header: 'Cutoff', render: (w) => w.cutoffTime ? formatDateTime(w.cutoffTime) : '-' },
          { key: 'status', header: 'Status', render: (w) => <Badge variant={WAVE_VARIANT[w.status]}>{w.status}</Badge> },
        ]}
      />
      {waves.length === 0 ? <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400"><Layers className="h-3.5 w-3.5" />Create a wave from allocated B2C orders to start batch picking.</p> : null}
      <CreateWaveModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
