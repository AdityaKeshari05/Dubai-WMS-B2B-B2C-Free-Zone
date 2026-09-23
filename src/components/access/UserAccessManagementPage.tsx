'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Users, ShieldCheck, Warehouse, Lock, CheckCircle2, Clock,
  KeyRound, Plus, RefreshCcw, Eye, Search, AlertTriangle, ShieldAlert,
  Smartphone, Building2, Check, X, Shield, FileCheck, Layers, Settings,
  Radio, ArrowRightLeft, Laptop, Edit3, Power, UserPlus, CheckCircle,
  Key, LogOut, ShieldOff, UserCheck, CheckSquare, Square, Save, RotateCcw
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// --- MOCK INITIAL DATA FOR DUBAI WMS ---

const INITIAL_WAREHOUSES = [
  { id: 'wh-01', code: 'JAFZA-WH01', name: 'Jebel Ali Free Zone Bonded Warehouse', zone: 'JAFZA South', type: 'Free Zone / Bonded' },
  { id: 'wh-02', code: 'DWC-WH02', name: 'Dubai South Logistics District Hub', zone: 'DWC Al Maktoum', type: 'High-Bay Automated' },
  { id: 'wh-03', code: 'DXB-WH03', name: 'Dubai Mainland Central Depot', zone: 'Al Quoz Industrial 3', type: 'Cold Storage & General' },
  { id: 'wh-04', code: 'KIZAD-WH04', name: 'KIZAD Coastal Transit Yard', zone: 'Abu Dhabi Link', type: '3PL Transit Facility' },
];

const WMS_SUB_MODULES = [
  { key: 'inbound', name: 'Inbound Receiving & GRN Verification' },
  { key: 'inventory', name: 'Inventory Balance & Stock Take' },
  { key: 'picking', name: 'Picking & RF Handheld Scanning' },
  { key: 'packing', name: 'Packing & Shipping Label Generation' },
  { key: 'transfers', name: 'Inter-Warehouse Stock Transfers' },
  { key: 'adjustments', name: 'Stock Adjustments & Shrinkage Write-offs' },
  { key: 'masterdata', name: 'Warehouse Master Data Setup' },
];

const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, { read: boolean; create: boolean; edit: boolean; delete: boolean; approve: boolean; export: boolean }>> = {
  'Warehouse Admin': {
    inbound: { read: true, create: true, edit: true, delete: true, approve: true, export: true },
    inventory: { read: true, create: true, edit: true, delete: true, approve: true, export: true },
    picking: { read: true, create: true, edit: true, delete: true, approve: true, export: true },
    packing: { read: true, create: true, edit: true, delete: true, approve: true, export: true },
    transfers: { read: true, create: true, edit: true, delete: true, approve: true, export: true },
    adjustments: { read: true, create: true, edit: true, delete: true, approve: true, export: true },
    masterdata: { read: true, create: true, edit: true, delete: true, approve: true, export: true },
  },
  'Warehouse Supervisor': {
    inbound: { read: true, create: true, edit: true, delete: false, approve: true, export: true },
    inventory: { read: true, create: true, edit: true, delete: false, approve: true, export: true },
    picking: { read: true, create: true, edit: true, delete: false, approve: true, export: true },
    packing: { read: true, create: true, edit: true, delete: false, approve: true, export: true },
    transfers: { read: true, create: true, edit: true, delete: false, approve: true, export: true },
    adjustments: { read: true, create: true, edit: true, delete: false, approve: true, export: true },
    masterdata: { read: true, create: false, edit: false, delete: false, approve: false, export: true },
  },
  'Picker': {
    inbound: { read: true, create: false, edit: false, delete: false, approve: false, export: false },
    inventory: { read: true, create: false, edit: false, delete: false, approve: false, export: false },
    picking: { read: true, create: true, edit: true, delete: false, approve: false, export: true },
    packing: { read: true, create: false, edit: false, delete: false, approve: false, export: false },
    transfers: { read: true, create: false, edit: false, delete: false, approve: false, export: false },
    adjustments: { read: false, create: false, edit: false, delete: false, approve: false, export: false },
    masterdata: { read: false, create: false, edit: false, delete: false, approve: false, export: false },
  },
  'Packer': {
    inbound: { read: false, create: false, edit: false, delete: false, approve: false, export: false },
    inventory: { read: true, create: false, edit: false, delete: false, approve: false, export: false },
    picking: { read: true, create: false, edit: false, delete: false, approve: false, export: false },
    packing: { read: true, create: true, edit: true, delete: false, approve: false, export: true },
    transfers: { read: false, create: false, edit: false, delete: false, approve: false, export: false },
    adjustments: { read: false, create: false, edit: false, delete: false, approve: false, export: false },
    masterdata: { read: false, create: false, edit: false, delete: false, approve: false, export: false },
  },
  'Management / Auditor': {
    inbound: { read: true, create: false, edit: false, delete: false, approve: false, export: true },
    inventory: { read: true, create: false, edit: false, delete: false, approve: false, export: true },
    picking: { read: true, create: false, edit: false, delete: false, approve: false, export: true },
    packing: { read: true, create: false, edit: false, delete: false, approve: false, export: true },
    transfers: { read: true, create: false, edit: false, delete: false, approve: false, export: true },
    adjustments: { read: true, create: false, edit: false, delete: false, approve: false, export: true },
    masterdata: { read: true, create: false, edit: false, delete: false, approve: false, export: true },
  },
};

