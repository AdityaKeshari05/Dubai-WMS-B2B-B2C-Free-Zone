'use client';

import { useEffect, useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { Department } from '@/types';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  const fetchDepts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/hr/departments');
      setDepartments(res.data.data);
    } catch { toast.error('Failed'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hr/departments', form);
      toast.success('Department created');
      setShowModal(false);
      fetchDepts();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'code', header: 'Code', render: (d: Department) => <span className="font-mono text-sm font-semibold bg-gray-100 px-1.5 py-0.5 rounded">{d.code}</span> },
    { key: 'name', header: 'Department', render: (d: Department) => <span className="font-medium">{d.name}</span> },
    { key: 'description', header: 'Description', render: (d: Department) => d.description || '—' },
    { key: 'employees', header: 'Employees', render: (d: Department) => d._count?.employees || 0 },
    { key: 'positions', header: 'Positions', render: (d: Department) => d.positions?.length || 0 },
  ];

  return (
    <div>
      <PageHeader title="Departments" description="Manage company departments" action={{ label: 'New Department', onClick: () => setShowModal(true), icon: Plus }} />
      {departments.length === 0 && !isLoading ? (
        <EmptyState icon={Building2} title="No departments" description="Create your first department" action={{ label: 'Add Department', onClick: () => setShowModal(true) }} />
      ) : (
        <DataTable columns={columns} data={departments} isLoading={isLoading} />
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Department</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required placeholder="e.g. HR, SALES, ENG" /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Department</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
