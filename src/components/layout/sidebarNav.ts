// Nav configuration resolved
import {
  LayoutDashboard, BookOpen, Package, Users, ShoppingCart, UserCheck,
  TrendingUp, FileText, ShoppingBag, FolderOpen, Building2, Truck,
  ChevronDown, ChevronRight, X, Settings, Clock, ShieldCheck, BriefcaseBusiness, ClipboardList, Tags,
  Receipt, CreditCard, Landmark, FileMinus, Percent, Printer, Repeat, ClipboardCheck,
  Hourglass, CircleDollarSign, CalendarDays, ScrollText, CalendarRange, Network, WalletCards,
  BarChart3, Warehouse, Boxes, ArrowLeftRight, Layers, Archive, LockKeyhole, Calculator,
  ChartColumnIncreasing, ArchiveX, UserRound, Building, Target, Activity,
  Route, Upload, FileCheck2, ClipboardSignature, CalendarCheck, CalendarCog, CalendarX,
  ListChecks, HandCoins, BadgeDollarSign, Wallet, UserCog, SlidersHorizontal, KeyRound,
  Handshake, Scale, PackageCheck, History, Waves, Send, RotateCcw, CheckCircle2, AlertTriangle, RefreshCw, Globe
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
  { label: 'Audit Trail', href: '/audit-trail', icon: History, permission: 'access:audit:read' },
  {
    label: 'Accounting', icon: Landmark,
    children: [
	      { label: 'Chart of Accounts', href: '/accounting/accounts', icon: Network, permission: 'accounting:accounts:read' },
	      { label: 'Journal Entries', href: '/accounting/journal-entries', icon: ScrollText, permission: 'accounting:journal-entries:read' },
	      { label: 'Fiscal Years', href: '/accounting/fiscal-years', icon: CalendarRange, permission: 'accounting:fiscal-years:read' },
	      { label: 'Cost Centers', href: '/accounting/cost-centers', icon: Building2, permission: 'accounting:cost-centers:read' },
	      { label: 'Budgets', href: '/accounting/budgets', icon: WalletCards, permission: 'accounting:budgets:read' },
	      { label: 'Bank Reconciliation', href: '/accounting/bank-reconciliation', icon: ShieldCheck, permission: 'accounting:reconciliation:read' },
	      { label: 'Financial Reports', href: '/accounting/reports', icon: BarChart3, permission: 'accounting:reports:read' },
    ],
  },
  {
    label: 'Inventory', icon: Package,
    children: [
	      { label: 'Products', href: '/inventory/products', icon: Package, permission: 'inventory:products:read' },
	      { label: 'Categories', href: '/inventory/categories', icon: Layers, permission: 'inventory:categories:read' },
	      { label: 'Warehouses', href: '/inventory/warehouses', icon: Warehouse, permission: 'inventory:warehouses:read' },
	      { label: 'Stock Entries', href: '/inventory/stock-entries', icon: ClipboardList, permission: 'inventory:stock-entries:read' },
	      { label: 'Stock Movements', href: '/inventory/stock-movements', icon: ArrowLeftRight, permission: 'inventory:stock-movements:read' },
	      { label: 'Pricing', href: '/inventory/pricing', icon: Tags, permission: 'inventory:price-lists:read' },
	      { label: 'Reconciliation', href: '/inventory/reconciliations', icon: ClipboardCheck },
	      { label: 'Transfer Orders', href: '/inventory/transfers', icon: ArrowLeftRight },
	      { label: 'Traceability', href: '/inventory/traceability', icon: Route },
	      { label: 'Inventory Monitoring', href: '/inventory/reports/advanced', icon: BarChart3 },
	      { label: 'Inventory Configuration', href: '/inventory/settings', icon: Settings },
	      { label: 'Stock Balance', href: '/inventory/reports/stock-balance', icon: Boxes, permission: 'inventory:stock-balance:read' },
	      { label: 'Stock Ledger', href: '/inventory/reports/stock-ledger', icon: BookOpen, permission: 'inventory:stock-ledger:read' },
	      { label: 'Projected Stock', href: '/inventory/reports/projected-stock', icon: TrendingUp, permission: 'inventory:projected-stock:read' },
	      { label: 'Reserved Stock', href: '/inventory/reports/reserved-stock', icon: LockKeyhole, permission: 'inventory:stock-balance:read' },
	      { label: 'Warehouse Valuation', href: '/inventory/reports/warehouse-valuation', icon: Calculator, permission: 'inventory:stock-balance:read' },
	      { label: 'Item-wise Sales', href: '/inventory/reports/item-wise-sales', icon: ChartColumnIncreasing, permission: 'inventory:stock-balance:read' },
	      { label: 'Gross Profit', href: '/inventory/reports/gross-profit', icon: CircleDollarSign, permission: 'inventory:stock-balance:read' },
	      { label: 'Slow Moving Stock', href: '/inventory/reports/slow-moving-stock', icon: ArchiveX, permission: 'inventory:stock-balance:read' },
    ],
  },
  {
    label: 'HR', icon: Users,
    children: [
      { label: 'HR Desk', href: '/hr/desk', icon: LayoutDashboard },
      { label: 'My Profile', href: '/hr/my-profile', icon: UserRound },
      { label: 'Employees', href: '/hr/employees', icon: Users, permission: 'hr:employees:read' },
      { label: 'Departments', href: '/hr/departments', icon: Building },
      { label: 'Positions', href: '/hr/positions', icon: BriefcaseBusiness },
      { label: 'Attendance', href: '/hr/attendance', icon: CalendarCheck },
      { label: 'Shifts', href: '/hr/shifts', icon: CalendarCog },
      { label: 'Leave Management', href: '/hr/leave', icon: CalendarX },
      { label: 'Leave Ledger', href: '/hr/leave-ledger', icon: ListChecks },
      { label: 'Lifecycle', href: '/hr/lifecycle', icon: UserCog },
      { label: 'Salary Structures', href: '/hr/salary-structures', icon: BadgeDollarSign },
      { label: 'Payroll Entries', href: '/hr/payroll-entries', icon: HandCoins },
      { label: 'Salary Slips', href: '/hr/salary-slips', icon: Receipt },
      { label: 'Payroll', href: '/hr/payroll', icon: Wallet, permission: 'hr:payroll:read' },
    ],
  },
  {
    label: 'CRM', icon: Handshake,
    children: [
      { label: 'CRM Dashboard', href: '/crm/dashboard', icon: LayoutDashboard, permission: 'crm:dashboard:read' },
      { label: 'Leads', href: '/crm/leads', icon: Target, permission: 'crm:leads:read' },
      { label: 'Customers', href: '/customers', icon: Users, permission: 'customers:customers:read' },
      { label: 'Lead Imports', href: '/crm/imports', icon: Upload, permission: 'crm:imports:read' },
      { label: 'Organizations', href: '/crm/organizations', icon: Building2, permission: 'crm:organizations:read' },
      { label: 'Opportunities', href: '/crm/opportunities', icon: TrendingUp },
      { label: 'Activities', href: '/crm/activities', icon: Activity },
      { label: 'Assignment Rules', href: '/crm/assignment-rules', icon: Route, permission: 'crm:assignment-rules:read' },
      { label: 'CRM Reports', href: '/crm/reports', icon: BarChart3, permission: 'crm:reports:read' },
      { label: 'CRM Configuration', href: '/crm/settings', icon: Settings },
    ],
  },
  {
    label: 'Sales', icon: ShoppingCart,
    children: [
      { label: 'Sales Orders', href: '/sales/orders', icon: ShoppingCart, permission: 'sales:sales-orders:read' },
      { label: 'Quotations', href: '/sales/quotations', icon: FileCheck2, permission: 'sales:quotations:read' },
      { label: 'Sales Enquiries', href: '/sales/enquiries', icon: ClipboardSignature },
      { label: 'Fulfilment', href: '/sales/fulfilment', icon: PackageCheck },
      { label: 'Sales Reports', href: '/sales/reports', icon: BarChart3 },
      { label: 'Sales Configuration', href: '/sales/settings', icon: Settings },
    ],
  },
  {
    label: 'Invoicing', icon: FileText,
    children: [
      { label: 'Sales Invoices', href: '/invoicing/sales-invoices', icon: Receipt, permission: 'invoicing:sales-invoices:read' },
      { label: 'Payments', href: '/invoicing/payments', icon: CreditCard },
      { label: 'Payment Entries', href: '/invoicing/payment-entries', icon: Landmark },
      { label: 'Delivery Notes', href: '/invoicing/delivery-notes', icon: Truck },
      { label: 'Credit Notes', href: '/invoicing/credit-notes', icon: FileMinus },
      { label: 'Tax Templates', href: '/invoicing/tax-templates', icon: Percent },
      { label: 'Ledger', href: '/invoicing/ledger', icon: BookOpen },
      { label: 'Print Formats', href: '/invoicing/print-formats', icon: Printer },
      { label: 'Recurring Invoices', href: '/invoicing/subscriptions', icon: Repeat },
      { label: 'Aging Report', href: '/invoicing/reports/aging', icon: Hourglass },
      { label: 'Outstanding', href: '/invoicing/reports/outstanding', icon: CircleDollarSign },
      { label: 'Revenue by Customer', href: '/invoicing/reports/revenue-by-customer', icon: Users },
      { label: 'Revenue by Item', href: '/invoicing/reports/revenue-by-item', icon: Package },
      { label: 'Revenue by Period', href: '/invoicing/reports/revenue-by-period', icon: CalendarDays },
    ],
  },
  {
    label: 'Procurement', icon: ShoppingBag,
    children: [
      { label: 'Procurement Dashboard', href: '/procurement/dashboard', icon: LayoutDashboard, permission: 'procurement:dashboard:read' },
      { label: 'Material Requests', href: '/procurement/material-requests', icon: ClipboardList, permission: 'procurement:material-requests:read' },
      { label: 'Request for Quotations', href: '/procurement/rfqs', icon: FileText, permission: 'procurement:rfqs:read' },
      { label: 'Supplier Quotations', href: '/procurement/supplier-quotations', icon: Scale, permission: 'procurement:supplier-quotations:read' },
      { label: 'Blanket Purchase Orders', href: '/procurement/blanket-purchase-orders', icon: Landmark, permission: 'procurement:blanket-purchase-orders:read' },
      { label: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ClipboardSignature, permission: 'procurement:purchase-orders:read' },
      { label: 'Purchase Receipts', href: '/procurement/purchase-receipts', icon: PackageCheck, permission: 'procurement:purchase-receipts:read' },
      { label: 'Quality Inspections', href: '/procurement/quality-inspections', icon: FileCheck2, permission: 'procurement:quality-inspections:read' },
      { label: 'Landed Cost Vouchers', href: '/procurement/landed-cost-vouchers', icon: Truck, permission: 'procurement:landed-cost-vouchers:read' },
      { label: 'Purchase Invoices', href: '/procurement/purchase-invoices', icon: Receipt, permission: 'procurement:purchase-invoices:read' },
      { label: 'Supplier Payments', href: '/procurement/supplier-payments', icon: HandCoins, permission: 'procurement:supplier-payments:read' },
      { label: 'Payment Terms', href: '/procurement/payment-terms', icon: Landmark, permission: 'procurement:payment-terms:read' },
      { label: 'Supplier Item Codes', href: '/procurement/supplier-items', icon: Tags, permission: 'procurement:supplier-items:read' },
      { label: 'Communications', href: '/procurement/communications', icon: Activity, permission: 'procurement:communications:read' },
      { label: 'Procurement Tracker', href: '/procurement/tracker', icon: BarChart3, permission: 'procurement:tracker:read' },
      { label: 'Procurement Reports', href: '/procurement/reports', icon: ChartColumnIncreasing, permission: 'procurement:reports:read' },
      { label: 'Buying Settings', href: '/procurement/settings', icon: Settings, permission: 'procurement:settings:read' },
    ],
  },
  {
    label: 'Manufacturing', icon: Settings,
    children: [
      { label: 'Production Dashboard', href: '/manufacturing/dashboard', icon: LayoutDashboard, permission: 'manufacturing:shopfloor:read' },
      { label: 'Bills of Materials', href: '/manufacturing/boms', icon: Network, permission: 'manufacturing:boms:read' },
      { label: 'Routings', href: '/manufacturing/routings', icon: Route, permission: 'manufacturing:routings:read' },
      { label: 'Work Centers', href: '/manufacturing/work-centers', icon: Building2, permission: 'manufacturing:work-centers:read' },
      { label: 'Machines', href: '/manufacturing/machines', icon: Settings, permission: 'manufacturing:machines:read' },
      { label: 'Operations', href: '/manufacturing/operations', icon: ListChecks, permission: 'manufacturing:operations:read' },
      { label: 'Downtime Reasons', href: '/manufacturing/downtime-reasons', icon: Clock, permission: 'manufacturing:downtime-reasons:read' },
      { label: 'Work Orders', href: '/manufacturing/work-orders', icon: ClipboardList, permission: 'manufacturing:work-orders:read' },
      { label: 'Job Cards', href: '/manufacturing/job-cards', icon: ClipboardCheck, permission: 'manufacturing:job-cards:read' },
      { label: 'Shop Floor', href: '/manufacturing/shopfloor', icon: Activity, permission: 'manufacturing:shopfloor:read' },
      { label: 'Manufacturing Reports', href: '/manufacturing/reports', icon: ChartColumnIncreasing, permission: 'manufacturing:reports:read' },
    ],
  },
  {
    label: '3PL Warehouse', icon: Warehouse,
    children: [
      { label: '3PL Clients', href: '/3pl/clients', icon: Users },
      { label: 'Client Inventory', href: '/3pl/inventory', icon: Boxes },
      { label: 'Client Orders', href: '/3pl/orders', icon: ShoppingCart },
      { label: 'Storage Billing', href: '/3pl/billing/storage', icon: Receipt },
      { label: 'Handling Charges', href: '/3pl/billing/handling', icon: HandCoins },
      { label: 'Client Statements', href: '/3pl/statements', icon: FileText },
    ],
  },
  {
    label: 'Returns & Logistics', icon: RefreshCw,
    children: [
      { label: 'Return Authorizations', href: '/returns/authorizations', icon: ClipboardCheck },
      { label: 'Return Receiving', href: '/returns/receiving', icon: PackageCheck },
      { label: 'Return Inspection', href: '/returns/inspection', icon: Archive },
      { label: 'Restocking & RTO', href: '/returns/restocking', icon: Route },
    ],
  },
  {
    label: 'Transport & Shipments', icon: Truck,
    children: [
      { label: 'Shipments', href: '/shipments', icon: Truck },
      { label: 'Carriers', href: '/shipments/carriers', icon: Building2 },
      { label: 'Delivery Tracking', href: '/shipments/tracking', icon: Route },
      { label: 'Proof of Delivery', href: '/shipments/pod', icon: FileCheck2 },
    ],
  },
  {
    label: 'UAE Configuration', icon: Globe,
    children: [
      { label: 'Currency & VAT', href: '/uae-config/currency-vat', icon: CircleDollarSign },
      { label: 'Tax Details', href: '/uae-config/tax-details', icon: Percent },
      { label: 'HS Code Management', href: '/uae-config/hs-codes', icon: Tags },
      { label: 'Commercial Documents', href: '/uae-config/documents', icon: ScrollText },
    ],
  },
  { label: 'Projects', href: '/projects', icon: FolderOpen, permission: 'projects:projects:read' },
  { label: 'Suppliers', href: '/suppliers', icon: Truck, permission: 'suppliers:suppliers:read' },
  {
    label: 'Inventory Control', icon: Boxes,
    children: [
      { label: 'Real-Time Inventory', href: '/wms-inventory-control', icon: Boxes },
      { label: 'Available / Reserved Stock', href: '/wms-inventory-control/stock-availability', icon: LockKeyhole },
      { label: 'Stock Transfer', href: '/wms-inventory-control/stock-transfer', icon: ArrowLeftRight },
      { label: 'Warehouse Transfer', href: '/wms-inventory-control/warehouse-transfer', icon: Warehouse },
      { label: 'Stock Adjustment', href: '/wms-inventory-control/stock-adjustment', icon: SlidersHorizontal },
      { label: 'Cycle Counting', href: '/wms-inventory-control/cycle-counting', icon: ClipboardCheck },
      { label: 'Physical Stock Count', href: '/wms-inventory-control/physical-count', icon: ListChecks },
      { label: 'Stock Reconciliation', href: '/wms-inventory-control/reconciliation', icon: Scale },
      { label: 'Inventory History', href: '/wms-inventory-control/history', icon: History },
      { label: 'Batch / Expiry Tracking', href: '/wms-inventory-control/batch-expiry', icon: Archive },
      { label: 'FEFO / FIFO', href: '/wms-inventory-control/rotation-rules', icon: Repeat },
      { label: 'Damaged Stock', href: '/wms-inventory-control/damaged-stock', icon: ArchiveX },
    ],
  },
  {
    label: 'B2B Orders', icon: Building2,
    children: [
      { label: 'Sales Order Management', href: '/b2b-orders', icon: ShoppingCart },
      { label: 'Customer-Specific SKU', href: '/b2b-orders/customer-sku', icon: Tags },
      { label: 'Customer Pricing', href: '/b2b-orders/customer-pricing', icon: CircleDollarSign },
      { label: 'Order Allocation', href: '/b2b-orders/allocation', icon: PackageCheck },
      { label: 'Partial Fulfillment', href: '/b2b-orders/partial-fulfillment', icon: ClipboardList },
      { label: 'Backorders', href: '/b2b-orders/backorders', icon: Hourglass },
      { label: 'ASN for Customers', href: '/b2b-orders/asn', icon: FileCheck2 },
      { label: 'B2B Picking', href: '/b2b-orders/picking', icon: ClipboardCheck },
      { label: 'Pallet & Carton Handling', href: '/b2b-orders/pallet-carton', icon: Boxes },
      { label: 'Delivery Scheduling', href: '/b2b-orders/delivery-scheduling', icon: CalendarCheck },
      { label: 'Proof of Delivery', href: '/b2b-orders/proof-of-delivery', icon: ClipboardSignature },
    ],
  },
  {
    label: 'B2C Fulfillment', icon: ShoppingBag,
    children: [
      { label: 'B2C Order Management', href: '/b2c-fulfillment', icon: ShoppingBag },
      { label: 'E-Commerce Order Import', href: '/b2c-fulfillment/order-import', icon: Upload },
      { label: 'Order Sync', href: '/b2c-fulfillment/order-sync', icon: Repeat },
      { label: 'Order Allocation', href: '/b2c-fulfillment/allocation', icon: PackageCheck },
      { label: 'Wave Picking', href: '/b2c-fulfillment/wave-picking', icon: Layers },
      { label: 'Batch Picking', href: '/b2c-fulfillment/batch-picking', icon: Boxes },
      { label: 'Single-Order Picking', href: '/b2c-fulfillment/single-order-picking', icon: ClipboardCheck },
      { label: 'Packing Workflow', href: '/b2c-fulfillment/packing', icon: PackageCheck },
      { label: 'Shipping Labels', href: '/b2c-fulfillment/shipping-labels', icon: Printer },
      { label: 'Tracking Management', href: '/b2c-fulfillment/tracking', icon: Route },
      { label: 'COD Support', href: '/b2c-fulfillment/cod', icon: Wallet },
      { label: 'RTO Management', href: '/b2c-fulfillment/rto', icon: RotateCcw },
      { label: 'Customer Returns', href: '/b2c-fulfillment/returns', icon: Repeat },
    ],
  },
  {
    label: 'Picking & Dispatch', icon: ClipboardCheck,
    children: [
      { label: 'Picking Task Creation', href: '/warehouse-fulfillment', icon: ClipboardList },
      { label: 'Wave Planning', href: '/warehouse-fulfillment/wave-planning', icon: Layers },
      { label: 'Zone Picking', href: '/warehouse-fulfillment/zone-picking', icon: Warehouse },
      { label: 'Batch Picking', href: '/warehouse-fulfillment/batch-picking', icon: Boxes },
      { label: 'Pick Confirmation', href: '/warehouse-fulfillment/pick-confirmation', icon: CheckCircle2 },
      { label: 'Pick Exceptions', href: '/warehouse-fulfillment/pick-exceptions', icon: AlertTriangle },
      { label: 'Packing Station', href: '/warehouse-fulfillment/packing-station', icon: PackageCheck },
      { label: 'Packing Verification', href: '/warehouse-fulfillment/packing-verification', icon: ClipboardCheck },
      { label: 'Box / Carton Selection', href: '/warehouse-fulfillment/box-selection', icon: Package },
      { label: 'Shipment Consolidation', href: '/warehouse-fulfillment/shipment-consolidation', icon: Truck },
      { label: 'Dispatch Verification', href: '/warehouse-fulfillment/dispatch-verification', icon: ShieldCheck },
      { label: 'Dispatch Documentation', href: '/warehouse-fulfillment/dispatch-documentation', icon: FileText },
    ],
  },
  {
    label: 'Settings', icon: Settings,
    children: [
      { label: 'General Settings', href: '/settings', icon: SlidersHorizontal },
      { label: 'Access Control', href: '/settings/access', icon: KeyRound, permission: 'access:users:read' },
    ],
  },
];

export function inferredPermission(href?: string) {
    if (!href) return undefined;
    const parts = href.split('/').filter(Boolean);
    if (href === '/dashboard') return 'dashboard:dashboard:read';
    if (parts[0] === 'settings') return parts[1] === 'access' ? 'access:users:read' : 'company:company:read';
    if (parts[0] === 'audit-trail') return 'access:audit:read';
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
