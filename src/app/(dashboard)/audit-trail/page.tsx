'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, History, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { showApiError } from '@/lib/apiError';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Actor = { id: string; firstName?: string; lastName?: string; email: string; role?: string; employee?: { employeeId?: string } };
type AuditRow = { id: string; entityType: string; entityId?: string; action: string; before?: unknown; diff?: unknown; after?: unknown; ip?: string; userAgent?: string; requestId?: string; createdAt: string; actor?: Actor | null };
const moduleOptions = ['ACCOUNTING', 'CRM', 'CUSTOMERS', 'HR', 'INVENTORY', 'INVOICING', 'PROCUREMENT', 'PROJECTS', 'SALES', 'SUPPLIERS'];
const actionOptions = ['CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'CANCEL', 'AMEND', 'APPROVE', 'REJECT', 'CONVERT', 'COMPLETE', 'DISPATCH', 'RECEIVE'];
const actorName = (actor?: Actor | null) => actor ? `${actor.firstName || ''} ${actor.lastName || ''}`.trim() || actor.email : 'System';
const json = (value: unknown) => JSON.stringify(value ?? {}, null, 2);

function AuditTrailContent() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [users, setUsers] = useState<Actor[]>([]);
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ module: '', action: '', userId: '', from: '', to: '', entityId: '' });
  const limit = 25;

  useEffect(() => {
    setPage(1);
    setFilters(current => ({ ...current, module: searchParams.get('module')?.toUpperCase() || '' }));
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) };
      const response = await api.get('/platform/audit', { params });
      const data = response.data?.data || {};
      setRows(data.items || []); setUsers(data.users || []); setTotal(data.total || 0); setTotalPages(data.totalPages || 1);
    } catch (error) { showApiError(error, 'Could not load this workspace audit trail'); }
    finally { setLoading(false); }
  }, [filters, page]);
  useEffect(() => { load(); }, [load]);
  const setFilter = (key: keyof typeof filters, value: string) => { setPage(1); setFilters(current => ({ ...current, [key]: value === 'ALL' ? '' : value })); };

  const columns = [
    { key: 'createdAt', header: 'Date & Time', render: (row: AuditRow) => <div><p className="font-medium">{new Date(row.createdAt).toLocaleDateString()}</p><p className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleTimeString()}</p></div> },
    { key: 'actor', header: 'Changed By', render: (row: AuditRow) => <div><p className="font-medium text-gray-900">{actorName(row.actor)}</p><p className="text-xs text-gray-500">{row.actor?.employee?.employeeId || row.actor?.email || 'Automated process'}{row.actor?.role ? ` · ${row.actor.role}` : ''}</p></div> },
    { key: 'record', header: 'Module / Record', render: (row: AuditRow) => { const [moduleName, resource] = row.entityType.split(':'); return <div><p className="font-medium capitalize">{moduleName.toLowerCase()} · {(resource || '').toLowerCase().replaceAll('-', ' ')}</p><p className="max-w-48 truncate font-mono text-xs text-gray-500" title={row.entityId}>{row.entityId || 'Multiple records'}</p></div>; } },
    { key: 'action', header: 'Action', render: (row: AuditRow) => <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{row.action}</span> },
    { key: 'ip', header: 'IP Address', render: (row: AuditRow) => <span className="font-mono text-xs">{row.ip || '—'}</span> },
    { key: 'details', header: '', render: (row: AuditRow) => <Button size="sm" variant="outline" onClick={() => setSelected(row)}><Eye className="mr-1 h-3.5 w-3.5" />Details</Button> },
  ];

  return <div>
    <PageHeader title="Workspace Audit Trail" description="See who changed records across this Orus ERP workspace">
      <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
    </PageHeader>
    <div className="mb-4 grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3 xl:grid-cols-6">
      <FilterSelect label="Module" value={filters.module} allLabel="All modules" options={moduleOptions} onChange={value => setFilter('module', value)} />
      <FilterSelect label="Action" value={filters.action} allLabel="All actions" options={actionOptions} onChange={value => setFilter('action', value)} />
      <div className="space-y-1"><Label>Employee</Label><Select value={filters.userId || 'ALL'} onValueChange={value => setFilter('userId', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All employees</SelectItem>{users.map(user => <SelectItem key={user.id} value={user.id}>{actorName(user)} · {user.email}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1"><Label>From</Label><Input type="date" value={filters.from} onChange={event => setFilter('from', event.target.value)} /></div>
      <div className="space-y-1"><Label>To</Label><Input type="date" value={filters.to} onChange={event => setFilter('to', event.target.value)} /></div>
      <div className="space-y-1"><Label>Record ID</Label><Input placeholder="Exact record ID" value={filters.entityId} onChange={event => setFilter('entityId', event.target.value)} /></div>
    </div>
    {!rows.length && !loading ? <EmptyState icon={History} title="No audit activity found" description="Successful changes in this workspace appear here. Clear filters if activity already exists." /> : <><DataTable data={rows} columns={columns} isLoading={loading} />{total > limit && <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />}</>}
    <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}><DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>Audit Event Details</DialogTitle></DialogHeader>{selected && <div className="space-y-4 text-sm"><div className="grid gap-3 rounded-lg border bg-gray-50 p-4 sm:grid-cols-2"><p><span className="text-gray-500">Employee:</span> {actorName(selected.actor)} ({selected.actor?.email || 'system'})</p><p><span className="text-gray-500">Action:</span> {selected.action}</p><p><span className="text-gray-500">Record:</span> {selected.entityType} · {selected.entityId || 'multiple'}</p><p><span className="text-gray-500">Time:</span> {new Date(selected.createdAt).toLocaleString()}</p><p><span className="text-gray-500">IP:</span> {selected.ip || '—'}</p><p><span className="text-gray-500">Request ID:</span> <span className="font-mono text-xs">{selected.requestId || '—'}</span></p></div>{selected.before != null && <JsonPanel title="Previous values" value={selected.before} />}<JsonPanel title="Fields submitted / changed" value={selected.diff} /><JsonPanel title="Saved result" value={selected.after} /></div>}</DialogContent></Dialog>
  </div>;
}

function FilterSelect({ label, value, allLabel, options, onChange }: { label: string; value: string; allLabel: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="space-y-1"><Label>{label}</Label><Select value={value || 'ALL'} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">{allLabel}</SelectItem>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>;
}
function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return <div><Label>{title}</Label><pre className="mt-1 max-h-72 overflow-auto rounded-lg bg-gray-950 p-4 text-xs text-gray-100">{json(value)}</pre></div>;
}
export default function AuditTrailPage() {
  return <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading audit trail…</div>}><AuditTrailContent /></Suspense>;
}