const INITIAL_USERS = [
  {
    id: 'usr-101',
    employeeId: 'EMP-DXB-001',
    fullName: 'Tariq Al-Mansoor',
    email: 'tariq.mansoor@oruswms.ae',
    phone: '+971 50 123 4567',
    primaryWarehouseId: 'wh-01',
    assignedWarehouses: ['wh-01', 'wh-02', 'wh-03', 'wh-04'],
    role: 'Warehouse Admin',
    status: 'ACTIVE',
    lastActive: '2 mins ago',
    joinedDate: '2024-01-15',
    twoFactorEnforced: true,
  },
  {
    id: 'usr-102',
    employeeId: 'EMP-DXB-042',
    fullName: 'Zayd Ibrahim',
    email: 'zayd.ibrahim@oruswms.ae',
    phone: '+971 52 987 6543',
    primaryWarehouseId: 'wh-01',
    assignedWarehouses: ['wh-01', 'wh-02'],
    role: 'Warehouse Supervisor',
    status: 'ACTIVE',
    lastActive: '15 mins ago',
    joinedDate: '2024-03-10',
    twoFactorEnforced: true,
  },
  {
    id: 'usr-103',
    employeeId: 'EMP-DXB-108',
    fullName: 'Rashid Khan',
    email: 'rashid.khan@oruswms.ae',
    phone: '+971 55 444 3322',
    primaryWarehouseId: 'wh-02',
    assignedWarehouses: ['wh-02'],
    role: 'Picker',
    status: 'ACTIVE',
    lastActive: '1 hr ago',
    joinedDate: '2024-05-22',
    twoFactorEnforced: false,
  },
  {
    id: 'usr-104',
    employeeId: 'EMP-DXB-119',
    fullName: 'Hamdan Al-Farsi',
    email: 'hamdan.farsi@oruswms.ae',
    phone: '+971 56 777 8899',
    primaryWarehouseId: 'wh-03',
    assignedWarehouses: ['wh-03'],
    role: 'Packer',
    status: 'ACTIVE',
    lastActive: '30 mins ago',
    joinedDate: '2024-06-01',
    twoFactorEnforced: false,
  },
  {
    id: 'usr-105',
    employeeId: 'EMP-DXB-088',
    fullName: 'Amina Al-Hassan',
    email: 'amina.hassan@oruswms.ae',
    phone: '+971 50 888 1122',
    primaryWarehouseId: 'wh-01',
    assignedWarehouses: ['wh-01', 'wh-02', 'wh-03'],
    role: 'Management / Auditor',
    status: 'ACTIVE',
    lastActive: '3 hrs ago',
    joinedDate: '2024-02-18',
    twoFactorEnforced: true,
  },
  {
    id: 'usr-106',
    employeeId: 'EMP-DXB-205',
    fullName: 'Faisal Mahmud',
    email: 'faisal.mahmud@oruswms.ae',
    phone: '+971 54 321 0099',
    primaryWarehouseId: 'wh-02',
    assignedWarehouses: ['wh-02'],
    role: 'Picker',
    status: 'SUSPENDED',
    lastActive: '2 days ago',
    joinedDate: '2024-07-11',
    twoFactorEnforced: false,
  },
];

const INITIAL_ROLES = [
  { id: 'role-admin', name: 'Warehouse Admin', description: 'Full system configuration, facility provisioning, user management, and security controls.', isSystem: true },
  { id: 'role-supervisor', name: 'Warehouse Supervisor', description: 'Operational oversight, stock adjustment approval, inter-warehouse transfer authorizations, and task dispatching.', isSystem: true },
  { id: 'role-picker', name: 'Picker', description: 'Restricted handheld scanner interface for pick lists, bin routing guidance, and item verification.', isSystem: true },
  { id: 'role-packer', name: 'Packer', description: 'Access to pack station verification, barcode scanning, weight check, and shipping label generation.', isSystem: true },
  { id: 'role-management', name: 'Management / Auditor', description: 'Read-only access to analytical dashboards, inventory valuation, audit trails, and compliance reports.', isSystem: true },
];

const INITIAL_SESSIONS = [
  { id: 'sess-801', userId: 'usr-101', userName: 'Tariq Al-Mansoor', userEmail: 'tariq.mansoor@oruswms.ae', role: 'Warehouse Admin', device: 'Desktop Workstation #01 (Chrome / Win11)', ip: '192.168.10.45', loginTime: '2026-09-22 08:30:12', lastActive: '2 mins ago', isHandheld: false },
  { id: 'sess-802', userId: 'usr-102', userName: 'Zayd Ibrahim', userEmail: 'zayd.ibrahim@oruswms.ae', role: 'Warehouse Supervisor', device: 'Zebra TC57 Handheld #04 (Android WMS App)', ip: '192.168.10.88', loginTime: '2026-09-22 09:15:00', lastActive: '15 mins ago', isHandheld: true },
  { id: 'sess-803', userId: 'usr-103', userName: 'Rashid Khan', userEmail: 'rashid.khan@oruswms.ae', role: 'Picker', device: 'Honeywell EDA51 Scanner #12 (WMS Mobile)', ip: '192.168.10.104', loginTime: '2026-09-22 10:00:22', lastActive: '1 hr ago', isHandheld: true },
  { id: 'sess-804', userId: 'usr-104', userName: 'Hamdan Al-Farsi', userEmail: 'hamdan.farsi@oruswms.ae', role: 'Packer', device: 'Pack Station Terminal #03 (Edge / Win10)', ip: '192.168.10.119', loginTime: '2026-09-22 11:30:45', lastActive: '30 mins ago', isHandheld: false },
];

const INITIAL_APPROVAL_REQUESTS = [
  {
    id: 'APP-2026-0891',
    type: 'Stock Write-off / Shrinkage',
    requestedBy: 'Zayd Ibrahim (Supervisor)',
    warehouse: 'JAFZA-WH01',
    itemCode: 'SKU-ELEC-9042 (Samsung Smart LED 65")',
    qty: 3,
    estimatedValue: 'AED 11,400',
    reason: 'Water damage detected during Pallet Inspection in Bay B-14',
    status: 'PENDING_APPROVAL',
    timestamp: '2026-09-22 18:45:12',
  },
  {
    id: 'APP-2026-0892',
    type: 'Inter-Warehouse Transfer',
    requestedBy: 'Zayd Ibrahim (Supervisor)',
    warehouse: 'JAFZA-WH01 → DWC-WH02',
    itemCode: 'SKU-AUTO-3310 (High Performance Brake Fluid)',
    qty: 500,
    estimatedValue: 'AED 42,500',
    reason: 'Emergency stock rebalance for urgent DWC outbound dispatch',
    status: 'PENDING_APPROVAL',
    timestamp: '2026-09-22 19:10:05',
  },
  {
    id: 'APP-2026-0888',
    type: 'Manual Price Override',
    requestedBy: 'Tariq Al-Mansoor (Admin)',
    warehouse: 'DXB-WH03',
    itemCode: 'SKU-FOOD-1022 (Organic Olive Oil 5L)',
    qty: 150,
    estimatedValue: 'AED 18,750',
    reason: 'Bulk promotional discount approved by UAE Commercial Director',
    status: 'APPROVED',
    timestamp: '2026-09-21 14:20:00',
    processedBy: 'Amina Al-Hassan',
  },
];

