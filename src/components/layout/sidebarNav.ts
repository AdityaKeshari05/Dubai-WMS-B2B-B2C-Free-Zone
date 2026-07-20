import {
  LayoutDashboard, BookOpen, Package, Users, ShoppingCart, UserCheck,
  TrendingUp, FileText, ShoppingBag, FolderOpen, Building2, Truck,
  ChevronDown, ChevronRight, X, Settings, Clock, ShieldCheck, BriefcaseBusiness, ClipboardList, Tags
} from 'lucide-react';

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  permission?: string;
  children?: NavItem[];
}

export const navItems: NavItem[] = [
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
	      { label: 'Stock Entries', href: '/inventory/stock-entries', icon: ClipboardList, permission: 'inventory:stock-entries:read' },
	      { label: 'Stock Movements', href: '/inventory/stock-movements', icon: TrendingUp, permission: 'inventory:stock-movements:read' },
	      { label: 'Pricing', href: '/inventory/pricing', icon: Tags, permission: 'inventory:price-lists:read' },
	      { label: 'Stock Balance', href: '/inventory/reports/stock-balance', icon: BookOpen, permission: 'inventory:stock-balance:read' },
	      { label: 'Stock Ledger', href: '/inventory/reports/stock-ledger', icon: BookOpen, permission: 'inventory:stock-ledger:read' },
	      { label: 'Projected Stock', href: '/inventory/reports/projected-stock', icon: TrendingUp, permission: 'inventory:projected-stock:read' },
	      { label: 'Reserved Stock', href: '/inventory/reports/reserved-stock', icon: BookOpen, permission: 'inventory:stock-balance:read' },
	      { label: 'Warehouse Valuation', href: '/inventory/reports/warehouse-valuation', icon: BookOpen, permission: 'inventory:stock-balance:read' },
	      { label: 'Item-wise Sales', href: '/inventory/reports/item-wise-sales', icon: TrendingUp, permission: 'inventory:stock-balance:read' },
	      { label: 'Gross Profit', href: '/inventory/reports/gross-profit', icon: TrendingUp, permission: 'inventory:stock-balance:read' },
	      { label: 'Slow Moving Stock', href: '/inventory/reports/slow-moving-stock', icon: Clock, permission: 'inventory:stock-balance:read' },
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
      { label: 'CRM Dashboard', href: '/crm/dashboard', icon: LayoutDashboard, permission: 'crm:dashboard:read' },
      { label: 'Leads', href: '/crm/leads', icon: TrendingUp, permission: 'crm:leads:read' },
      { label: 'Lead Imports', href: '/crm/imports', icon: FileText, permission: 'crm:imports:read' },
      { label: 'Organizations', href: '/crm/organizations', icon: Building2, permission: 'crm:organizations:read' },
      { label: 'Contacts', href: '/crm/contacts', icon: Users },
      { label: 'Opportunities', href: '/crm/opportunities', icon: TrendingUp },
      { label: 'Activities', href: '/crm/activities', icon: FileText },
      { label: 'Assignment Rules', href: '/crm/assignment-rules', icon: UserCheck, permission: 'crm:assignment-rules:read' },
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

export function inferredPermission(href?: string) {
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
}
