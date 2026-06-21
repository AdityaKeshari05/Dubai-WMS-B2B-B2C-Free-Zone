'use client';

import { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { Contact } from '@/types';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', mobile: '', company: '', position: '', city: '', country: '' });
  const limit = 20;

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/crm/contacts', { params: { page, limit, search: search || undefined } });
      setContacts(res.data.data.items);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, [page, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/crm/contacts', form);
      toast.success('Contact created');
      setShowModal(false);
      fetchContacts();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (c: Contact) => <span className="font-medium text-gray-900">{c.firstName} {c.lastName}</span> },
    { key: 'company', header: 'Company', render: (c: Contact) => c.company || '—' },
    { key: 'position', header: 'Position', render: (c: Contact) => c.position || '—' },
    { key: 'email', header: 'Email', render: (c: Contact) => c.email || '—' },
    { key: 'phone', header: 'Phone', render: (c: Contact) => c.phone || c.mobile || '—' },
    { key: 'city', header: 'City', render: (c: Contact) => [c.city, c.country].filter(Boolean).join(', ') || '—' },
  ];

  return (
    <div>
      <PageHeader title="Contacts" description="Manage your CRM contacts" action={{ label: 'New Contact', onClick: () => setShowModal(true), icon: Plus }} />
      <div className="mb-4"><Input placeholder="Search contacts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" /></div>
      {contacts.length === 0 && !isLoading ? (
        <EmptyState icon={Users} title="No contacts" description="Add your first contact" action={{ label: 'Add Contact', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={contacts} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New Contact</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-1.5"><Label>First Name *</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Last Name *</Label><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Company</Label><Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Position</Label><Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Contact</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
