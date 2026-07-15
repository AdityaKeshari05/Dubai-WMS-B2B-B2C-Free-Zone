'use client';

import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Department, Position } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', departmentId: '', description: '', minSalary: '', maxSalary: '' });

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [posRes, deptRes] = await Promise.all([api.get('/hr/positions'), api.get('/hr/departments')]);
      setPositions(posRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load positions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hr/positions', {
        ...form,
        minSalary: form.minSalary ? Number(form.minSalary) : undefined,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
      });
      toast.success('Position created');
      setShowModal(false);
      setForm({ title: '', departmentId: '', description: '', minSalary: '', maxSalary: '' });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create position');
    }
  };

  const columns = [
    { key: 'title', header: 'Position', render: (p: Position) => <span className="font-medium">{p.title}</span> },
    { key: 'department', header: 'Department', render: (p: Position) => p.department?.name || '-' },
    { key: 'minSalary', header: 'Min Salary', render: (p: Position) => p.minSalary ?? '-' },
    { key: 'maxSalary', header: 'Max Salary', render: (p: Position) => p.maxSalary ?? '-' },
    { key: 'employees', header: 'Employees', render: (p: any) => p._count?.employees || 0 },
  ];

  return (
    <div>
      <PageHeader title="Positions" description="Define job titles under departments before assigning employees" action={{ label: 'New Position', icon: Plus, onClick: () => setShowModal(true) }} />
      {positions.length === 0 && !isLoading ? (
        <EmptyState icon={BriefcaseBusiness} title="No positions" description="Create departments first, then define positions under them" action={{ label: 'Create Position', onClick: () => setShowModal(true) }} />
      ) : (
        <DataTable columns={columns} data={positions as any[]} isLoading={isLoading} />
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Position</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required placeholder="Accounts Executive" />
            </div>
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select value={form.departmentId} onValueChange={(value) => setForm((f) => ({ ...f, departmentId: value }))}>
                <SelectTrigger><SelectValue placeholder={departments.length ? 'Select department' : 'Create a department first'} /></SelectTrigger>
                <SelectContent>{departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Min Salary</Label><Input type="number" value={form.minSalary} onChange={(e) => setForm((f) => ({ ...f, minSalary: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Max Salary</Label><Input type="number" value={form.maxSalary} onChange={(e) => setForm((f) => ({ ...f, maxSalary: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={!departments.length}>Create Position</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
