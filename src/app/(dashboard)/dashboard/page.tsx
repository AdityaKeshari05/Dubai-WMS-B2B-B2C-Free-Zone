'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, FileText, ShoppingCart, Package, TrendingUp, UserCheck, CheckSquare } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const monthlyData = Array.isArray(stats?.monthlyRevenue)
    ? stats.monthlyRevenue.map((d: any) => ({
        month: new Date(d.month).toLocaleString('default', { month: 'short' }),
        revenue: Number(d.revenue) || 0,
      }))
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold leading-7 text-[#1f2937]">Dashboard</h1>
        <p className="text-sm text-[#6b7280]">Your operational desk for revenue, stock, invoices, and leads.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Revenue" value={formatCurrency(stats?.revenue.total || 0)} icon={DollarSign} iconColor="text-[#0f9d58]" iconBg="bg-[#eefaf3]" />
        <StatsCard title="Total Expenses" value={formatCurrency(stats?.expenses.total || 0)} icon={TrendingUp} iconColor="text-[#c3423f]" iconBg="bg-[#fff1f0]" />
        <StatsCard title="Pending Invoices" value={`${stats?.pendingInvoices.count || 0}`} subtitle={formatCurrency(stats?.pendingInvoices.amount || 0)} icon={FileText} iconColor="text-[#d98324]" iconBg="bg-[#fff7ed]" />
        <StatsCard title="Active Customers" value={stats?.activeCustomers || 0} icon={Users} iconColor="text-[#1674c4]" iconBg="bg-[#eef6fd]" />
        <StatsCard title="Active Employees" value={stats?.activeEmployees || 0} icon={UserCheck} iconColor="text-[#6350b8]" iconBg="bg-[#f4f1ff]" />
        <StatsCard title="Open Leads" value={stats?.openLeads || 0} icon={TrendingUp} iconColor="text-[#1674c4]" iconBg="bg-[#eef6fd]" />
        <StatsCard title="Pending Tasks" value={stats?.pendingTasks || 0} icon={CheckSquare} iconColor="text-[#0f7a8a]" iconBg="bg-[#eef9fb]" />
        <StatsCard title="Low Stock Items" value={stats?.lowStock?.length || 0} icon={Package} iconColor="text-[#d98324]" iconBg="bg-[#fff7ed]" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#2490ef" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-[#8a929d]">No revenue data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            {stats?.lowStock && stats.lowStock.length > 0 ? (
              <div className="space-y-2">
                {stats.lowStock.slice(0, 6).map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border border-[#f0ede8] px-3 py-2">
                    <div><p className="text-sm font-medium text-[#374151]">{item.name}</p><p className="text-xs text-[#8a929d]">{item.sku}</p></div>
                    <div className="text-right"><p className="text-sm font-semibold text-[#c3423f]">{item.currentStock}</p><p className="text-xs text-[#8a929d]">min: {item.minStockLevel}</p></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[#8a929d]">All products are well stocked</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentInvoices?.length ? stats.recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between border-b border-[#f0ede8] py-2 last:border-0">
                  <div><p className="text-sm font-medium text-[#374151]">{inv.invoiceNo}</p><p className="text-xs text-[#8a929d]">{(inv.customer as any)?.name}</p></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold text-[#374151]">{formatCurrency(inv.total)}</span><StatusBadge status={inv.status} /></div>
                </div>
              )) : <p className="py-4 text-center text-sm text-[#8a929d]">No invoices yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Leads</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentLeads?.length ? stats.recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between border-b border-[#f0ede8] py-2 last:border-0">
                  <div><p className="text-sm font-medium text-[#374151]">{lead.firstName} {lead.lastName}</p><p className="text-xs text-[#8a929d]">{lead.company || 'Individual'}</p></div>
                  <StatusBadge status={lead.status} />
                </div>
              )) : <p className="py-4 text-center text-sm text-[#8a929d]">No leads yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
