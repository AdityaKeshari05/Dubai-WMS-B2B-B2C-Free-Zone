'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Package, Users, ShoppingCart, UserCheck,
  TrendingUp, FileText, ShoppingBag, FolderOpen, Building2, Truck,
  ChevronDown, ChevronRight, X, Settings, Clock
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
      { label: 'HR Desk', href: '/hr/desk', icon: LayoutDashboard },
      { label: 'My Profile', href: '/hr/my-profile', icon: UserCheck },
      { label: 'Employees', href: '/hr/employees', icon: Users },
      { label: 'Departments', href: '/hr/departments', icon: Building2 },
      { label: 'Attendance', href: '/hr/attendance', icon: UserCheck },
      { label: 'Shifts', href: '/hr/shifts', icon: Clock },
      { label: 'Leave Management', href: '/hr/leave', icon: FileText },
      { label: 'Leave Ledger', href: '/hr/leave-ledger', icon: BookOpen },
      { label: 'Lifecycle', href: '/hr/lifecycle', icon: TrendingUp },
      { label: 'Salary Structures', href: '/hr/salary-structures', icon: BookOpen },
      { label: 'Payroll Entries', href: '/hr/payroll-entries', icon: FileText },
      { label: 'Salary Slips', href: '/hr/salary-slips', icon: FileText },
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
          {navItems.map((item) => (
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
