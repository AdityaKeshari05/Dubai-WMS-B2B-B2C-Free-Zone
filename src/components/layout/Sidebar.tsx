'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, Package, Users, ShoppingCart, UserCheck,
  TrendingUp, FileText, ShoppingBag, FolderOpen, Building2, Truck,
  ChevronDown, ChevronRight, X, Settings, Clock, ShieldCheck, BriefcaseBusiness
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  permission?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:dashboard:read' },
  {
    label: 'Accounting', icon: BookOpen,
    children: [
	      { label: 'Chart of Accounts', href: '/accounting/accounts', icon: BookOpen, permission: 'accounting:accounts:read' },
	      { label: 'Journal Entries', href: '/accounting/journal-entries', icon: FileText, permission: 'accounting:journal-entries:read' },
	      { label: 'Financial Reports', href: '/accounting/reports', icon: TrendingUp, permission: 'accounting:reports:read' },
    ],
  },
  {
    label: 'Inventory', icon: Package,
    children: [
	      { label: 'Products', href: '/inventory/products', icon: Package, permission: 'inventory:products:read' },
	      { label: 'Categories', href: '/inventory/categories', icon: FolderOpen, permission: 'inventory:categories:read' },
	      { label: 'Warehouses', href: '/inventory/warehouses', icon: Building2, permission: 'inventory:warehouses:read' },
	      { label: 'Stock Movements', href: '/inventory/stock-movements', icon: TrendingUp, permission: 'inventory:stock-movements:read' },
    ],
  },
  {
    label: 'HR', icon: Users,
    children: [
      { label: 'HR Desk', href: '/hr/desk', icon: LayoutDashboard },
      { label: 'My Profile', href: '/hr/my-profile', icon: UserCheck },
      { label: 'Employees', href: '/hr/employees', icon: Users, permission: 'hr:employees:read' },
      { label: 'Departments', href: '/hr/departments', icon: Building2 },
      { label: 'Positions', href: '/hr/positions', icon: BriefcaseBusiness },
      { label: 'Attendance', href: '/hr/attendance', icon: UserCheck },
      { label: 'Shifts', href: '/hr/shifts', icon: Clock },
      { label: 'Leave Management', href: '/hr/leave', icon: FileText },
      { label: 'Leave Ledger', href: '/hr/leave-ledger', icon: BookOpen },
      { label: 'Lifecycle', href: '/hr/lifecycle', icon: TrendingUp },
      { label: 'Salary Structures', href: '/hr/salary-structures', icon: BookOpen },
      { label: 'Payroll Entries', href: '/hr/payroll-entries', icon: FileText },
      { label: 'Salary Slips', href: '/hr/salary-slips', icon: FileText },
      { label: 'Payroll', href: '/hr/payroll', icon: FileText, permission: 'hr:payroll:read' },
    ],
  },
  {
    label: 'CRM', icon: UserCheck,
    children: [
      { label: 'Leads', href: '/crm/leads', icon: TrendingUp, permission: 'crm:leads:read' },
      { label: 'Contacts', href: '/crm/contacts', icon: Users },
      { label: 'Opportunities', href: '/crm/opportunities', icon: TrendingUp },
      { label: 'Activities', href: '/crm/activities', icon: FileText },
    ],
  },
  {
    label: 'Sales', icon: ShoppingCart,
    children: [
      { label: 'Sales Orders', href: '/sales/orders', icon: ShoppingCart, permission: 'sales:sales-orders:read' },
      { label: 'Quotations', href: '/sales/quotations', icon: FileText, permission: 'sales:quotations:read' },
    ],
  },
  {
    label: 'Invoicing', icon: FileText,
    children: [
      { label: 'Sales Invoices', href: '/invoicing/sales-invoices', icon: FileText, permission: 'invoicing:sales-invoices:read' },
      { label: 'Payments', href: '/invoicing/payments', icon: TrendingUp },
      { label: 'Payment Entries', href: '/invoicing/payment-entries', icon: TrendingUp },
      { label: 'Delivery Notes', href: '/invoicing/delivery-notes', icon: Truck },
      { label: 'Credit Notes', href: '/invoicing/credit-notes', icon: FileText },
      { label: 'Tax Templates', href: '/invoicing/tax-templates', icon: BookOpen },
      { label: 'Ledger', href: '/invoicing/ledger', icon: BookOpen },
      { label: 'Print Formats', href: '/invoicing/print-formats', icon: FileText },
      { label: 'Recurring Invoices', href: '/invoicing/subscriptions', icon: TrendingUp },
      { label: 'Audit Log', href: '/invoicing/audit-log', icon: FileText },
      { label: 'Aging Report', href: '/invoicing/reports/aging', icon: TrendingUp },
      { label: 'Outstanding', href: '/invoicing/reports/outstanding', icon: TrendingUp },
      { label: 'Revenue by Customer', href: '/invoicing/reports/revenue-by-customer', icon: TrendingUp },
      { label: 'Revenue by Item', href: '/invoicing/reports/revenue-by-item', icon: TrendingUp },
      { label: 'Revenue by Period', href: '/invoicing/reports/revenue-by-period', icon: TrendingUp },
    ],
  },
  {
    label: 'Procurement', icon: ShoppingBag,
    children: [
      { label: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ShoppingBag, permission: 'procurement:purchase-orders:read' },
      { label: 'Purchase Invoices', href: '/procurement/purchase-invoices', icon: FileText },
    ],
  },
  { label: 'Projects', href: '/projects', icon: FolderOpen, permission: 'projects:projects:read' },
  { label: 'Customers', href: '/customers', icon: Building2, permission: 'customers:customers:read' },
  { label: 'Suppliers', href: '/suppliers', icon: Truck, permission: 'suppliers:suppliers:read' },
  {
    label: 'Settings', icon: Settings,
    children: [
      { label: 'General Settings', href: '/settings', icon: Settings },
      { label: 'Access Control', href: '/settings/access', icon: ShieldCheck, permission: 'access:users:read' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(() => {
    if (!item.children) return false;
    return item.children.some(child => child.href === pathname || pathname.startsWith(child.href || ''));
  });

  const isActive = item.href === pathname || (item.href && item.href !== '/dashboard' && pathname.startsWith(item.href));

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors',
            'text-[#4b5563] hover:bg-[#eef3f5] hover:text-[#1f2937]',
            depth === 0 ? 'font-medium' : 'font-normal'
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </div>
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-[#e5e2dc] pl-2">
            {item.children.map((child) => (
              <NavItemComponent key={child.label} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        isActive
          ? 'bg-[#e8f3ff] text-[#1674c4] font-medium'
          : 'text-[#4b5563] hover:bg-[#eef3f5] hover:text-[#1f2937]',
        depth === 0 ? 'font-medium' : 'font-normal'
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const inferredPermission = (href?: string) => {
    if (!href) return undefined;
    const parts = href.split('/').filter(Boolean);
    if (href === '/dashboard') return 'dashboard:dashboard:read';
    if (parts[0] === 'settings') return parts[1] === 'access' ? 'access:users:read' : 'company:company:read';
    if (parts[0] === 'customers') return 'customers:customers:read';
    if (parts[0] === 'suppliers') return 'suppliers:suppliers:read';
    if (parts[0] === 'projects') return 'projects:projects:read';
    if (parts[0] === 'sales') return `sales:${parts[1] === 'orders' ? 'sales-orders' : parts[1]}:read`;
    if (parts[0] === 'hr') {
      const hrMap: Record<string, string> = {
        desk: 'hr:employees:read',
        'my-profile': 'hr:employees:read',
        employees: 'hr:employees:read',
        departments: 'hr:departments:read',
        positions: 'hr:positions:read',
        attendance: 'hr:attendance:read',
        shifts: 'hr:shifts:read',
        leave: 'hr:leave:read',
        'leave-ledger': 'hr:leave:read',
        lifecycle: 'hr:lifecycle:read',
        'salary-structures': 'hr:salary:read',
        'salary-slips': 'hr:salary:read',
        payroll: 'hr:payroll:read',
        'payroll-entries': 'hr:payroll:read',
      };
      return hrMap[parts[1]];
    }
    if (parts[0] === 'invoicing') {
      const resource = parts[1] === 'reports' ? 'reports' : parts[1];
      return `invoicing:${resource}:read`;
    }
    if (parts[0] === 'inventory' || parts[0] === 'crm' || parts[0] === 'accounting' || parts[0] === 'procurement') {
      return `${parts[0]}:${parts[1]}:read`;
    }
    return undefined;
  };
  const canSee = (item: NavItem): boolean => {
    if (!user?.access || user.access.isSuperAdmin) return true;
    if (item.children) return item.children.some(canSee);
    const permission = item.permission || inferredPermission(item.href);
    if (!permission) return true;
    return user.access.permissions.includes(permission) && !user.access.deniedPermissions.includes(permission);
  };
  const visibleItems = navItems
    .map((item) => item.children ? { ...item, children: item.children.filter(canSee) } : item)
    .filter(canSee);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-[#e5e2dc] bg-[#fbfaf8] transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-[#e5e2dc] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2490ef] shadow-sm shadow-[#2490ef]/25">
              <span className="text-sm font-bold text-white">O</span>
            </div>
            <div>
              <span className="text-base font-semibold text-[#1f2937]">Orus</span>
              <span className="block -mt-1 text-xs text-[#7c8591]">ERP Desk</span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-[#7c8591] hover:text-[#1f2937] lg:hidden">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
	          {visibleItems.map((item) => (
            <NavItemComponent key={item.label} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#e5e2dc] px-4 py-3">
          <p className="text-center text-xs text-[#8a929d]">Orus ERP v1.0</p>
        </div>
      </aside>
    </>
  );
}