const INITIAL_AUDIT_LOGS = [
  { id: 'log-901', timestamp: '2026-09-22 21:05:40', user: 'tariq.mansoor@oruswms.ae', role: 'Warehouse Admin', entity: 'WMS User: Rashid Khan', action: 'ROLE_UPDATE', ip: '192.168.10.45', device: 'Desktop Admin Terminal #01', diff: 'Assigned Role updated to Warehouse Supervisor' },
  { id: 'log-902', timestamp: '2026-09-22 20:30:15', user: 'zayd.ibrahim@oruswms.ae', role: 'Warehouse Supervisor', entity: 'Approval Request: APP-2026-0891', action: 'APPROVAL_SUBMIT', ip: '192.168.10.88', device: 'Zebra TC57 Handheld #04', diff: 'Submitted Stock Write-off request for 3 units SKU-ELEC-9042' },
  { id: 'log-903', timestamp: '2026-09-22 19:15:00', user: 'amina.hassan@oruswms.ae', role: 'Compliance Manager', entity: 'Security Settings', action: 'POLICY_CHANGE', ip: '192.168.10.12', device: 'Auditor Workstation', diff: 'Handheld RF Scanner timeout updated to 5 minutes' },
  { id: 'log-904', timestamp: '2026-09-22 17:40:22', user: 'system.daemon', role: 'System', entity: 'User Session: Faisal Mahmud', action: 'SESSION_REVOKE', ip: '127.0.0.1', device: 'Automated Security Service', diff: 'Session revoked due to account suspension' },
];

