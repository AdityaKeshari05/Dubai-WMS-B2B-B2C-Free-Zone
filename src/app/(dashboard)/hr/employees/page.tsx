'use client';

import { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
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
import { Employee, Department, Position } from '@/types';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: 'Employee@123', phone: '',
    departmentId: '', positionId: '', hireDate: new Date().toISOString().split('T')[0],
    salary: '', salaryType: 'MONTHLY', address: '', city: '', country: '',
    emergencyName: '', emergencyPhone: '',
  });
  const limit = 20;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes, posRes] = await Promise.all([
        api.get('/hr/employees', { params: { page, limit, search: search || undefined } }),
        api.get('/hr/departments'),
        api.get('/hr/positions'),
      ]);
      setEmployees(empRes.data.data.items);
      setTotal(empRes.data.data.total);
      setDepartments(deptRes.data.data);
      setPositions(posRes.data.data);
    } catch { toast.error('Failed to load employees'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [page, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hr/employees', { ...form, salary: Number(form.salary), departmentId: form.departmentId || undefined, positionId: form.positionId || undefined });
      toast.success('Employee created');
      setShowModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create employee'); }
  };

  const columns = [
    { key: 'employee', header: 'Employee', render: (e: Employee) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-semibold">{getInitials(e.user.firstName, e.user.lastName)}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{e.user.firstName} {e.user.lastName}</p>
          <p className="text-xs text-gray-400">{e.employeeId}</p>
        </div>
      </div>
    )},
    { key: 'email', header: 'Email', render: (e: Employee) => e.user.email },
    { key: 'department', header: 'Department', render: (e: Employee) => e.department?.name || '—' },
    { key: 'position', header: 'Position', render: (e: Employee) => e.position?.title || '—' },
    { key: 'salary', header: 'Salary', render: (e: Employee) => formatCurrency(e.salary) },
    { key: 'hireDate', header: 'Hire Date', render: (e: Employee) => formatDate(e.hireDate) },
    { key: 'status', header: 'Status', render: (e: Employee) => <StatusBadge status={e.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Employees" description="Manage your workforce" action={{ label: 'New Employee', onClick: () => setShowModal(true), icon: Plus }} />
      <div className="mb-4">
        <Input placeholder="Search employees..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      </div>
      {employees.length === 0 && !isLoading ? (
        <EmptyState icon={Users} title="No employees yet" description="Add your first employee" action={{ label: 'Add Employee', onClick: () => setShowModal(true) }} />
      ) : (
        <>
          <DataTable columns={columns} data={employees} isLoading={isLoading} />
          {total > limit && <Pagination page={page} totalPages={Math.ceil(total / limit)} total={total} limit={limit} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Employee</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 mt-2 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-1.5"><Label>First Name *</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Last Name *</Label><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.departmentId} onValueChange={v => setForm(f => ({ ...f, departmentId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Select value={form.positionId} onValueChange={v => setForm(f => ({ ...f, positionId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                <SelectContent>{positions.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Hire Date *</Label><Input type="date" value={form.hireDate} onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))} required /></div>
            <div className="space-y-1.5"><Label>Salary *</Label><Input type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} required /></div>
            <div className="space-y-1.5">
              <Label>Salary Type</Label>
              <Select value={form.salaryType} onValueChange={v => setForm(f => ({ ...f, salaryType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['HOURLY','DAILY','MONTHLY','ANNUAL'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Emergency Contact</Label><Input value={form.emergencyName} onChange={e => setForm(f => ({ ...f, emergencyName: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Emergency Phone</Label><Input value={form.emergencyPhone} onChange={e => setForm(f => ({ ...f, emergencyPhone: e.target.value }))} /></div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Create Employee</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
