'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BadgeCheck, BriefcaseBusiness, CalendarClock, ClipboardList, Clock,
  FileText, Landmark, Plus, RefreshCcw, UserRoundCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type EmployeeOption = {
  id: string;
  employeeId: string;
  salary?: number;
  user?: { firstName: string; lastName: string; email?: string };
  department?: { name: string };
  position?: { title: string };
  status?: string;
};

type Option = { id: string; name?: string; title?: string; code?: string };

function fullName(employee?: EmployeeOption) {
  return `${employee?.user?.firstName || ''} ${employee?.user?.lastName || ''}`.trim() || 'Employee';
}

function num(value: any) {
  return Number(value || 0);
}

function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  useEffect(() => {
    api.get('/hr/employees', { params: { limit: 300 } })
      .then((res) => setEmployees(res.data.data.items || []))
      .catch(() => setEmployees([]));
  }, []);
  return employees;
}

function DeskStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef6ff] text-[#1674c4]">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-[#6b7280]">{label}</p>
          <p className="text-xl font-semibold text-[#1f2937]">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function HRDeskPage() {
  const [stats, setStats] = useState<any>({});
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dash, me, att] = await Promise.all([
        api.get('/hr/dashboard'),
        api.get('/hr/me'),
        api.get('/hr/me/attendance'),
      ]);
      setStats(dash.data.data || {});
      setProfile(me.data.data);
      setAttendance(att.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load HR desk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const check = async (logType: 'IN' | 'OUT') => {
    try {
      await api.post('/hr/me/checkins', { logType });
      toast.success(logType === 'IN' ? 'Checked in' : 'Checked out');
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  return (
    <div>
      <PageHeader title="HR Desk" description="Employee self-service, attendance, leave, and payroll operations">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => check('IN')}><Clock className="mr-2 h-4 w-4" />Check In</Button>
          <Button onClick={() => check('OUT')}><BadgeCheck className="mr-2 h-4 w-4" />Check Out</Button>
        </div>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-4">
        <DeskStat label="Active Employees" value={stats.employees || 0} icon={UserRoundCheck} />
        <DeskStat label="Pending Leaves" value={stats.pendingLeaves || 0} icon={ClipboardList} />
        <DeskStat label="Open Payrolls" value={stats.openPayrolls || 0} icon={Landmark} />
        <DeskStat label="Departments" value={stats.activeDepartments || 0} icon={BriefcaseBusiness} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>My Employment</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-[#6b7280]">Name</p>
              <p className="font-medium">{fullName(profile)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-[#6b7280]">Employee ID</p><p>{profile?.employeeId || '-'}</p></div>
              <div><p className="text-xs text-[#6b7280]">Status</p><StatusBadge status={profile?.status || 'ACTIVE'} /></div>
              <div><p className="text-xs text-[#6b7280]">Department</p><p>{profile?.department?.name || '-'}</p></div>
              <div><p className="text-xs text-[#6b7280]">Position</p><p>{profile?.position?.title || '-'}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
          <CardContent>
            <DataTable
              isLoading={loading}
              data={attendance.slice(0, 8)}
              columns={[
                { key: 'date', header: 'Date', render: (r: any) => formatDate(r.date) },
                { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                { key: 'checkIn', header: 'In', render: (r: any) => r.checkIn ? formatDateTime(r.checkIn) : '-' },
                { key: 'checkOut', header: 'Out', render: (r: any) => r.checkOut ? formatDateTime(r.checkOut) : '-' },
                { key: 'hoursWorked', header: 'Hours', render: (r: any) => r.hoursWorked ? Number(r.hoursWorked).toFixed(2) : '-' },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
