'use client';

import { useEffect, useState } from 'react';
import { Plus, Route, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { CrmAssignmentRule, LeadSource } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';

const sources: LeadSource[] = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL', 'PHONE', 'ADVERTISEMENT', 'CSV_IMPORT', 'OTHER'];

export default function AssignmentRulesPage() {
  const [rules, setRules] = useState<CrmAssignmentRule[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ name: '', priority: '100', source: 'ANY', city: '', country: '', minValue: '', maxValue: '', assignToId: '' });

  const load = async () => {
    setIsLoading(true);
    try {
      const [ruleRes, userRes] = await Promise.all([
        api.get('/crm/assignment-rules'),
        api.get('/access/users'),
      ]);
      setRules(ruleRes.data.data.items || []);
      setUsers(userRes.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load assignment rules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/crm/assignment-rules', {
        ...form,
        priority: Number(form.priority || 100),
        source: form.source === 'ANY' ? undefined : form.source,
        minValue: form.minValue ? Number(form.minValue) : undefined,
        maxValue: form.maxValue ? Number(form.maxValue) : undefined,
      });
      toast.success('Assignment rule created');
      setForm({ name: '', priority: '100', source: 'ANY', city: '', country: '', minValue: '', maxValue: '', assignToId: '' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create rule');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this assignment rule?')) return;
    try {
      await api.delete(`/crm/assignment-rules/${id}`);
      toast.success('Assignment rule deleted');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not delete rule');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Assignment Rules" description="Automatically route new CRM leads to the right salesperson" />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Route className="h-4 w-4" />New Rule</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1.5 md:col-span-2"><Label>Rule Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Website leads to Sales" required /></div>
            <div className="space-y-1.5"><Label>Priority</Label><Input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(source) => setForm((f) => ({ ...f, source }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANY">Any source</SelectItem>
                  {sources.map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Optional exact match" /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Optional exact match" /></div>
            <div className="space-y-1.5"><Label>Min Value</Label><Input type="number" value={form.minValue} onChange={(e) => setForm((f) => ({ ...f, minValue: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Max Value</Label><Input type="number" value={form.maxValue} onChange={(e) => setForm((f) => ({ ...f, maxValue: e.target.value }))} /></div>
            <div className="space-y-1.5 md:col-span-3">
              <Label>Assign To *</Label>
              <Select value={form.assignToId} onValueChange={(assignToId) => setForm((f) => ({ ...f, assignToId }))}>
                <SelectTrigger><SelectValue placeholder="Select employee/user" /></SelectTrigger>
                <SelectContent>
                  {users.map((user) => <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName} · {user.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end"><Button type="submit" className="w-full"><Plus className="mr-2 h-4 w-4" />Add Rule</Button></div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        isLoading={isLoading}
        data={rules}
        columns={[
          { key: 'priority', header: 'Priority', render: (rule: CrmAssignmentRule) => rule.priority },
          { key: 'name', header: 'Rule', render: (rule: CrmAssignmentRule) => <span className="font-medium text-[#1f2937]">{rule.name}</span> },
          { key: 'status', header: 'Status', render: (rule: CrmAssignmentRule) => <StatusBadge status={rule.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
          { key: 'criteria', header: 'Criteria', render: (rule: CrmAssignmentRule) => [rule.source, rule.city, rule.country, rule.minValue ? `>= ${rule.minValue}` : '', rule.maxValue ? `<= ${rule.maxValue}` : ''].filter(Boolean).join(' · ') || 'All leads' },
          { key: 'assignTo', header: 'Assign To', render: (rule: CrmAssignmentRule) => rule.assignTo ? `${rule.assignTo.firstName} ${rule.assignTo.lastName}` : '-' },
          { key: 'actions', header: '', render: (rule: CrmAssignmentRule) => <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); remove(rule.id); }}><Trash2 className="h-4 w-4" /></Button> },
        ]}
      />
    </div>
  );
}
