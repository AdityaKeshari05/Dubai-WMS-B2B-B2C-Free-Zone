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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back! Here&apos;s your business overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={formatCurrency(stats?.revenue.total || 0)} icon={DollarSign} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Total Expenses" value={formatCurrency(stats?.expenses.total || 0)} icon={TrendingUp} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatsCard title="Pending Invoices" value={`${stats?.pendingInvoices.count || 0}`} subtitle={formatCurrency(stats?.pendingInvoices.amount || 0)} icon={FileText} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Active Customers" value={stats?.activeCustomers || 0} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Active Employees" value={stats?.activeEmployees || 0} icon={UserCheck} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Open Leads" value={stats?.openLeads || 0} icon={TrendingUp} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatsCard title="Pending Tasks" value={stats?.pendingTasks || 0} icon={CheckSquare} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatsCard title="Low Stock Items" value={stats?.lowStock?.length || 0} icon={Package} iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            {stats?.lowStock && stats.lowStock.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStock.slice(0, 6).map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-700">{item.name}</p><p className="text-xs text-gray-400">{item.sku}</p></div>
                    <div className="text-right"><p className="text-sm font-bold text-red-600">{item.currentStock}</p><p className="text-xs text-gray-400">min: {item.minStockLevel}</p></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">All products are well stocked</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Invoices</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentInvoices?.length ? stats.recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-gray-700">{inv.invoiceNo}</p><p className="text-xs text-gray-400">{(inv.customer as any)?.name}</p></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold text-gray-700">{formatCurrency(inv.total)}</span><StatusBadge status={inv.status} /></div>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-4">No invoices yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Leads</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentLeads?.length ? stats.recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-gray-700">{lead.firstName} {lead.lastName}</p><p className="text-xs text-gray-400">{lead.company || 'Individual'}</p></div>
                  <StatusBadge status={lead.status} />
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-4">No leads yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
