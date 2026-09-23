'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, RefreshCw, ShoppingBag, ClipboardList, Boxes, PackageCheck, Truck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { B2C_ORDER_STATUS } from '@/lib/wms/status';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { b2cOrderService } from '@/lib/wms/services/b2cOrderService';
import { CreateB2COrderModal } from '@/components/wms/b2c/CreateB2COrderModal';
import { ImportOrdersModal } from '@/components/wms/b2c/ImportOrdersModal';
import type { B2CFulfillmentStatus } from '@/types';

export default function B2COrdersPage() {
  const router = useRouter();
  const orders = useWmsDbSelector((s) => s.b2cOrders);
  const lastSync = useWmsDbSelector((s) => s.meta.lastSync);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [channel, setChannel] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const filtered = useMemo(() => {
    return [...orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((o) => {
        if (status !== 'ALL' && o.fulfillmentStatus !== status) return false;
        if (channel !== 'ALL' && o.channel !== channel) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!o.orderNumber.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q)) return false;
        }
        return true;
      });
  }, [orders, status, channel, search]);

  const stats = useMemo(() => {
    const count = (s: string) => orders.filter((o) => o.fulfillmentStatus === s).length;
    return {
      total: orders.length,
      new: count('new'),
      allocated: count('allocated'),
      picking: count('picking'),
      packing: count('packing') + count('packed'),
      shipped: count('shipped'),
      delivered: count('delivered'),
      rto: count('rto'),
    };
  }, [orders]);

  async function handleSync() {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 400));
    b2cOrderService.sync();
    setSyncing(false);
    toast.success('Orders are up to date with all channels');
  }

  return (
    <div>
      <PageHeader title="B2C Orders" description="E-commerce and marketplace order fulfillment">
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}><RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />Sync</Button>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Download className="mr-1.5 h-3.5 w-3.5" />Import Orders</Button>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1.5 h-3.5 w-3.5" />Create Order</Button>
      </PageHeader>

      {lastSync ? <p className="mb-3 text-xs text-gray-400">Last synced {formatDateTime(lastSync)}</p> : null}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatsCard title="Total" value={stats.total} icon={ShoppingBag} />
        <StatsCard title="New" value={stats.new} icon={ClipboardList} iconColor="text-gray-600" iconBg="bg-gray-100" />
        <StatsCard title="Allocated" value={stats.allocated} icon={Boxes} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Picking" value={stats.picking} icon={ClipboardList} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Packing" value={stats.packing} icon={PackageCheck} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <StatsCard title="Shipped" value={stats.shipped} icon={Truck} />
        <StatsCard title="Delivered" value={stats.delivered} icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Input placeholder="Search order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Channels</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="noon">Noon</SelectItem>
            <SelectItem value="marketplace">Marketplace</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {(['new', 'allocated', 'picking', 'packing', 'packed', 'shipped', 'delivered', 'rto', 'returned', 'cancelled'] as B2CFulfillmentStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{B2C_ORDER_STATUS.label(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filtered}
        onRowClick={(o) => router.push(`/wms/b2c/${o.id}`)}
        emptyMessage="No B2C orders found"
        columns={[
          { key: 'orderNumber', header: 'Order #', render: (o) => <span className="font-medium text-[#2490ef]">{o.orderNumber}</span> },
          { key: 'channel', header: 'Channel', render: (o) => <span className="capitalize">{o.channel}</span> },
          { key: 'customerName', header: 'Customer' },
          { key: 'items', header: 'Items', render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
          { key: 'amount', header: 'Amount', render: (o) => formatCurrency(o.amount, o.currency) },
          { key: 'payment', header: 'Payment', render: (o) => o.paymentMethod === 'cod' ? <Badge variant={o.codStatus === 'collected' ? 'success' : o.codStatus === 'failed' ? 'destructive' : 'warning'}>COD {o.codStatus ?? 'pending'}</Badge> : <Badge variant="info">Prepaid</Badge> },
          { key: 'status', header: 'Status', render: (o) => <Badge variant={B2C_ORDER_STATUS.variant(o.fulfillmentStatus)}>{B2C_ORDER_STATUS.label(o.fulfillmentStatus)}</Badge> },
          { key: 'tracking', header: 'Tracking', render: (o) => o.trackingNumber ?? '-' },
          { key: 'date', header: 'Date', render: (o) => formatDate(o.orderDate) },
        ]}
      />

      <CreateB2COrderModal open={createOpen} onOpenChange={setCreateOpen} />
      <ImportOrdersModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
