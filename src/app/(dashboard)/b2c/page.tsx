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
import { CreateB2COrderModal } from '@/components/b2c/CreateB2COrderModal';
import { ImportOrdersModal } from '@/components/b2c/ImportOrdersModal';
import type { B2CFulfillmentStatus } from '@/types';

export default function B2COrdersPage() {
  const router = useRouter();
  const orders = useWmsDbSelector((s) => s.b2cOrders);
  const returns = useWmsDbSelector((s) => s.returns);
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
          if (!o.orderNumber.toLowerCase().includes(q) && !o.sourceOrderNumber?.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q)) return false;
        }
        return true;
      });
  }, [orders, status, channel, search]);

  const stats = useMemo(() => {
    const count = (s: string) => orders.filter((o) => o.fulfillmentStatus === s).length;
    return {
      total: orders.length,
      pendingAllocation: count('new'),
      allocated: count('allocated'),
      picking: count('picking'),
      packed: count('packed'),
      shipped: count('shipped'),
      delivered: count('delivered'),
      rto: count('rto'),
      cod: orders.filter((o) => o.paymentMethod === 'cod').length,
      returns: returns.filter((r) => r.orderType === 'b2c').length,
    };
  }, [orders, returns]);

  async function handleSync() {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 400));
    b2cOrderService.sync();
    setSyncing(false);
    toast.success('Orders are up to date with all channels');
  }

  return (
    <div className="space-y-5">
      <PageHeader title="B2C Orders" description="E-commerce and marketplace order fulfillment">
        <Button variant="outline" onClick={handleSync} disabled={syncing}><RefreshCw className={`mr-1.5 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />Sync</Button>
        <Button variant="outline" onClick={() => setImportOpen(true)}><Download className="mr-1.5 h-4 w-4" />Import Orders</Button>
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Create Order</Button>
      </PageHeader>

      {lastSync ? <p className="-mt-3 text-sm leading-5 text-gray-500">Last synced {formatDateTime(lastSync)}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatsCard title="Total" value={stats.total} icon={ShoppingBag} />
        <StatsCard title="Pending Allocation" value={stats.pendingAllocation} subtitle="new orders" icon={ClipboardList} iconColor="text-gray-600" iconBg="bg-gray-100" />
        <StatsCard title="Allocated" value={stats.allocated} icon={Boxes} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Picking" value={stats.picking} icon={ClipboardList} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Packed" value={stats.packed} icon={PackageCheck} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <StatsCard title="Shipped" value={stats.shipped} icon={Truck} />
        <StatsCard title="Delivered" value={stats.delivered} icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="COD Orders" value={stats.cod} icon={ShoppingBag} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="RTO" value={stats.rto} icon={Truck} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatsCard title="Customer Returns" value={stats.returns} icon={PackageCheck} iconColor="text-blue-600" iconBg="bg-blue-50" />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-[#e5e2dc] bg-white p-4">
        <Input placeholder="Search order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64" />
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
        comfortable
        data={filtered}
        onRowClick={(o) => router.push(`/b2c/${o.id}`)}
        emptyMessage="No B2C orders found"
        columns={[
          { key: 'orderNumber', header: 'Order #', render: (o) => <span className="font-medium text-[#2490ef]">{o.orderNumber}{o.sourceOrderNumber && <span className="block text-xs font-normal text-gray-500">Source: {o.sourceOrderNumber}</span>}</span> },
          { key: 'channel', header: 'Channel', render: (o) => <span className="capitalize">{o.channel}</span> },
          { key: 'customerName', header: 'Customer' },
          { key: 'priority', header: 'Priority', render: (o) => <span className="capitalize">{o.priority ?? 'normal'}</span> },
          { key: 'items', header: 'Items', render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
          { key: 'amount', header: 'Amount', render: (o) => formatCurrency(o.amount, o.currency) },
          { key: 'payment', header: 'Payment', render: (o) => <div className="space-y-1"><Badge variant={o.paymentStatus === 'paid' ? 'success' : o.paymentStatus === 'failed' ? 'destructive' : 'warning'}>{o.paymentMethod === 'cod' ? 'COD' : 'Prepaid'} · {o.paymentStatus ?? (o.paymentMethod === 'cod' ? 'pending' : 'paid')}</Badge>{o.paymentMethod === 'cod' && <span className="block text-xs text-gray-500">Collection: {o.codStatus ?? 'pending'}</span>}</div> },
          { key: 'status', header: 'Status', render: (o) => <Badge variant={B2C_ORDER_STATUS.variant(o.fulfillmentStatus)}>{B2C_ORDER_STATUS.label(o.fulfillmentStatus)}</Badge> },
          { key: 'tracking', header: 'Carrier / Tracking', render: (o) => <span>{o.carrier ? `${o.carrier} · ` : ''}{o.trackingNumber ?? '-'}</span> },
          { key: 'date', header: 'Date', render: (o) => formatDate(o.orderDate) },
        ]}
      />

      <CreateB2COrderModal open={createOpen} onOpenChange={setCreateOpen} />
      <ImportOrdersModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
