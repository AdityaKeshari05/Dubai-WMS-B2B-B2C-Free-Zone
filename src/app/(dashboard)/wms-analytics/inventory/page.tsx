'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Boxes, LockKeyhole, Package } from 'lucide-react';
import { AnalyticsHeader, Badge, DataTable, ExportButton, MetricCard, Panel, ProgressBar, SearchField, SelectField } from '@/components/wms/analytics/AnalyticsUi';

type StockRow = { sku: string; product: string; warehouse: string; available: number; reorder: number; status: 'Critical' | 'Low' | 'Healthy' };
const stock: StockRow[] = [
  { sku: 'SKU-10082', product: 'Wireless Scanner', warehouse: 'Dubai Main Warehouse', available: 8, reorder: 25, status: 'Critical' },
  { sku: 'SKU-10441', product: 'Thermal Labels 4x6', warehouse: 'Free Zone Warehouse', available: 34, reorder: 50, status: 'Low' },
  { sku: 'SKU-10919', product: 'Packing Tape 48mm', warehouse: 'Dubai Main Warehouse', available: 19, reorder: 30, status: 'Low' },
  { sku: 'SKU-11207', product: 'Carton - Medium', warehouse: 'Overflow Storage', available: 12, reorder: 40, status: 'Critical' },
  { sku: 'SKU-11702', product: 'Bubble Wrap Roll', warehouse: 'Dubai Main Warehouse', available: 92, reorder: 50, status: 'Healthy' },
];

export default function InventoryDashboard() {
  const [search, setSearch] = useState('');
  const [warehouse, setWarehouse] = useState('All Warehouses');
  const [status, setStatus] = useState('All Statuses');
  const filtered = useMemo(() => stock.filter((row) => {
    const query = search.toLowerCase();
    return (!query || row.sku.toLowerCase().includes(query) || row.product.toLowerCase().includes(query)) &&
      (warehouse === 'All Warehouses' || row.warehouse === warehouse) &&
      (status === 'All Statuses' || row.status === status);
  }), [search, warehouse, status]);

  return <div className="space-y-5">
    <AnalyticsHeader title="Inventory Dashboard" description="Stock availability, ageing, utilization and risk across warehouses." icon={Boxes}>
      <ExportButton filename="inventory-watchlist" rows={filtered.map((row) => ({ SKU: row.sku, Product: row.product, Warehouse: row.warehouse, Available: row.available, ReorderPoint: row.reorder, Status: row.status }))} />
    </AnalyticsHeader>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total SKUs" value="3,842" hint="2,911 active" icon={Package}/>
      <MetricCard label="Available Stock" value="38,920" hint="91.0% of on-hand" icon={Boxes}/>
      <MetricCard label="Reserved Stock" value="3,240" hint="Allocated to open orders" icon={LockKeyhole}/>
      <MetricCard label="Low / At Risk" value={String(stock.filter((r) => r.status !== 'Healthy').length)} hint="Filtered watchlist below" icon={AlertTriangle}/>
    </div>
    <div className="grid gap-5 xl:grid-cols-3">
      <Panel className="xl:col-span-2" title="Warehouse capacity" description="Used versus configured storage capacity"><div className="space-y-5 p-5"><ProgressBar label="Dubai Main Warehouse" value={78} right="7,800 / 10,000 bins"/><ProgressBar label="Free Zone Warehouse" value={63} right="3,150 / 5,000 bins"/><ProgressBar label="Overflow Storage" value={41} right="820 / 2,000 bins"/></div></Panel>
      <Panel title="Stock status" description="Current units by status"><div className="space-y-4 p-5">{[['Available','38,920','green'],['Reserved','3,240','blue'],['Quarantine','412','amber'],['Damaged','188','red']].map(([name,value,tone]) => <div key={name} className="flex items-center justify-between"><span className="text-sm text-[#4b5563]">{name}</span><Badge tone={tone as any}>{value}</Badge></div>)}</div></Panel>
    </div>
    <Panel title="Stock watchlist" description="Search and filter low-stock inventory" action={<div className="flex flex-wrap gap-2"><div className="w-64"><SearchField value={search} onChange={setSearch} placeholder="Search SKU or product..."/></div><SelectField value={warehouse} onChange={setWarehouse}><option>All Warehouses</option><option>Dubai Main Warehouse</option><option>Free Zone Warehouse</option><option>Overflow Storage</option></SelectField><SelectField value={status} onChange={setStatus}><option>All Statuses</option><option>Critical</option><option>Low</option><option>Healthy</option></SelectField></div>}>
      <DataTable rows={filtered} rowKey={(row) => row.sku} columns={[
        { label:'SKU', render:(row)=><b className="text-[#1674c4]">{row.sku}</b> }, { label:'Product', render:(row)=>row.product }, { label:'Warehouse', render:(row)=>row.warehouse }, { label:'Available', render:(row)=>row.available }, { label:'Reorder Point', render:(row)=>row.reorder }, { label:'Status', render:(row)=><Badge tone={row.status==='Critical'?'red':row.status==='Low'?'amber':'green'}>{row.status}</Badge> }
      ]}/>
    </Panel>
  </div>;
}
