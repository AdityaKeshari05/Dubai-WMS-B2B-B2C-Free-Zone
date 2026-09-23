'use client';

import { useState } from 'react';
import { Database, Download, Play, RotateCcw } from 'lucide-react';
import {
  Badge, Card, PageHeader, PrimaryButton, SecondaryButton, StatCard, Table, Toast,
} from '@/components/wms/WmsUi';

type Backup = { id: string; type: string; created: string; size: string; status: 'Completed' | 'Running' };

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([
    { id: 'BKP-240923-01', type: 'Automatic', created: '23 Sep 2026, 02:00', size: '1.8 GB', status: 'Completed' },
    { id: 'BKP-230923-02', type: 'Manual', created: '22 Sep 2026, 16:42', size: '1.7 GB', status: 'Completed' },
    { id: 'BKP-230923-01', type: 'Automatic', created: '22 Sep 2026, 02:00', size: '1.7 GB', status: 'Completed' },
  ]);
  const [toast, setToast] = useState('');

  const runBackup = () => {
    const id = `BKP-${Date.now().toString().slice(-6)}`;
    setBackups((prev) => [{ id, type: 'Manual', created: 'Just now', size: '—', status: 'Running' }, ...prev]);
    setToast('Backup started (demo)');
    setTimeout(() => {
      setBackups((prev) => prev.map((b) => b.id === id ? { ...b, size: '1.8 GB', status: 'Completed' } : b));
    }, 1200);
  };

  const download = (id: string) => {
    const blob = new Blob([`Demo backup manifest for ${id}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${id}.txt`; a.click();
    URL.revokeObjectURL(url);
    setToast('Demo backup manifest downloaded');
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Data Backup" description="Monitor backup status, run manual backups and download demo manifests." icon={Database}
        action={<PrimaryButton onClick={runBackup}><Play className="h-4 w-4" /> Run Backup Now</PrimaryButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Last Backup" value="02:00" hint="Today" icon={Database} />
        <StatCard label="Next Backup" value="02:00" hint="Tomorrow" icon={RotateCcw} />
        <StatCard label="Retention" value="30 days" hint="Current policy" icon={Database} />
        <StatCard label="Backup Health" value="Healthy" hint="No failures" icon={Database} />
      </div>
      <Card title="Backup history" description="Recent system backup runs">
        <Table headers={['Backup ID', 'Type', 'Created', 'Size', 'Status', 'Action']} rows={backups.map((b) => [
          <span key="id" className="font-medium text-[#1674c4]">{b.id}</span>, b.type, b.created, b.size,
          <Badge key="s" tone={b.status === 'Completed' ? 'green' : 'blue'}>{b.status}</Badge>,
          <SecondaryButton key="d" disabled={b.status !== 'Completed'} onClick={() => download(b.id)}><Download className="h-4 w-4" /> Download</SecondaryButton>
        ])} />
      </Card>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
