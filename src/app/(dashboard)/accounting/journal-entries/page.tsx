'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { JournalEntry, Account } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface JournalLineForm { debitAccountId: string; creditAccountId: string; debit: number; credit: number; description: string; }

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', reference: '' });
  const [lines, setLines] = useState<JournalLineForm[]>([{ debitAccountId: '', creditAccountId: '', debit: 0, credit: 0, description: '' }]);
  const limit = 20;
  const postingAccounts = accounts.filter((account) => account.isActive && !account.isGroup);
  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [entRes, accRes] = await Promise.all([
        api.get('/accounting/journal-entries', { params: { page, limit } }),
        api.get('/accounting/accounts'),
      ]);
      setEntries(entRes.data.data.items);
      setTotal(entRes.data.data.total);
      setAccounts(accRes.data.data);
    } catch { toast.error('Failed to load journal entries'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!lines.length) return toast.error('Add at least one journal line');
      if (Math.abs(totalDebit - totalCredit) > 0.000001) return toast.error('Total debit must equal total credit');
      if (totalDebit <= 0) return toast.error('Journal amount must be greater than zero');
      const cleanLines = lines
        .filter((line) => Number(line.debit || 0) > 0 || Number(line.credit || 0) > 0)
        .map((line) => ({
          debitAccountId: line.debitAccountId || undefined,
          creditAccountId: line.creditAccountId || undefined,
          debit: Number(line.debit || 0),
          credit: Number(line.credit || 0),
          description: line.description || undefined,
        }));
      await api.post('/accounting/journal-entries', { ...form, lines: cleanLines });
      toast.success('Journal entry created');
      setShowModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handlePost = async (id: string) => {
    try {
      await api.put(`/accounting/journal-entries/${id}/post`);
      toast.success('Entry posted');
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Posting failed');
    }
  };

  const columns = [
    { key: 'entryNumber', header: 'Entry #', render: (e: JournalEntry) => <span className="font-mono text-sm font-semibold">{e.entryNumber}</span> },
    { key: 'date', header: 'Date', render: (e: JournalEntry) => formatDate(e.date) },
    { key: 'description', header: 'Description' },
    { key: 'totalDebit', header: 'Debit', render: (e: JournalEntry) => formatCurrency(e.totalDebit) },
    { key: 'totalCredit', header: 'Credit', render: (e: JournalEntry) => formatCurrency(e.totalCredit) },
    { key: 'status', header: 'Status', render: (e: JournalEntry) => <StatusBadge status={e.status} /> },
    { key: 'actions', header: '', render: (e: JournalEntry) => (
      e.status === 'DRAFT' ? <Button size="sm" onClick={(ev) => { ev.stopPropagation(); handlePost(e.id); }}>Post</Button> : null
    )},
  ];

  return (
    <div>
      <PageHeader title="Journal Entries" description="Manage accounting journal entries" action={{ label: 'New Entry', onClick: () => setShowModal(true), icon: Plus }} />
      {entries.length === 0 && !isLoading ? (
        <EmptyState icon={FileText} title="No journal entries" description="Start recording financial transactions" action={{ label: 'New Entry', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={entries} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label>Reference</Label><Input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Description *</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Lines</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, { debitAccountId: '', creditAccountId: '', debit: 0, credit: 0, description: '' }])}>+ Add Line</Button>
              </div>
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
                  <div className="col-span-3">
                    <Select value={line.debitAccountId} onValueChange={v => { const l = [...lines]; l[idx].debitAccountId = v; setLines(l); }}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Debit Acct" /></SelectTrigger>
                      <SelectContent>{postingAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Select value={line.creditAccountId} onValueChange={v => { const l = [...lines]; l[idx].creditAccountId = v; setLines(l); }}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Credit Acct" /></SelectTrigger>
                      <SelectContent>{postingAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Debit" value={line.debit} onChange={e => { const l = [...lines]; l[idx].debit = Number(e.target.value); setLines(l); }} /></div>
                  <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Credit" value={line.credit} onChange={e => { const l = [...lines]; l[idx].credit = Number(e.target.value); setLines(l); }} /></div>
                  <div className="col-span-1"><Input className="h-8 text-xs" placeholder="Note" value={line.description} onChange={e => { const l = [...lines]; l[idx].description = e.target.value; setLines(l); }} /></div>
                  <div className="col-span-1"><Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => setLines(lines.filter((_, i) => i !== idx))}>×</Button></div>
                </div>
              ))}
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Total Debit: <strong>{formatCurrency(totalDebit)}</strong></span>
                <span className="text-gray-500">Total Credit: <strong>{formatCurrency(totalCredit)}</strong></span>
              </div>
              {postingAccounts.length === 0 && <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">Create at least two non-group accounts before creating a journal entry.</p>}
              {Math.abs(totalDebit - totalCredit) > 0.000001 && <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Debit and credit totals must match before this entry can be created or posted.</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Entry</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
