'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, PhoneCall, Repeat2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { Lead } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED'];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activity, setActivity] = useState({ type: 'NOTE', subject: '', description: '' });

  const load = async () => {
    const res = await api.get(`/crm/leads/${params.id}`);
    setLead(res.data.data);
  };

  useEffect(() => { load().catch(() => toast.error('Failed to load lead')); }, [params.id]);

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/crm/leads/${params.id}`, { status });
      toast.success('Lead status updated');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const addActivity = async () => {
    if (!activity.subject.trim()) return toast.error('Subject is required');
    try {
      await api.post('/crm/activities', { ...activity, leadId: params.id, status: 'COMPLETED' });
      setActivity({ type: 'NOTE', subject: '', description: '' });
      toast.success('Activity logged');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not log activity');
    }
  };

  const convert = async () => {
    try {
      const res = await api.post(`/crm/leads/${params.id}/convert`);
      toast.success('Converted to opportunity');
      router.push(`/crm/opportunities?highlight=${res.data.data?.id || ''}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Conversion failed');
    }
  };

  const qualify = async () => {
    try {
      const res = await api.post(`/crm/leads/${params.id}/qualify`);
      toast.success('Lead qualified into opportunity');
      router.push(`/crm/opportunities?highlight=${res.data.data?.id || ''}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Qualification failed');
    }
  };

  const markLost = async () => {
    const lostReason = window.prompt('Why is this lead lost?', lead?.lostReason || 'Not qualified');
    if (!lostReason) return;
    try {
      await api.post(`/crm/leads/${params.id}/mark-lost`, { lostReason });
      toast.success('Lead marked lost');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not mark lead lost');
    }
  };

  if (!lead) return <div className="space-y-3"><div className="h-8 w-64 animate-pulse rounded bg-[#eef3f5]" /><div className="h-40 animate-pulse rounded bg-[#f7f8fa]" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/crm/leads')}><ArrowLeft className="mr-2 h-4 w-4" />Back to leads</Button>
          <h1 className="mt-2 text-xl font-semibold text-[#1f2937]">{lead.title}</h1>
          <p className="text-sm text-[#6b7280]">{lead.firstName} {lead.lastName} · {lead.company || lead.organization?.name || 'No company'}</p>
        </div>
        <div className="flex gap-2">
          {lead.status !== 'CONVERTED' && lead.status !== 'UNQUALIFIED' && (
            <>
              <Button variant="outline" onClick={markLost}><XCircle className="mr-2 h-4 w-4" />Mark Lost</Button>
              <Button onClick={qualify}><Repeat2 className="mr-2 h-4 w-4" />Qualify & Create Deal</Button>
            </>
          )}
          {lead.status !== 'CONVERTED' && <Button variant="secondary" onClick={convert}><Repeat2 className="mr-2 h-4 w-4" />Convert</Button>}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Lead Profile</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Info label="Status"><StatusBadge status={lead.status} /></Info>
              <Info label="Priority"><StatusBadge status={lead.priority} /></Info>
              <Info label="Estimated Value">{lead.value ? formatCurrency(lead.value, 'USD') : '-'}</Info>
              <Info label="Email">{lead.email || '-'}</Info>
              <Info label="Phone">{lead.phone || '-'}</Info>
              <Info label="Source">{lead.source}</Info>
              <Info label="Location">{[lead.city, lead.country].filter(Boolean).join(', ') || '-'}</Info>
              <Info label="Owner">{lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : '-'}</Info>
              <Info label="Created">{formatDateTime(lead.createdAt)}</Info>
              <Info label="Score">{lead.score || 0}</Info>
              <Info label="Organization">{lead.organization ? <Link className="text-[#1674c4]" href={`/crm/organizations/${lead.organization.id}`}>{lead.organization.name}</Link> : lead.company || '-'}</Info>
              <Info label="Opportunity">{lead.opportunity ? <Link className="text-[#1674c4]" href={`/crm/opportunities/${lead.opportunity.id}`}>{lead.opportunity.title}</Link> : '-'}</Info>
              <Info label="ERP Customer">{lead.opportunity?.customer ? <Link className="text-[#1674c4]" href={`/customers/${lead.opportunity.customer.id}`}>{lead.opportunity.customer.customerNo}</Link> : '-'}</Info>
              <div className="md:col-span-3"><Info label="Notes">{lead.notes || '-'}</Info></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {lead.activities?.length ? lead.activities.map((item: any) => (
                <div key={item.id} className="rounded-md border border-[#e5e2dc] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2"><StatusBadge status={item.type} /><span className="font-medium">{item.subject}</span></div>
                    <span className="text-xs text-[#8a929d]">{formatDateTime(item.createdAt)}</span>
                  </div>
                  {item.description && <p className="mt-2 text-sm text-[#4b5563]">{item.description}</p>}
                </div>
              )) : <p className="text-sm text-[#6b7280]">No activity yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Contacts from this Lead</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {lead.contacts?.length ? lead.contacts.map((contact: any) => (
                <Link key={contact.id} href={`/crm/contacts/${contact.id}`} className="block rounded-md border border-[#e5e2dc] p-3 hover:bg-[#f8faf9]">
                  <p className="font-medium text-[#1f2937]">{contact.firstName} {contact.lastName}</p>
                  <p className="text-sm text-[#6b7280]">{contact.email || contact.phone || contact.company || 'No contact detail'}</p>
                </Link>
              )) : <p className="text-sm text-[#6b7280]">No contact has been created from this lead yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Lifecycle</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {statuses.map((status) => (
                <Button key={status} variant={lead.status === status ? 'default' : 'outline'} className="w-full justify-start" onClick={() => updateStatus(status)} disabled={lead.status === status}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />{status.replace('_', ' ')}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Log Activity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={activity.type} onValueChange={(type) => setActivity((prev) => ({ ...prev, type }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['NOTE','CALL','EMAIL','MEETING','FOLLOW_UP','TASK'].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Subject" value={activity.subject} onChange={(event) => setActivity((prev) => ({ ...prev, subject: event.target.value }))} />
              <Textarea placeholder="Details" value={activity.description} onChange={(event) => setActivity((prev) => ({ ...prev, description: event.target.value }))} rows={4} />
              <Button className="w-full" onClick={addActivity}><PhoneCall className="mr-2 h-4 w-4" />Log Activity</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs text-[#6b7280]">{label}</p><div className="mt-1 text-sm font-medium text-[#1f2937]">{children}</div></div>;
}