export function UserAccessManagementPage() {
  // Persistence states
  const [users, setUsers] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('demo_wms_users');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS;
  });

  const [roles, setRoles] = useState<any[]>(INITIAL_ROLES);
  const [sessions, setSessions] = useState<any[]>(INITIAL_SESSIONS);

  // Custom module permissions state per user: { [userId]: { [moduleKey]: { read, create, edit, delete, approve, export } } }
  const [userPermissions, setUserPermissions] = useState<Record<string, Record<string, any>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('demo_wms_user_permissions');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    // Default initial setup derived from user roles
    const init: Record<string, Record<string, any>> = {};
    INITIAL_USERS.forEach((u) => {
      init[u.id] = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[u.role] || DEFAULT_ROLE_PERMISSIONS['Picker']));
    });
    return init;
  });

  const [approvals, setApprovals] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('demo_wms_approvals');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_APPROVAL_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState<any[]>(INITIAL_AUDIT_LOGS);

  // Active warehouse session state (1.3 feature)
  const [activeFacility, setActiveFacility] = useState('wh-01');

  // Security controls state (1.7 feature)
  const [securitySettings, setSecuritySettings] = useState({
    handheldTimeout: '5',
    passwordMinLength: '8',
    requireSpecialChar: true,
    maxLoginAttempts: '3',
    sessionRevocationOnRoleChange: true,
    twoFactorEnforced: true,
  });

  // Selected state for interactive tabs
  const [selectedPermissionUserId, setSelectedPermissionUserId] = useState<string>('usr-103'); // default to Rashid Khan
  const [selectedSecurityUserId, setSelectedSecurityUserId] = useState<string>('usr-103');

  // Password reset modal form
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
    requireResetOnNextLogin: true,
  });

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userWarehouseFilter, setUserWarehouseFilter] = useState('ALL');

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isNewApprovalOpen, setIsNewApprovalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    primaryWarehouseId: 'wh-01',
    role: 'Picker',
  });

  const [newApprovalForm, setNewApprovalForm] = useState({
    type: 'Stock Write-off / Shrinkage',
    itemCode: '',
    qty: '1',
    estimatedValue: '',
    reason: '',
  });

  // LocalStorage sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_wms_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_wms_user_permissions', JSON.stringify(userPermissions));
    }
  }, [userPermissions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_wms_approvals', JSON.stringify(approvals));
    }
  }, [approvals]);

  // Handlers for Feature 1.1: User Management
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName || !newUserForm.email || !newUserForm.employeeId) {
      toast.error('Please fill in Employee Name, Email, and Employee ID.');
      return;
    }

    const created = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      employeeId: newUserForm.employeeId.toUpperCase(),
      fullName: newUserForm.fullName,
      email: newUserForm.email,
      phone: newUserForm.phone || '+971 50 000 0000',
      primaryWarehouseId: newUserForm.primaryWarehouseId,
      assignedWarehouses: [newUserForm.primaryWarehouseId],
      role: newUserForm.role,
      status: 'ACTIVE',
      lastActive: 'Just now',
      joinedDate: new Date().toISOString().slice(0, 10),
      twoFactorEnforced: false,
    };

    setUsers([created, ...users]);

    // Initialize module permissions for new user based on assigned role
    const newPerms = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[created.role] || DEFAULT_ROLE_PERMISSIONS['Picker']));
    setUserPermissions(prev => ({ ...prev, [created.id]: newPerms }));

    // Record audit log
    setAuditLogs([
      {
        id: `log-${Date.now().toString().slice(-3)}`,
        timestamp: new Date().toLocaleString(),
        user: 'tariq.mansoor@oruswms.ae (Admin)',
        role: 'Warehouse Admin',
        entity: `WMS User: ${created.fullName}`,
        action: 'USER_CREATE',
        ip: '192.168.10.45',
        device: 'Admin Terminal',
        diff: `Created user ${created.employeeId} (${created.role}) assigned to ${INITIAL_WAREHOUSES.find(w => w.id === created.primaryWarehouseId)?.code}`,
      },
      ...auditLogs,
    ]);

    toast.success(`Warehouse user ${created.fullName} (${created.employeeId}) created!`);
    setNewUserForm({ fullName: '', email: '', phone: '', employeeId: '', primaryWarehouseId: 'wh-01', role: 'Picker' });
    setIsAddUserOpen(false);
  };

  const toggleUserStatus = (userId: string) => {
    const updated = users.map((u: any) => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        toast.success(`User ${u.fullName} is now ${nextStatus}`);

        // If suspended, revoke active sessions
        if (nextStatus === 'SUSPENDED') {
          setSessions(prev => prev.filter(s => s.userId !== userId));
        }

        setAuditLogs([
          {
            id: `log-${Date.now().toString().slice(-3)}`,
            timestamp: new Date().toLocaleString(),
            user: 'tariq.mansoor@oruswms.ae (Admin)',
            role: 'Warehouse Admin',
            entity: `WMS User: ${u.fullName}`,
            action: nextStatus === 'ACTIVE' ? 'USER_REACTIVATE' : 'USER_SUSPEND',
            ip: '192.168.10.45',
            device: 'Admin Terminal',
            diff: `Account status changed from ${u.status} to ${nextStatus}`,
          },
          ...auditLogs,
        ]);

        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
  };

  // Handlers for Feature 1.2: Role-Based Access Control (RBAC - Edit User Role)
  const handleUserRoleChange = (userId: string, newRole: string) => {
    const updatedUsers = users.map((u: any) => {
      if (u.id === userId) {
        const oldRole = u.role;
        // Update user role
        toast.success(`Updated role for ${u.fullName} from ${oldRole} to ${newRole}!`);

        // Audit log
        setAuditLogs(prev => [
          {
            id: `log-${Date.now().toString().slice(-3)}`,
            timestamp: new Date().toLocaleString(),
            user: 'tariq.mansoor@oruswms.ae (Admin)',
            role: 'Warehouse Admin',
            entity: `WMS User: ${u.fullName}`,
            action: 'ROLE_UPDATE',
            ip: '192.168.10.45',
            device: 'Admin Terminal',
            diff: `Role updated from "${oldRole}" to "${newRole}"`,
          },
          ...prev,
        ]);

        // Automatically update default permissions for this user if no custom override existed
        const defaultRolePerms = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[newRole] || DEFAULT_ROLE_PERMISSIONS['Picker']));
        setUserPermissions(prev => ({ ...prev, [userId]: defaultRolePerms }));

        return { ...u, role: newRole };
      }
      return u;
    });
    setUsers(updatedUsers);
  };

  // Handlers for Feature 1.3: Warehouse Access Isolation
  const handleWarehouseAccessToggle = (userId: string, warehouseId: string) => {
    const updated = users.map((u: any) => {
      if (u.id === userId) {
        const exists = u.assignedWarehouses.includes(warehouseId);
        if (exists && u.assignedWarehouses.length === 1) {
          toast.error('A user must remain assigned to at least one primary facility.');
          return u;
        }
        const nextAssigned = exists
          ? u.assignedWarehouses.filter((w: string) => w !== warehouseId)
          : [...u.assignedWarehouses, warehouseId];

        toast.success(`Facility clearance updated for ${u.fullName}`);
        return { ...u, assignedWarehouses: nextAssigned };
      }
      return u;
    });
    setUsers(updated);
  };

  // Handlers for Feature 1.4: Granular Module Permissions Toggle
  const handleModulePermissionToggle = (userId: string, moduleKey: string, action: 'read' | 'create' | 'edit' | 'delete' | 'approve' | 'export') => {
    setUserPermissions(prev => {
      const userPerms = prev[userId] || JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS['Picker']));
      const currentVal = userPerms[moduleKey]?.[action] ?? false;
      const updatedUserPerms = {
        ...userPerms,
        [moduleKey]: {
          ...(userPerms[moduleKey] || { read: false, create: false, edit: false, delete: false, approve: false, export: false }),
          [action]: !currentVal,
        },
      };

      toast.success(`Permission "${action.toUpperCase()}" for module "${moduleKey}" updated!`);

      // Audit log
      const targetUser = users.find(u => u.id === userId);
      setAuditLogs(logs => [
        {
          id: `log-${Date.now().toString().slice(-3)}`,
          timestamp: new Date().toLocaleString(),
          user: 'tariq.mansoor@oruswms.ae (Admin)',
          role: 'Warehouse Admin',
          entity: `User Permissions: ${targetUser?.fullName || userId}`,
          action: 'PERMISSION_OVERRIDE',
          ip: '192.168.10.45',
          device: 'Admin Terminal',
          diff: `Module "${moduleKey}" action "${action.toUpperCase()}" set to ${!currentVal}`,
        },
        ...logs,
      ]);

      return { ...prev, [userId]: updatedUserPerms };
    });
  };

  // Handlers for Feature 1.5: Approvals
  const handleApprovalAction = (approvalId: string, action: 'APPROVED' | 'REJECTED') => {
    const updated = approvals.map((app: any) => {
      if (app.id === approvalId) {
        toast.success(`Approval Request ${approvalId} has been ${action}!`);
        return { ...app, status: action, processedBy: 'Tariq Al-Mansoor (Admin)' };
      }
      return app;
    });
    setApprovals(updated);

    setAuditLogs(prev => [
      {
        id: `log-${Date.now().toString().slice(-3)}`,
        timestamp: new Date().toLocaleString(),
        user: 'tariq.mansoor@oruswms.ae (Admin)',
        role: 'Warehouse Admin',
        entity: `Workflow: ${approvalId}`,
        action: `WORKFLOW_${action}`,
        ip: '192.168.10.45',
        device: 'Admin Terminal',
        diff: `Request ${approvalId} marked as ${action} by supervisor`,
      },
      ...prev,
    ]);
  };

  const handleCreateApprovalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApprovalForm.itemCode || !newApprovalForm.reason) {
      toast.error('Please enter Item Code / SKU and reason.');
      return;
    }

    const created = {
      id: `APP-2026-0${Math.floor(1000 + Math.random() * 9000)}`,
      type: newApprovalForm.type,
      requestedBy: 'Zayd Ibrahim (Supervisor)',
      warehouse: INITIAL_WAREHOUSES.find(w => w.id === activeFacility)?.code || 'JAFZA-WH01',
      itemCode: newApprovalForm.itemCode,
      qty: Number(newApprovalForm.qty),
      estimatedValue: newApprovalForm.estimatedValue || 'AED 5,000',
      reason: newApprovalForm.reason,
      status: 'PENDING_APPROVAL',
      timestamp: new Date().toLocaleString(),
    };

    setApprovals([created, ...approvals]);
    toast.success(`New Approval Request ${created.id} submitted for supervisor review!`);
    setNewApprovalForm({ type: 'Stock Write-off / Shrinkage', itemCode: '', qty: '1', estimatedValue: '', reason: '' });
    setIsNewApprovalOpen(false);
  };

  // Handlers for Feature 1.7: Session & Security Controls
  const handleIssuePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error('Password confirmation does not match.');
      return;
    }

    const targetUser = users.find(u => u.id === selectedSecurityUserId);
    toast.success(`New password issued and login credentials updated for ${targetUser?.fullName}!`);

    // Add Audit Log
    setAuditLogs(prev => [
      {
        id: `log-${Date.now().toString().slice(-3)}`,
        timestamp: new Date().toLocaleString(),
        user: 'tariq.mansoor@oruswms.ae (Admin)',
        role: 'Warehouse Admin',
        entity: `Security: ${targetUser?.fullName || selectedSecurityUserId}`,
        action: 'PASSWORD_RESET',
        ip: '192.168.10.45',
        device: 'Admin Terminal',
        diff: `Issued new login password (Require reset on next login: ${passwordForm.requireResetOnNextLogin})`,
      },
      ...prev,
    ]);

    setPasswordForm({ password: '', confirmPassword: '', requireResetOnNextLogin: true });
  };

  const handleRevokeSession = (sessionId: string) => {
    const targetSession = sessions.find(s => s.id === sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast.success(`Session ${sessionId} (${targetSession?.userName}) revoked immediately!`);

    setAuditLogs(prev => [
      {
        id: `log-${Date.now().toString().slice(-3)}`,
        timestamp: new Date().toLocaleString(),
        user: 'tariq.mansoor@oruswms.ae (Admin)',
        role: 'Warehouse Admin',
        entity: `Active Session: ${sessionId}`,
        action: 'SESSION_REVOKE',
        ip: '192.168.10.45',
        device: 'Admin Terminal',
        diff: `Force logged out ${targetSession?.userName} from ${targetSession?.device}`,
      },
      ...prev,
    ]);
  };

  // Filtered users list
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesWarehouse = userWarehouseFilter === 'ALL' || u.assignedWarehouses.includes(userWarehouseFilter);
    return matchesSearch && matchesRole && matchesWarehouse;
  });

  // Selected user data for Module Permissions tab
  const permissionUserObj = users.find(u => u.id === selectedPermissionUserId) || users[0];
  const currentPermissionMap = userPermissions[permissionUserObj?.id] || DEFAULT_ROLE_PERMISSIONS[permissionUserObj?.role] || DEFAULT_ROLE_PERMISSIONS['Picker'];

  // Selected user data for Security tab
  const securityUserObj = users.find(u => u.id === selectedSecurityUserId) || users[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1674c4]">
            <ShieldCheck className="h-4 w-4" />
            M01 Security & Access Backbone
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1f2937] mt-1">User & Access Management</h1>
          <p className="text-sm text-[#6b7280]">
            Operational role hierarchies, facility data isolation, granular module permissions, approval workflows, and handheld terminal security for Dubai/UAE Warehouse Operations.
          </p>
        </div>

        {/* Live Facility Switcher Widget (Feature 1.3) */}
        <div className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white p-2.5 shadow-sm">
          <div className="rounded-md bg-[#eff6ff] p-2 text-[#1d4ed8]">
            <Warehouse className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-medium uppercase text-[#6b7280]">Active Facility Session</span>
            <select
              value={activeFacility}
              onChange={(e) => {
                setActiveFacility(e.target.value);
                toast.success(`Active Session Switched to ${INITIAL_WAREHOUSES.find(w => w.id === e.target.value)?.name}`);
              }}
              className="mt-0.5 text-xs font-bold text-[#1e293b] bg-transparent outline-none cursor-pointer"
            >
              {INITIAL_WAREHOUSES.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.code} - {wh.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid gap-3 md:grid-cols-5">
        <Card className="border-l-4 border-l-[#2563eb]">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-[#2563eb]" />
            <div>
              <p className="text-xs font-medium text-[#6b7280]">Active Personnel</p>
              <p className="text-xl font-bold text-[#1f2937]">{users.filter((u: any) => u.status === 'ACTIVE').length} Users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#16a34a]">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-5 w-5 text-[#16a34a]" />
            <div>
              <p className="text-xs font-medium text-[#6b7280]">Configured Roles</p>
              <p className="text-xl font-bold text-[#1f2937]">{roles.length} WMS Roles</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#d97706]">
          <CardContent className="flex items-center gap-3 p-4">
            <Warehouse className="h-5 w-5 text-[#d97706]" />
            <div>
              <p className="text-xs font-medium text-[#6b7280]">Dubai Facilities</p>
              <p className="text-xl font-bold text-[#1f2937]">{INITIAL_WAREHOUSES.length} Sites</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#ea580c]">
          <CardContent className="flex items-center gap-3 p-4">
            <FileCheck className="h-5 w-5 text-[#ea580c]" />
            <div>
              <p className="text-xs font-medium text-[#6b7280]">Pending Approvals</p>
              <p className="text-xl font-bold text-[#1f2937]">{approvals.filter((a: any) => a.status === 'PENDING_APPROVAL').length} Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#7c3aed]">
          <CardContent className="flex items-center gap-3 p-4">
            <Smartphone className="h-5 w-5 text-[#7c3aed]" />
            <div>
              <p className="text-xs font-medium text-[#6b7280]">Active Sessions</p>
              <p className="text-xl font-bold text-[#1f2937]">{sessions.length} Terminals</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Tabs Hub (Covers all 7 features of M01) */}
      <Tabs defaultValue="1.1-users" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1 bg-[#f1f5f9] border rounded-lg gap-1">
          <TabsTrigger value="1.1-users" className="flex items-center gap-1.5 text-xs py-2 px-3">
            <Users className="h-3.5 w-3.5" /> 1.1 User Management
          </TabsTrigger>
          <TabsTrigger value="1.2-rbac" className="flex items-center gap-1.5 text-xs py-2 px-3">
            <ShieldCheck className="h-3.5 w-3.5" /> 1.2 Role-Based Access (RBAC)
          </TabsTrigger>
          <TabsTrigger value="1.3-warehouse" className="flex items-center gap-1.5 text-xs py-2 px-3">
            <Warehouse className="h-3.5 w-3.5" /> 1.3 Warehouse Access
          </TabsTrigger>
          <TabsTrigger value="1.4-permissions" className="flex items-center gap-1.5 text-xs py-2 px-3">
            <Layers className="h-3.5 w-3.5" /> 1.4 Module Permissions
          </TabsTrigger>
          <TabsTrigger value="1.5-approvals" className="flex items-center gap-1.5 text-xs py-2 px-3">
            <CheckCircle2 className="h-3.5 w-3.5" /> 1.5 Approval Workflows
          </TabsTrigger>
          <TabsTrigger value="1.6-audit" className="flex items-center gap-1.5 text-xs py-2 px-3">
            <Clock className="h-3.5 w-3.5" /> 1.6 Audit Trail
          </TabsTrigger>
          <TabsTrigger value="1.7-security" className="flex items-center gap-1.5 text-xs py-2 px-3">
            <Lock className="h-3.5 w-3.5" /> 1.7 Session & Security
          </TabsTrigger>
        </TabsList>

        {/* ------------------- TAB 1.1: USER MANAGEMENT ------------------- */}
        <TabsContent value="1.1-users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#2563eb]" />
                  Warehouse Personnel Register
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Complete CRUD lifecycle for warehouse staff. Manage profile data, assigned facility clearance, and account statuses.
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddUserOpen(true)} className="bg-[#2563eb] hover:bg-[#1d4ed8]">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Warehouse User
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by Employee ID, Name, or Email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
                <div className="w-44">
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="All Roles" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All WMS Roles</SelectItem>
                      {roles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-52">
                  <Select value={userWarehouseFilter} onValueChange={setUserWarehouseFilter}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="All Facilities" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Dubai Facilities</SelectItem>
                      {INITIAL_WAREHOUSES.map(w => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-lg border bg-white overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] border-b text-[11px] uppercase font-semibold text-[#475569]">
                    <tr>
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Personnel Name</th>
                      <th className="py-3 px-4">WMS Role</th>
                      <th className="py-3 px-4">Primary Facility</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Last Activity</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[#334155]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          No personnel matched the search parameters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u: any) => {
                        const primWh = INITIAL_WAREHOUSES.find(w => w.id === u.primaryWarehouseId);
                        return (
                          <tr key={u.id} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="py-3 px-4 font-mono font-semibold text-[#1e293b]">{u.employeeId}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#0f172a]">{u.fullName}</div>
                              <div className="text-[11px] text-gray-500">{u.email} · {u.phone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e0f2fe] text-[#0369a1]">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium">{primWh?.code || 'Unassigned'}</td>
                            <td className="py-3 px-4">
                              {u.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#dcfce7] text-[#15803d]">
                                  <CheckCircle className="h-3 w-3" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fee2e2] text-[#b91c1c]">
                                  <AlertTriangle className="h-3 w-3" /> Suspended
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-500">{u.lastActive}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant={u.status === 'ACTIVE' ? 'outline' : 'default'}
                                onClick={() => toggleUserStatus(u.id)}
                                className="h-7 text-xs px-2"
                              >
                                <Power className="mr-1 h-3 w-3" />
                                {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- TAB 1.2: ROLE-BASED ACCESS CONTROL (RBAC - USER ROLE ASSIGNMENT) ------------------- */}
        <TabsContent value="1.2-rbac" className="space-y-4">
          <Card>
            <CardHeader pb-3>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#16a34a]" />
                Role-Based Access Control & Personnel Role Assignment
              </CardTitle>
              <CardDescription className="text-xs">
                View all warehouse personnel and change/assign their operational WMS Roles (Admin, Supervisor, Picker, Packer, Management/Auditor) live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personnel Role Assignment Table */}
              <div className="rounded-lg border bg-white overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-3 border-b flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#0f172a] uppercase tracking-wider">
                    Personnel Role Assignment Register ({users.length} Users)
                  </span>
                  <span className="text-xs text-[#64748b]">Select a new role from the dropdown to assign it to that user instantly</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f1f5f9] border-b text-[11px] uppercase font-semibold text-[#475569]">
                    <tr>
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Personnel Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Current Assigned Role</th>
                      <th className="py-3 px-4 text-right">Assign New Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[#334155]">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-[#1e293b]">{u.employeeId}</td>
                        <td className="py-3 px-4 font-bold text-[#0f172a]">{u.fullName}</td>
                        <td className="py-3 px-4 text-gray-500">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#e0f2fe] text-[#0369a1]">
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                            className="h-8 text-xs font-semibold px-2.5 py-1 rounded border border-[#cbd5e1] bg-white text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] cursor-pointer outline-none"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role Cards Overview */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-3">WMS Role Presets & Descriptions</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {roles.map((role) => {
                    const assignedUsers = users.filter(u => u.role === role.name);
                    return (
                      <Card key={role.id} className="border bg-[#f8fafc]">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold text-[#0f172a]">{role.name}</CardTitle>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              {assignedUsers.length} Users
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 space-y-2">
                          <p className="text-xs text-[#475569] leading-relaxed">{role.description}</p>
                          <div className="pt-2 border-t text-[11px] text-[#64748b]">
                            <strong>Active Members:</strong> {assignedUsers.map(u => u.fullName).join(', ') || 'None assigned'}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- TAB 1.3: WAREHOUSE-LEVEL ACCESS CONTROL ------------------- */}
        <TabsContent value="1.3-warehouse" className="space-y-4">
          <Card>
            <CardHeader pb-3>
              <CardTitle className="text-base flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-[#d97706]" />
                Warehouse-Level Access Isolation & Multi-Site Clearances
              </CardTitle>
              <CardDescription className="text-xs">
                Restrict staff visibility so personnel assigned to Jebel Ali Free Zone (JAFZA) cannot manipulate stock in Dubai Mainland without clearance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-[#fffbeb] border border-[#fde68a] rounded-lg text-xs text-[#b45309] flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#d97706]" />
                <div>
                  <strong>Session Warehouse Enforcement Active:</strong> Transactional queries are strictly filtered by authorized <code>warehouse_id</code>. Toggle multi-facility clearance checkboxes below to test real-time permission granting.
                </div>
              </div>

              <div className="rounded-lg border bg-white overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] border-b text-[11px] uppercase font-semibold text-[#475569]">
                    <tr>
                      <th className="py-3 px-4">Personnel</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      {INITIAL_WAREHOUSES.map((wh) => (
                        <th key={wh.id} className="py-3 px-4 text-center">
                          <div>{wh.code}</div>
                          <div className="text-[9px] text-gray-400 font-normal uppercase">{wh.zone}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[#334155]">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-[#f8fafc]">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0f172a]">{u.fullName}</div>
                          <div className="text-[10px] text-gray-500">{u.employeeId}</div>
                        </td>
                        <td className="py-3 px-4 font-medium">{u.role}</td>
                        {INITIAL_WAREHOUSES.map((wh) => {
                          const isAssigned = u.assignedWarehouses.includes(wh.id);
                          return (
                            <td key={wh.id} className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => handleWarehouseAccessToggle(u.id, wh.id)}
                                className="h-4 w-4 rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- TAB 1.4: INTERACTIVE MODULE PERMISSIONS MATRIX ------------------- */}
        <TabsContent value="1.4-permissions" className="space-y-4">
          <Card>
            <CardHeader pb-3>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#0284c7]" />
                    User-Specific & Role Module Access Matrix
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select any warehouse employee to customize and toggle their exact action permissions (Read, Create, Edit, Delete, Approve, Export) across WMS sub-modules.
                  </CardDescription>
                </div>

                {/* Select User Dropdown */}
                <div className="flex items-center gap-2 bg-[#f8fafc] p-2 rounded-lg border">
                  <span className="text-xs font-semibold text-[#475569]">Select Personnel:</span>
                  <select
                    value={selectedPermissionUserId}
                    onChange={(e) => setSelectedPermissionUserId(e.target.value)}
                    className="h-8 text-xs font-bold px-2 rounded border border-[#cbd5e1] bg-white text-[#0f172a] outline-none cursor-pointer"
                  >
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.employeeId}) — {u.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Selected User Summary Banner */}
              <div className="p-3 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0369a1]">{permissionUserObj.fullName}</span> ({permissionUserObj.employeeId}) — Assigned Role: <span className="font-semibold">{permissionUserObj.role}</span>
                  <div className="text-[11px] text-[#0284c7]">Click any checkmark / cross icon below to toggle that specific action permission live!</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    const defaultPerms = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[permissionUserObj.role] || DEFAULT_ROLE_PERMISSIONS['Picker']));
                    setUserPermissions(prev => ({ ...prev, [permissionUserObj.id]: defaultPerms }));
                    toast.success(`Reset module permissions for ${permissionUserObj.fullName} to default ${permissionUserObj.role} preset.`);
                  }}
                >
                  <RotateCcw className="mr-1 h-3 w-3" /> Reset to Role Default
                </Button>
              </div>

              {/* Interactive Permissions Matrix */}
              <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] border-b font-semibold text-[#475569]">
                    <tr>
                      <th className="py-3 px-4">WMS Sub-Module</th>
                      <th className="py-3 px-4 text-center">Read / View</th>
                      <th className="py-3 px-4 text-center">Create</th>
                      <th className="py-3 px-4 text-center">Edit / Modify</th>
                      <th className="py-3 px-4 text-center">Delete / Void</th>
                      <th className="py-3 px-4 text-center">Approve</th>
                      <th className="py-3 px-4 text-center">Export / Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium text-[#334155]">
                    {WMS_SUB_MODULES.map((mod) => {
                      const modPerms = currentPermissionMap[mod.key] || { read: false, create: false, edit: false, delete: false, approve: false, export: false };
                      return (
                        <tr key={mod.key} className="hover:bg-[#f8fafc]">
                          <td className="py-3 px-4 font-semibold text-[#0f172a]">{mod.name}</td>

                          {(['read', 'create', 'edit', 'delete', 'approve', 'export'] as const).map((act) => {
                            const isAllowed = Boolean(modPerms[act]);
                            return (
                              <td key={act} className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleModulePermissionToggle(permissionUserObj.id, mod.key, act)}
                                  className={`p-1.5 rounded transition-all hover:scale-110 ${
                                    isAllowed
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                                  }`}
                                  title={`Click to ${isAllowed ? 'Revoke' : 'Grant'} ${act.toUpperCase()} on ${mod.name}`}
                                >
                                  {isAllowed ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4 stroke-[3]" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- TAB 1.5: APPROVAL WORKFLOWS ------------------- */}
        <TabsContent value="1.5-approvals" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                  Operational Guardrails & Approval Queue
                </CardTitle>
                <CardDescription className="text-xs">
                  Require supervisor authorization for sensitive actions like stock write-offs, shrinkage adjustments, and inter-warehouse transfers.
                </CardDescription>
              </div>
              <Button onClick={() => setIsNewApprovalOpen(true)} variant="outline" className="text-xs">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Submit Dummy Approval Request
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvals.map((req: any) => (
                  <div key={req.id} className="p-4 rounded-lg border bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#2563eb]">{req.id}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                          {req.type}
                        </span>
                        {req.status === 'PENDING_APPROVAL' && (
                          <span className="text-xs font-bold text-[#d97706] bg-[#fef3c7] px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="h-3 w-3" /> PENDING
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> APPROVED
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <X className="h-3 w-3" /> REJECTED
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-[#0f172a] mt-1">{req.itemCode}</div>
                      <div className="text-xs text-[#64748b]">
                        Qty: <strong>{req.qty}</strong> · Est. Value: <strong>{req.estimatedValue}</strong> · Facility: <strong>{req.warehouse}</strong>
                      </div>
                      <div className="text-xs text-[#475569] italic bg-slate-50 p-2 rounded border mt-1">
                        &quot;{req.reason}&quot; — <span className="font-medium">{req.requestedBy}</span> ({req.timestamp})
                      </div>
                    </div>

                    {req.status === 'PENDING_APPROVAL' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-[#16a34a] hover:bg-[#15803d] text-xs h-8"
                          onClick={() => handleApprovalAction(req.id, 'APPROVED')}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs h-8"
                          onClick={() => handleApprovalAction(req.id, 'REJECTED')}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-right text-gray-500 shrink-0">
                        Processed by<br />
                        <strong className="text-gray-700">{req.processedBy || 'System Admin'}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- TAB 1.6: ACTIVITY TRACKING (AUDIT TRAIL) ------------------- */}
        <TabsContent value="1.6-audit" className="space-y-4">
          <Card>
            <CardHeader pb-3>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#6366f1]" />
                User Activity Tracking & Immutable Audit Log
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time capture of transactional changes, IP addresses, terminal device IDs, and before/after state diffs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] border-b font-semibold text-[#475569]">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Personnel</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity Modified</th>
                      <th className="py-3 px-4">Device / Terminal</th>
                      <th className="py-3 px-4 text-right">State Diff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[#334155]">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-[#f8fafc]">
                        <td className="py-3 px-4 font-mono text-[11px] text-gray-500">{log.timestamp}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0f172a]">{log.user}</div>
                          <div className="text-[10px] text-gray-400">{log.role}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2 py-0.5 rounded">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{log.entity}</td>
                        <td className="py-3 px-4 text-gray-500">
                          <div>{log.device}</div>
                          <div className="font-mono text-[10px] text-gray-400">{log.ip}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-[#2563eb]"
                            onClick={() => setSelectedAuditLog(log)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" /> View Diff
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------- TAB 1.7: SESSION & SECURITY CONTROLS (PASSWORD & SESSION MANAGER) ------------------- */}
        <TabsContent value="1.7-security" className="space-y-4">
          <Card>
            <CardHeader pb-3>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#7c3aed]" />
                User Password Issuance, Active Session Revocation & Security Controls
              </CardTitle>
              <CardDescription className="text-xs">
                Manage passwords for individual warehouse users, inspect & immediately kick active handheld sessions, and enforce floor terminal auto-logout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section 1: User Password Management */}
              <div className="border rounded-lg bg-white p-4 space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b">
                  <div>
                    <h3 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                      <Key className="h-4 w-4 text-[#2563eb]" />
                      Personnel Password Management & Credential Reset
                    </h3>
                    <p className="text-xs text-[#64748b]">Select a warehouse user to issue a new login password or force password rotation.</p>
                  </div>

                  <div className="flex items-center gap-2 bg-[#f8fafc] p-2 rounded-lg border">
                    <span className="text-xs font-semibold text-[#475569]">Select Personnel:</span>
                    <select
                      value={selectedSecurityUserId}
                      onChange={(e) => setSelectedSecurityUserId(e.target.value)}
                      className="h-8 text-xs font-bold px-2 rounded border border-[#cbd5e1] bg-white text-[#0f172a] outline-none cursor-pointer"
                    >
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.employeeId}) — {u.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <form onSubmit={handleIssuePassword} className="grid gap-4 md:grid-cols-3 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs">New Password for {securityUserObj.fullName}</Label>
                    <Input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="Re-enter password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-3 pb-1">
                    <Button type="submit" size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-xs h-9">
                      <Key className="mr-1 h-3.5 w-3.5" /> Issue New Password
                    </Button>
                  </div>
                </form>
              </div>

              {/* Section 2: Active Sessions & Immediate Revocation */}
              <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="bg-[#f8fafc] px-4 py-3 border-b flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-[#7c3aed]" />
                    Active Terminal & Scanner Sessions ({sessions.length} Live Sessions)
                  </span>
                  <span className="text-xs text-[#64748b]">Click &quot;Revoke Session&quot; to immediately log out any user device</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f1f5f9] border-b text-[11px] uppercase font-semibold text-[#475569]">
                    <tr>
                      <th className="py-3 px-4">Session ID</th>
                      <th className="py-3 px-4">Personnel</th>
                      <th className="py-3 px-4">Device / Terminal</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Login Timestamp</th>
                      <th className="py-3 px-4 text-right">Session Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[#334155]">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-400">
                          No active sessions currently logged in.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((sess: any) => (
                        <tr key={sess.id} className="hover:bg-[#f8fafc]">
                          <td className="py-3 px-4 font-mono font-bold text-[#4f46e5]">{sess.id}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0f172a]">{sess.userName}</div>
                            <div className="text-[10px] text-gray-500">{sess.userEmail} · {sess.role}</div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-1.5">
                              {sess.isHandheld ? <Smartphone className="h-3.5 w-3.5 text-[#7c3aed]" /> : <Laptop className="h-3.5 w-3.5 text-[#2563eb]" />}
                              {sess.device}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-500">{sess.ip}</td>
                          <td className="py-3 px-4 text-gray-500">{sess.loginTime}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs px-2"
                              onClick={() => handleRevokeSession(sess.id)}
                            >
                              <LogOut className="mr-1 h-3 w-3" /> Revoke Session
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Section 3: Handheld Timeout & System Policies */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Handheld RF Scanner Session Control */}
                <div className="p-4 border rounded-lg bg-[#f8fafc] space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm text-[#0f172a]">
                    <Smartphone className="h-4 w-4 text-[#7c3aed]" />
                    Handheld Barcode Scanner Auto-Logout Timeout
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Auto-logout floor staff on Zebra / Honeywell mobile terminals to prevent station takeover on shared warehouse floors.
                  </p>
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs">Idle Inactivity Timeout (Minutes)</Label>
                    <Select
                      value={securitySettings.handheldTimeout}
                      onValueChange={(val) => {
                        setSecuritySettings({ ...securitySettings, handheldTimeout: val });
                        toast.success(`Handheld RF Scanner timeout set to ${val} minutes!`);
                      }}
                    >
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Minutes (Strict Floor Security)</SelectItem>
                        <SelectItem value="5">5 Minutes (Standard Dubai WMS)</SelectItem>
                        <SelectItem value="15">15 Minutes (Supervisor Terminals)</SelectItem>
                        <SelectItem value="30">30 Minutes (Office Desktop)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Password Policy & 2FA */}
                <div className="p-4 border rounded-lg bg-[#f8fafc] space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm text-[#0f172a]">
                    <Shield className="h-4 w-4 text-[#16a34a]" />
                    Password & Authentication Policies
                  </div>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnforced}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, twoFactorEnforced: e.target.checked });
                          toast.success(`Enforce 2FA set to ${e.target.checked}`);
                        }}
                        className="h-4 w-4 text-[#2563eb] rounded"
                      />
                      Enforce 2FA for Warehouse Admins & Supervisors
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.sessionRevocationOnRoleChange}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, sessionRevocationOnRoleChange: e.target.checked });
                          toast.success('Session revocation policy updated');
                        }}
                        className="h-4 w-4 text-[#2563eb] rounded"
                      />
                      Immediately invalidate active JWT sessions upon role update
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: ADD NEW USER */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#2563eb]" />
              Provision New Warehouse Personnel
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new user to the Dubai WMS system. Values are immediately active for live demonstration.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Employee ID</Label>
              <Input
                placeholder="e.g. EMP-DXB-309"
                value={newUserForm.employeeId}
                onChange={(e) => setNewUserForm({ ...newUserForm, employeeId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input
                placeholder="e.g. Sultan Al-Nuaimi"
                value={newUserForm.fullName}
                onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email Address</Label>
              <Input
                type="email"
                placeholder="sultan.nuaimi@oruswms.ae"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone Number</Label>
              <Input
                placeholder="+971 50 111 2233"
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Assigned WMS Role</Label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs"
                >
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Primary Facility</Label>
                <select
                  value={newUserForm.primaryWarehouseId}
                  onChange={(e) => setNewUserForm({ ...newUserForm, primaryWarehouseId: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs"
                >
                  {INITIAL_WAREHOUSES.map(wh => <option key={wh.id} value={wh.id}>{wh.code}</option>)}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8]">
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: SUBMIT DUMMY APPROVAL REQUEST */}
      <Dialog open={isNewApprovalOpen} onOpenChange={setIsNewApprovalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#ea580c]" />
              Submit Approval Request (Demo)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Simulate submitting a sensitive warehouse action for supervisor sign-off.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateApprovalRequest} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Transaction Type</Label>
              <select
                value={newApprovalForm.type}
                onChange={(e) => setNewApprovalForm({ ...newApprovalForm, type: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs"
              >
                <option value="Stock Write-off / Shrinkage">Stock Write-off / Shrinkage</option>
                <option value="Inter-Warehouse Transfer">Inter-Warehouse Transfer</option>
                <option value="Manual Price Override">Manual Price Override</option>
                <option value="Order Cancellation">Order Cancellation</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Item Code / SKU</Label>
              <Input
                placeholder="e.g. SKU-LUX-5510 (Designer Perfume 100ml)"
                value={newApprovalForm.itemCode}
                onChange={(e) => setNewApprovalForm({ ...newApprovalForm, itemCode: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  value={newApprovalForm.qty}
                  onChange={(e) => setNewApprovalForm({ ...newApprovalForm, qty: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Estimated Value</Label>
                <Input
                  placeholder="e.g. AED 14,200"
                  value={newApprovalForm.estimatedValue}
                  onChange={(e) => setNewApprovalForm({ ...newApprovalForm, estimatedValue: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Justification / Reason</Label>
              <Textarea
                placeholder="Explain why this action requires supervisor sign-off..."
                value={newApprovalForm.reason}
                onChange={(e) => setNewApprovalForm({ ...newApprovalForm, reason: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewApprovalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#ea580c] hover:bg-[#c2410c]">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: AUDIT DIFF PREVIEW */}
      <Dialog open={!!selectedAuditLog} onOpenChange={() => setSelectedAuditLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Audit Event State Diff</DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Event ID: {selectedAuditLog?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedAuditLog && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded border">
                <div>
                  <span className="text-gray-400 block">User:</span>
                  <span className="font-semibold text-gray-800">{selectedAuditLog.user}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Timestamp:</span>
                  <span className="font-mono text-gray-800">{selectedAuditLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Device / IP:</span>
                  <span className="font-mono text-gray-800">{selectedAuditLog.device} ({selectedAuditLog.ip})</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Action:</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedAuditLog.action}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs mb-1 block">Captured Diff Summary</Label>
                <div className="p-3 bg-gray-950 text-emerald-400 font-mono text-xs rounded-md">
                  {selectedAuditLog.diff}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserAccessManagementPage;
