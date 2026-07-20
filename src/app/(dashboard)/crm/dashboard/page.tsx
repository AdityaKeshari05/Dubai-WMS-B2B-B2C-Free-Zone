'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Activity, Target, TrendingUp, Users } from 'lucide-react';
import api from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function CrmDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/crm/dashboard').then((res) => setData(res.data.data)).catch(() => toast.error('Failed to load CRM dashboard'));
  }, []);

  const pipeline = data?.pipeline || {};
  const openValue = data?.openPipelineValue || 0;

  return (
    <div>
      <PageHeader title="CRM Dashboard" description="Lead capture, pipeline health, and follow-up risk in one desk view" />
      <div className="grid gap-3 md:grid-cols-4">
        <StatsCard title="Open Leads" value={(data?.leadCounts?.NEW || 0) + (data?.leadCounts?.CONTACTED || 0)} icon={Users} />
        <StatsCard title="Open Pipeline" value={formatCurrency(openValue, 'USD')} icon={TrendingUp} />
        <StatsCard title="Conversion Rate" value={`${data?.conversionRate || 0}%`} icon={Target} />
        <StatsCard title="Win Rate" value={`${data?.winRate || 0}%`} icon={Activity} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>Pipeline by Stage</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {['PROSPECTING','QUALIFICATION','PROPOSAL','NEGOTIATION','CLOSED_WON','CLOSED_LOST'].map((stage) => (
              <div key={stage} className="grid grid-cols-[180px_1fr_120px] items-center gap-3">
                <StatusBadge status={stage} />
                <div className="h-2 rounded bg-[#eef3f5]">
                  <div className="h-2 rounded bg-[#2490ef]" style={{ width: `${Math.min(100, ((pipeline[stage]?.value || 0) / Math.max(openValue, 1)) * 100)}%` }} />
                </div>
                <div className="text-right text-sm font-medium">{formatCurrency(pipeline[stage]?.value || 0, 'USD')}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Upcoming Activities</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data?.upcomingActivities?.length ? data.upcomingActivities.map((item: any) => (
              <div key={item.id} className="rounded-md border border-[#e5e2dc] p-3">
                <div className="flex items-center justify-between"><StatusBadge status={item.type} /><span className="text-xs text-[#8a929d]">{item.dueDate ? formatDateTime(item.dueDate) : 'No due date'}</span></div>
                <p className="mt-2 text-sm font-medium">{item.subject}</p>
                <p className="text-xs text-[#6b7280]">{item.lead?.title || item.opportunity?.title || 'General CRM'}</p>
              </div>
            )) : <p className="text-sm text-[#6b7280]">No pending follow-ups.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
