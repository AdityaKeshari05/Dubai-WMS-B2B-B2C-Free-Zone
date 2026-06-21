'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Package, Users, ShoppingCart, UserCheck,
  TrendingUp, FileText, ShoppingBag, FolderOpen, Building2, Truck,
  ChevronDown, ChevronRight, X, Settings, Bell
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Accounting', icon: BookOpen,
    children: [
      { label: 'Chart of Accounts', href: '/accounting/accounts', icon: BookOpen },
      { label: 'Journal Entries', href: '/accounting/journal-entries', icon: FileText },
      { label: 'Financial Reports', href: '/accounting/reports', icon: TrendingUp },
    ],
  },
  {
    label: 'Inventory', icon: Package,
    children: [
      { label: 'Products', href: '/inventory/products', icon: Package },
      { label: 'Categories', href: '/inventory/categories', icon: FolderOpen },
      { label: 'Warehouses', href: '/inventory/warehouses', icon: Building2 },
      { label: 'Stock Movements', href: '/inventory/stock-movements', icon: TrendingUp },
    ],
  },
  {
    label: 'HR', icon: Users,
    children: [
      { label: 'Employees', href: '/hr/employees', icon: Users },
      { label: 'Departments', href: '/hr/departments', icon: Building2 },
      { label: 'Attendance', href: '/hr/attendance', icon: UserCheck },
      { label: 'Leave Management', href: '/hr/leave', icon: FileText },
      { label: 'Payroll', href: '/hr/payroll', icon: FileText },
    ],
  },
  {
    label: 'CRM', icon: UserCheck,
    children: [
      { label: 'Leads', href: '/crm/leads', icon: TrendingUp },
      { label: 'Contacts', href: '/crm/contacts', icon: Users },
      { label: 'Opportunities', href: '/crm/opportunities', icon: TrendingUp },
      { label: 'Activities', href: '/crm/activities', icon: FileText },
    ],
  },
  {
    label: 'Sales', icon: ShoppingCart,
    children: [
      { label: 'Sales Orders', href: '/sales/orders', icon: ShoppingCart },
      { label: 'Quotations', href: '/sales/quotations', icon: FileText },
    ],
  },
  {
    label: 'Invoicing', icon: FileText,
    children: [
      { label: 'Sales Invoices', href: '/invoicing/sales-invoices', icon: FileText },
      { label: 'Payments', href: '/invoicing/payments', icon: TrendingUp },
    ],
  },
  {
    label: 'Procurement', icon: ShoppingBag,
    children: [
      { label: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ShoppingBag },
      { label: 'Purchase Invoices', href: '/procurement/purchase-invoices', icon: FileText },
    ],
  },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Customers', href: '/customers', icon: Building2 },
  { label: 'Suppliers', href: '/suppliers', icon: Truck },
  { label: 'Settings', href: '/settings', icon: Settings },
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
            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
            'text-slate-300 hover:bg-slate-700 hover:text-white',
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
          <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
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
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        isActive
          ? 'bg-blue-600 text-white font-medium'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white',
        depth === 0 ? 'font-medium' : 'font-normal'
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-slate-800 z-50 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg">Orus</span>
              <span className="text-slate-400 text-xs block -mt-1">ERP System</span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavItemComponent key={item.label} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">Orus ERP v1.0</p>
        </div>
      </aside>
    </>
  );
}
