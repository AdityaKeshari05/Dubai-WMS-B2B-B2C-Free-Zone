import {
  LayoutDashboard,
  BookOpen,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  FileText,
  ShoppingBag,
  FolderOpen,
  Building2,
  Truck,
  Settings,
  Clock,
  ShieldCheck,
  BriefcaseBusiness,
  ClipboardList,
  Tags,
  Receipt,
  CreditCard,
  Landmark,
  FileMinus,
  Percent,
  Printer,
  Repeat,
  ClipboardCheck,
  Hourglass,
  CircleDollarSign,
  CalendarDays,
  ScrollText,
  CalendarRange,
  Network,
  WalletCards,
  BarChart3,
  Warehouse,
  Boxes,
  ArrowLeftRight,
  Layers,
  Archive,
  LockKeyhole,
  Calculator,
  ChartColumnIncreasing,
  ArchiveX,
  UserRound,
  Building,
  Target,
  Activity,
  Route,
  Upload,
  FileCheck2,
  ClipboardSignature,
  CalendarCheck,
  CalendarCog,
  CalendarX,
  ListChecks,
  HandCoins,
  BadgeDollarSign,
  Wallet,
  UserCog,
  SlidersHorizontal,
  KeyRound,
  Handshake,
  Scale,
  PackageCheck,
  History,
  ScanLine,
  Bell,
  Plug,
  Database,
  RotateCcw,
  Settings2,
  FileClock,
  Send,
  Store,
  RefreshCw,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  permission?: string;
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard:dashboard:read',
  },

  {
    label: 'Audit Trail',
    href: '/audit-trail',
    icon: History,
    permission: 'access:audit:read',
  },

  // =========================================================
  // ACCOUNTING
  // =========================================================
  {
    label: 'Accounting',
    icon: Landmark,
    children: [
      {
        label: 'Chart of Accounts',
        href: '/accounting/accounts',
        icon: Network,
        permission: 'accounting:accounts:read',
      },
      {
        label: 'Journal Entries',
        href: '/accounting/journal-entries',
        icon: ScrollText,
        permission: 'accounting:journal-entries:read',
      },
      {
        label: 'Fiscal Years',
        href: '/accounting/fiscal-years',
        icon: CalendarRange,
        permission: 'accounting:fiscal-years:read',
      },
      {
        label: 'Cost Centers',
        href: '/accounting/cost-centers',
        icon: Building2,
        permission: 'accounting:cost-centers:read',
      },
      {
        label: 'Budgets',
        href: '/accounting/budgets',
        icon: WalletCards,
        permission: 'accounting:budgets:read',
      },
      {
        label: 'Bank Reconciliation',
        href: '/accounting/bank-reconciliation',
        icon: ShieldCheck,
        permission: 'accounting:reconciliation:read',
      },
      {
        label: 'Financial Reports',
        href: '/accounting/reports',
        icon: BarChart3,
        permission: 'accounting:reports:read',
      },
    ],
  },

  // =========================================================
  // INVENTORY
  // =========================================================
  {
    label: 'Inventory',
    icon: Package,
    children: [
      {
        label: 'Products',
        href: '/inventory/products',
        icon: Package,
        permission: 'inventory:products:read',
      },
      {
        label: 'Categories',
        href: '/inventory/categories',
        icon: Layers,
        permission: 'inventory:categories:read',
      },
      {
        label: 'Warehouses',
        href: '/inventory/warehouses',
        icon: Warehouse,
        permission: 'inventory:warehouses:read',
      },
      {
        label: 'Stock Entries',
        href: '/inventory/stock-entries',
        icon: ClipboardList,
        permission: 'inventory:stock-entries:read',
      },
      {
        label: 'Stock Movements',
        href: '/inventory/stock-movements',
        icon: ArrowLeftRight,
        permission: 'inventory:stock-movements:read',
      },
      {
        label: 'Pricing',
        href: '/inventory/pricing',
        icon: Tags,
        permission: 'inventory:price-lists:read',
      },
      {
        label: 'Reconciliation',
        href: '/inventory/reconciliations',
        icon: ClipboardCheck,
      },
      {
        label: 'Transfer Orders',
        href: '/inventory/transfers',
        icon: ArrowLeftRight,
      },
      {
        label: 'Traceability',
        href: '/inventory/traceability',
        icon: Route,
      },
      {
        label: 'Inventory Monitoring',
        href: '/inventory/reports/advanced',
        icon: BarChart3,
      },
      {
        label: 'Inventory Configuration',
        href: '/inventory/settings',
        icon: Settings,
      },
      {
        label: 'Stock Balance',
        href: '/inventory/reports/stock-balance',
        icon: Boxes,
        permission: 'inventory:stock-balance:read',
      },
      {
        label: 'Stock Ledger',
        href: '/inventory/reports/stock-ledger',
        icon: BookOpen,
        permission: 'inventory:stock-ledger:read',
      },
      {
        label: 'Projected Stock',
        href: '/inventory/reports/projected-stock',
        icon: TrendingUp,
        permission: 'inventory:projected-stock:read',
      },
      {
        label: 'Reserved Stock',
        href: '/inventory/reports/reserved-stock',
        icon: LockKeyhole,
        permission: 'inventory:stock-balance:read',
      },
      {
        label: 'Warehouse Valuation',
        href: '/inventory/reports/warehouse-valuation',
        icon: Calculator,
        permission: 'inventory:stock-balance:read',
      },
      {
        label: 'Item-wise Sales',
        href: '/inventory/reports/item-wise-sales',
        icon: ChartColumnIncreasing,
        permission: 'inventory:stock-balance:read',
      },
      {
        label: 'Gross Profit',
        href: '/inventory/reports/gross-profit',
        icon: CircleDollarSign,
        permission: 'inventory:stock-balance:read',
      },
      {
        label: 'Slow Moving Stock',
        href: '/inventory/reports/slow-moving-stock',
        icon: ArchiveX,
        permission: 'inventory:stock-balance:read',
      },
    ],
  },

  // =========================================================
  // HR
  // =========================================================
  {
    label: 'HR',
    icon: Users,
    children: [
      {
        label: 'HR Desk',
        href: '/hr/desk',
        icon: LayoutDashboard,
      },
      {
        label: 'My Profile',
        href: '/hr/my-profile',
        icon: UserRound,
      },
      {
        label: 'Employees',
        href: '/hr/employees',
        icon: Users,
        permission: 'hr:employees:read',
      },
      {
        label: 'Departments',
        href: '/hr/departments',
        icon: Building,
      },
      {
        label: 'Positions',
        href: '/hr/positions',
        icon: BriefcaseBusiness,
      },
      {
        label: 'Attendance',
        href: '/hr/attendance',
        icon: CalendarCheck,
      },
      {
        label: 'Shifts',
        href: '/hr/shifts',
        icon: CalendarCog,
      },
      {
        label: 'Leave Management',
        href: '/hr/leave',
        icon: CalendarX,
      },
      {
        label: 'Leave Ledger',
        href: '/hr/leave-ledger',
        icon: ListChecks,
      },
      {
        label: 'Lifecycle',
        href: '/hr/lifecycle',
        icon: UserCog,
      },
      {
        label: 'Salary Structures',
        href: '/hr/salary-structures',
        icon: BadgeDollarSign,
      },
      {
        label: 'Payroll Entries',
        href: '/hr/payroll-entries',
        icon: HandCoins,
      },
      {
        label: 'Salary Slips',
        href: '/hr/salary-slips',
        icon: Receipt,
      },
      {
        label: 'Payroll',
        href: '/hr/payroll',
        icon: Wallet,
        permission: 'hr:payroll:read',
      },
    ],
  },

  // =========================================================
  // CRM
  // =========================================================
  {
    label: 'CRM',
    icon: Handshake,
    children: [
      {
        label: 'CRM Dashboard',
        href: '/crm/dashboard',
        icon: LayoutDashboard,
        permission: 'crm:dashboard:read',
      },
      {
        label: 'Leads',
        href: '/crm/leads',
        icon: Target,
        permission: 'crm:leads:read',
      },
      {
        label: 'Customers',
        href: '/customers',
        icon: Users,
        permission: 'customers:customers:read',
      },
      {
        label: 'Lead Imports',
        href: '/crm/imports',
        icon: Upload,
        permission: 'crm:imports:read',
      },
      {
        label: 'Organizations',
        href: '/crm/organizations',
        icon: Building2,
        permission: 'crm:organizations:read',
      },
      {
        label: 'Opportunities',
        href: '/crm/opportunities',
        icon: TrendingUp,
      },
      {
        label: 'Activities',
        href: '/crm/activities',
        icon: Activity,
      },
      {
        label: 'Assignment Rules',
        href: '/crm/assignment-rules',
        icon: Route,
        permission: 'crm:assignment-rules:read',
      },
      {
        label: 'CRM Reports',
        href: '/crm/reports',
        icon: BarChart3,
        permission: 'crm:reports:read',
      },
      {
        label: 'CRM Configuration',
        href: '/crm/settings',
        icon: Settings,
      },
    ],
  },

  // =========================================================
  // SALES
  // =========================================================
  {
    label: 'Sales',
    icon: ShoppingCart,
    children: [
      {
        label: 'Sales Orders',
        href: '/sales/orders',
        icon: ShoppingCart,
        permission: 'sales:sales-orders:read',
      },
      {
        label: 'Quotations',
        href: '/sales/quotations',
        icon: FileCheck2,
        permission: 'sales:quotations:read',
      },
      {
        label: 'Sales Enquiries',
        href: '/sales/enquiries',
        icon: ClipboardSignature,
      },
      {
        label: 'Fulfilment',
        href: '/sales/fulfilment',
        icon: PackageCheck,
      },
      {
        label: 'Sales Reports',
        href: '/sales/reports',
        icon: BarChart3,
      },
      {
        label: 'Sales Configuration',
        href: '/sales/settings',
        icon: Settings,
      },
    ],
  },

  // =========================================================
  // INVOICING
  // =========================================================
  {
    label: 'Invoicing',
    icon: FileText,
    children: [
      {
        label: 'Sales Invoices',
        href: '/invoicing/sales-invoices',
        icon: Receipt,
        permission: 'invoicing:sales-invoices:read',
      },
      {
        label: 'Payments',
        href: '/invoicing/payments',
        icon: CreditCard,
      },
      {
        label: 'Payment Entries',
        href: '/invoicing/payment-entries',
        icon: Landmark,
      },
      {
        label: 'Delivery Notes',
        href: '/invoicing/delivery-notes',
        icon: Truck,
      },
      {
        label: 'Credit Notes',
        href: '/invoicing/credit-notes',
        icon: FileMinus,
      },
      {
        label: 'Tax Templates',
        href: '/invoicing/tax-templates',
        icon: Percent,
      },
      {
        label: 'Ledger',
        href: '/invoicing/ledger',
        icon: BookOpen,
      },
      {
        label: 'Print Formats',
        href: '/invoicing/print-formats',
        icon: Printer,
      },
      {
        label: 'Recurring Invoices',
        href: '/invoicing/subscriptions',
        icon: Repeat,
      },
      {
        label: 'Aging Report',
        href: '/invoicing/reports/aging',
        icon: Hourglass,
      },
      {
        label: 'Outstanding',
        href: '/invoicing/reports/outstanding',
        icon: CircleDollarSign,
      },
      {
        label: 'Revenue by Customer',
        href: '/invoicing/reports/revenue-by-customer',
        icon: Users,
      },
      {
        label: 'Revenue by Item',
        href: '/invoicing/reports/revenue-by-item',
        icon: Package,
      },
      {
        label: 'Revenue by Period',
        href: '/invoicing/reports/revenue-by-period',
        icon: CalendarDays,
      },
    ],
  },

  // =========================================================
  // PROCUREMENT
  // =========================================================
  {
    label: 'Procurement',
    icon: ShoppingBag,
    children: [
      {
        label: 'Procurement Dashboard',
        href: '/procurement/dashboard',
        icon: LayoutDashboard,
        permission: 'procurement:dashboard:read',
      },
      {
        label: 'Material Requests',
        href: '/procurement/material-requests',
        icon: ClipboardList,
        permission: 'procurement:material-requests:read',
      },
      {
        label: 'Request for Quotations',
        href: '/procurement/rfqs',
        icon: FileText,
        permission: 'procurement:rfqs:read',
      },
      {
        label: 'Supplier Quotations',
        href: '/procurement/supplier-quotations',
        icon: Scale,
        permission: 'procurement:supplier-quotations:read',
      },
      {
        label: 'Blanket Purchase Orders',
        href: '/procurement/blanket-purchase-orders',
        icon: Landmark,
        permission: 'procurement:blanket-purchase-orders:read',
      },
      {
        label: 'Purchase Orders',
        href: '/procurement/purchase-orders',
        icon: ClipboardSignature,
        permission: 'procurement:purchase-orders:read',
      },
      {
        label: 'Purchase Receipts',
        href: '/procurement/purchase-receipts',
        icon: PackageCheck,
        permission: 'procurement:purchase-receipts:read',
      },
      {
        label: 'Quality Inspections',
        href: '/procurement/quality-inspections',
        icon: FileCheck2,
        permission: 'procurement:quality-inspections:read',
      },
      {
        label: 'Landed Cost Vouchers',
        href: '/procurement/landed-cost-vouchers',
        icon: Truck,
        permission: 'procurement:landed-cost-vouchers:read',
      },
      {
        label: 'Purchase Invoices',
        href: '/procurement/purchase-invoices',
        icon: Receipt,
        permission: 'procurement:purchase-invoices:read',
      },
      {
        label: 'Supplier Payments',
        href: '/procurement/supplier-payments',
        icon: HandCoins,
        permission: 'procurement:supplier-payments:read',
      },
      {
        label: 'Payment Terms',
        href: '/procurement/payment-terms',
        icon: Landmark,
        permission: 'procurement:payment-terms:read',
      },
      {
        label: 'Supplier Item Codes',
        href: '/procurement/supplier-items',
        icon: Tags,
        permission: 'procurement:supplier-items:read',
      },
      {
        label: 'Communications',
        href: '/procurement/communications',
        icon: Activity,
        permission: 'procurement:communications:read',
      },
      {
        label: 'Procurement Tracker',
        href: '/procurement/tracker',
        icon: BarChart3,
        permission: 'procurement:tracker:read',
      },
      {
        label: 'Procurement Reports',
        href: '/procurement/reports',
        icon: ChartColumnIncreasing,
        permission: 'procurement:reports:read',
      },
      {
        label: 'Buying Settings',
        href: '/procurement/settings',
        icon: Settings,
        permission: 'procurement:settings:read',
      },
    ],
  },

  // =========================================================
  // MANUFACTURING
  // =========================================================
  {
    label: 'Manufacturing',
    icon: Settings,
    children: [
      {
        label: 'Production Dashboard',
        href: '/manufacturing/dashboard',
        icon: LayoutDashboard,
        permission: 'manufacturing:shopfloor:read',
      },
      {
        label: 'Bills of Materials',
        href: '/manufacturing/boms',
        icon: Network,
        permission: 'manufacturing:boms:read',
      },
      {
        label: 'Routings',
        href: '/manufacturing/routings',
        icon: Route,
        permission: 'manufacturing:routings:read',
      },
      {
        label: 'Work Centers',
        href: '/manufacturing/work-centers',
        icon: Building2,
        permission: 'manufacturing:work-centers:read',
      },
      {
        label: 'Machines',
        href: '/manufacturing/machines',
        icon: Settings,
        permission: 'manufacturing:machines:read',
      },
      {
        label: 'Operations',
        href: '/manufacturing/operations',
        icon: ListChecks,
        permission: 'manufacturing:operations:read',
      },
      {
        label: 'Downtime Reasons',
        href: '/manufacturing/downtime-reasons',
        icon: Clock,
        permission: 'manufacturing:downtime-reasons:read',
      },
      {
        label: 'Work Orders',
        href: '/manufacturing/work-orders',
        icon: ClipboardList,
        permission: 'manufacturing:work-orders:read',
      },
      {
        label: 'Job Cards',
        href: '/manufacturing/job-cards',
        icon: ClipboardCheck,
        permission: 'manufacturing:job-cards:read',
      },
      {
        label: 'Shop Floor',
        href: '/manufacturing/shopfloor',
        icon: Activity,
        permission: 'manufacturing:shopfloor:read',
      },
      {
        label: 'Manufacturing Reports',
        href: '/manufacturing/reports',
        icon: ChartColumnIncreasing,
        permission: 'manufacturing:reports:read',
      },
    ],
  },

  // =========================================================
  // M10 - 3PL / MULTI-CLIENT WAREHOUSE
  // =========================================================
  {
    label: '3PL Warehouse',
    icon: Warehouse,
    children: [
      {
        label: '3PL Clients',
        href: '/3pl/clients',
        icon: Users,
      },
      {
        label: 'Client Inventory',
        href: '/3pl/inventory',
        icon: Boxes,
      },
      {
        label: 'Client Orders',
        href: '/3pl/orders',
        icon: ShoppingCart,
      },
      {
        label: 'Storage Billing',
        href: '/3pl/billing/storage',
        icon: Receipt,
      },
      {
        label: 'Handling Charges',
        href: '/3pl/billing/handling',
        icon: HandCoins,
      },
      {
        label: 'Client Statements',
        href: '/3pl/statements',
        icon: FileText,
      },
    ],
  },

  // =========================================================
  // M11 - RETURNS & REVERSE LOGISTICS
  // =========================================================
  {
    label: 'Returns & Logistics',
    icon: RefreshCw,
    children: [
      {
        label: 'Return Authorizations',
        href: '/returns/authorizations',
        icon: ClipboardCheck,
      },
      {
        label: 'Return Receiving',
        href: '/returns/receiving',
        icon: PackageCheck,
      },
      {
        label: 'Return Inspection',
        href: '/returns/inspection',
        icon: Archive,
      },
      {
        label: 'Restocking & RTO',
        href: '/returns/restocking',
        icon: Route,
      },
    ],
  },

  // =========================================================
  // M12 - TRANSPORT & SHIPMENT MANAGEMENT
  // =========================================================
  {
    label: 'Transport & Shipments',
    icon: Truck,
    children: [
      {
        label: 'Shipments',
        href: '/shipments',
        icon: Truck,
      },
      {
        label: 'Carriers',
        href: '/shipments/carriers',
        icon: Building2,
      },
      {
        label: 'Delivery Tracking',
        href: '/shipments/tracking',
        icon: Route,
      },
      {
        label: 'Proof of Delivery',
        href: '/shipments/pod',
        icon: FileCheck2,
      },
    ],
  },

  // =========================================================
  // M13 - UAE / COMMERCIAL CONFIGURATION
  // =========================================================
  {
    label: 'UAE Configuration',
    icon: Globe,
    children: [
      {
        label: 'Currency & VAT',
        href: '/uae-config/currency-vat',
        icon: CircleDollarSign,
      },
      {
        label: 'Tax Details',
        href: '/uae-config/tax-details',
        icon: Percent,
      },
      {
        label: 'HS Code Management',
        href: '/uae-config/hs-codes',
        icon: Tags,
      },
      {
        label: 'Commercial Documents',
        href: '/uae-config/documents',
        icon: ScrollText,
      },
    ],
  },

  {
    label: 'Free Zone',
    icon: ShieldCheck,
    children: [
      { label: 'FZ Dashboard', href: '/free-zone/dashboard', icon: LayoutDashboard },
      { label: 'Warehouse Configuration', href: '/free-zone/warehouse-config', icon: Warehouse },
      { label: 'Bonded / Customs Stock', href: '/free-zone/bonded-stock', icon: LockKeyhole },
      { label: 'Customs Inventory Tracking', href: '/free-zone/inventory-tracking', icon: ScanLine },
      { label: 'Customs Reference Management', href: '/free-zone/customs-references', icon: FileCheck2 },
      { label: 'Duty Status Tracking', href: '/free-zone/duty-status', icon: Percent },
      { label: 'FZ Inbound', href: '/free-zone/inbound', icon: PackageCheck },
      { label: 'FZ Outbound', href: '/free-zone/outbound', icon: Truck },
      { label: 'FZ → FZ Transfer', href: '/free-zone/fz-transfer', icon: ArrowLeftRight },
      { label: 'FZ → Mainland', href: '/free-zone/mainland-workflow', icon: Route },
      { label: 'Re-Export', href: '/free-zone/re-export', icon: Globe },
      { label: 'Document Repository', href: '/free-zone/documents', icon: FileText },
      { label: 'Customs Reconciliation', href: '/free-zone/reconciliation', icon: RefreshCw },
      { label: 'FZ Audit Trail', href: '/free-zone/audit-trail', icon: History },
      { label: 'Duty/Tax Classification', href: '/free-zone/duty-classification', icon: BadgeDollarSign },
    ],
  },

  {
    label: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    permission: 'projects:projects:read',
  },

  {
    label: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    permission: 'suppliers:suppliers:read',
  },
    // =========================================================
  // M05 - INVENTORY CONTROL
  // =========================================================
  {
    label: 'Inventory Control',
    icon: Boxes,
    children: [
      {
        label: 'Real-Time Inventory',
        href: '/wms-inventory-control',
        icon: Boxes,
      },
      {
        label: 'Available / Reserved Stock',
        href: '/wms-inventory-control/stock-availability',
        icon: LockKeyhole,
      },
      {
        label: 'Stock Transfer',
        href: '/wms-inventory-control/stock-transfer',
        icon: ArrowLeftRight,
      },
      {
        label: 'Warehouse Transfer',
        href: '/wms-inventory-control/warehouse-transfer',
        icon: Warehouse,
      },
      {
        label: 'Stock Adjustment',
        href: '/wms-inventory-control/stock-adjustment',
        icon: SlidersHorizontal,
      },
      {
        label: 'Cycle Counting',
        href: '/wms-inventory-control/cycle-counting',
        icon: ClipboardCheck,
      },
      {
        label: 'Physical Stock Count',
        href: '/wms-inventory-control/physical-count',
        icon: ListChecks,
      },
      {
        label: 'Stock Reconciliation',
        href: '/wms-inventory-control/reconciliation',
        icon: Scale,
      },
      {
        label: 'Inventory History',
        href: '/wms-inventory-control/history',
        icon: History,
      },
      {
        label: 'Batch / Expiry Tracking',
        href: '/wms-inventory-control/batch-expiry',
        icon: Archive,
      },
      {
        label: 'FEFO / FIFO',
        href: '/wms-inventory-control/rotation-rules',
        icon: Repeat,
      },
      {
        label: 'Damaged Stock',
        href: '/wms-inventory-control/damaged-stock',
        icon: ArchiveX,
      },
    ],
  },

  // =========================================================
  // M06 - B2B ORDER MANAGEMENT
  // =========================================================
  {
    label: 'B2B Orders',
    icon: Building2,
    children: [
      {
        label: 'Sales Order Management',
        href: '/b2b-orders',
        icon: ShoppingCart,
      },
      {
        label: 'Customer-Specific SKU',
        href: '/b2b-orders/customer-sku',
        icon: Tags,
      },
      {
        label: 'Customer Pricing',
        href: '/b2b-orders/customer-pricing',
        icon: CircleDollarSign,
      },
      {
        label: 'Order Allocation',
        href: '/b2b-orders/allocation',
        icon: PackageCheck,
      },
      {
        label: 'Partial Fulfillment',
        href: '/b2b-orders/partial-fulfillment',
        icon: ClipboardList,
      },
      {
        label: 'Backorders',
        href: '/b2b-orders/backorders',
        icon: Hourglass,
      },
      {
        label: 'ASN for Customers',
        href: '/b2b-orders/asn',
        icon: FileCheck2,
      },
      {
        label: 'B2B Picking',
        href: '/b2b-orders/picking',
        icon: ClipboardCheck,
      },
      {
        label: 'Pallet & Carton Handling',
        href: '/b2b-orders/pallet-carton',
        icon: Boxes,
      },
      {
        label: 'Delivery Scheduling',
        href: '/b2b-orders/delivery-scheduling',
        icon: CalendarCheck,
      },
      {
        label: 'Proof of Delivery',
        href: '/b2b-orders/proof-of-delivery',
        icon: ClipboardSignature,
      },
    ],
  },

  // =========================================================
  // M07 - B2C / E-COMMERCE FULFILLMENT
  // =========================================================
  {
    label: 'B2C Fulfillment',
    icon: ShoppingBag,
    children: [
      {
        label: 'B2C Order Management',
        href: '/b2c-fulfillment',
        icon: ShoppingBag,
      },
      {
        label: 'E-Commerce Order Import',
        href: '/b2c-fulfillment/order-import',
        icon: Upload,
      },
      {
        label: 'Order Sync',
        href: '/b2c-fulfillment/order-sync',
        icon: Repeat,
      },
      {
        label: 'Order Allocation',
        href: '/b2c-fulfillment/allocation',
        icon: PackageCheck,
      },
      {
        label: 'Wave Picking',
        href: '/b2c-fulfillment/wave-picking',
        icon: Layers,
      },
      {
        label: 'Batch Picking',
        href: '/b2c-fulfillment/batch-picking',
        icon: Boxes,
      },
      {
        label: 'Single-Order Picking',
        href: '/b2c-fulfillment/single-order-picking',
        icon: ClipboardCheck,
      },
      {
        label: 'Packing Workflow',
        href: '/b2c-fulfillment/packing',
        icon: PackageCheck,
      },
      {
        label: 'Shipping Labels',
        href: '/b2c-fulfillment/shipping-labels',
        icon: Printer,
      },
      {
        label: 'Tracking Management',
        href: '/b2c-fulfillment/tracking',
        icon: Route,
      },
      {
        label: 'COD Support',
        href: '/b2c-fulfillment/cod',
        icon: Wallet,
      },
      {
        label: 'RTO Management',
        href: '/b2c-fulfillment/rto',
        icon: RotateCcw,
      },
      {
        label: 'Customer Returns',
        href: '/b2c-fulfillment/returns',
        icon: Repeat,
      },
    ],
  },

  // =========================================================
  // M08 - PICKING, PACKING & DISPATCH
  // =========================================================
  {
    label: 'Picking & Dispatch',
    icon: ClipboardCheck,
    children: [
      {
        label: 'Picking Task Creation',
        href: '/warehouse-fulfillment',
        icon: ClipboardList,
      },
      {
        label: 'Wave Planning',
        href: '/warehouse-fulfillment/wave-planning',
        icon: Layers,
      },
      {
        label: 'Zone Picking',
        href: '/warehouse-fulfillment/zone-picking',
        icon: Warehouse,
      },
      {
        label: 'Batch Picking',
        href: '/warehouse-fulfillment/batch-picking',
        icon: Boxes,
      },
      {
        label: 'Pick Confirmation',
        href: '/warehouse-fulfillment/pick-confirmation',
        icon: CheckCircle2,
      },
      {
        label: 'Pick Exceptions',
        href: '/warehouse-fulfillment/pick-exceptions',
        icon: AlertTriangle,
      },
      {
        label: 'Packing Station',
        href: '/warehouse-fulfillment/packing-station',
        icon: PackageCheck,
      },
      {
        label: 'Packing Verification',
        href: '/warehouse-fulfillment/packing-verification',
        icon: ClipboardCheck,
      },
      {
        label: 'Box / Carton Selection',
        href: '/warehouse-fulfillment/box-selection',
        icon: Package,
      },
      {
        label: 'Shipment Consolidation',
        href: '/warehouse-fulfillment/shipment-consolidation',
        icon: Truck,
      },
      {
        label: 'Dispatch Verification',
        href: '/warehouse-fulfillment/dispatch-verification',
        icon: ShieldCheck,
      },
      {
        label: 'Dispatch Documentation',
        href: '/warehouse-fulfillment/dispatch-documentation',
        icon: FileText,
      },
    ],
  },
  // =========================================================
  // M14 - MOBILE WAREHOUSE OPERATIONS
  // =========================================================
  {
    label: 'Mobile Operations',
    icon: Warehouse,
    children: [
      {
        label: 'Operations Home',
        href: '/mobile-operations',
        icon: LayoutDashboard,
      },
      {
        label: 'Receiving',
        href: '/mobile-operations/receiving',
        icon: PackageCheck,
      },
      {
        label: 'Putaway',
        href: '/mobile-operations/putaway',
        icon: Archive,
      },
      {
        label: 'Picking',
        href: '/mobile-operations/picking',
        icon: ClipboardCheck,
      },
      {
        label: 'Stock Transfer',
        href: '/mobile-operations/stock-transfer',
        icon: ArrowLeftRight,
      },
      {
        label: 'Cycle Count',
        href: '/mobile-operations/cycle-count',
        icon: ListChecks,
      },
      {
        label: 'Dispatch',
        href: '/mobile-operations/dispatch',
        icon: Send,
      },
      {
        label: 'Barcode Scanner',
        href: '/mobile-operations/scanner',
        icon: ScanLine,
      },
    ],
  },

  // =========================================================
  // M15 - DASHBOARD, REPORTS & ANALYTICS
  // =========================================================
  {
    label: 'WMS Analytics',
    icon: BarChart3,
    children: [
      {
        label: 'WMS Dashboard',
        href: '/wms-analytics',
        icon: LayoutDashboard,
      },
      {
        label: 'Inventory Dashboard',
        href: '/wms-analytics/inventory',
        icon: Boxes,
      },
      {
        label: 'Inbound Dashboard',
        href: '/wms-analytics/inbound',
        icon: PackageCheck,
      },
      {
        label: 'Outbound Dashboard',
        href: '/wms-analytics/outbound',
        icon: Truck,
      },
      {
        label: 'B2B Dashboard',
        href: '/wms-analytics/b2b',
        icon: Building2,
      },
      {
        label: 'B2C Dashboard',
        href: '/wms-analytics/b2c',
        icon: ShoppingBag,
      },
      {
        label: 'Free Zone Dashboard',
        href: '/wms-analytics/free-zone',
        icon: Warehouse,
      },
      {
        label: 'Reports',
        href: '/wms-analytics/reports',
        icon: FileText,
      },
    ],
  },

  // =========================================================
  // M16 - INTEGRATIONS & API
  // =========================================================
  {
    label: 'Integrations',
    icon: Plug,
    children: [
      {
        label: 'Overview',
        href: '/integrations',
        icon: LayoutDashboard,
      },
      {
        label: 'REST API',
        href: '/integrations/rest-api',
        icon: Network,
      },
      {
        label: 'E-Commerce',
        href: '/integrations/ecommerce',
        icon: ShoppingCart,
      },
      {
        label: 'Marketplace',
        href: '/integrations/marketplace',
        icon: Store,
      },
      {
        label: 'ERP',
        href: '/integrations/erp',
        icon: Building2,
      },
      {
        label: 'Accounting',
        href: '/integrations/accounting',
        icon: Landmark,
      },
      {
        label: 'Courier',
        href: '/integrations/courier',
        icon: Truck,
      },
      {
        label: 'Webhooks',
        href: '/integrations/webhooks',
        icon: Network,
      },
      {
        label: 'Excel / CSV Import',
        href: '/integrations/imports',
        icon: Upload,
      },
      {
        label: 'API Logs',
        href: '/integrations/api-logs',
        icon: ScrollText,
      },
    ],
  },

  // =========================================================
  // M17 - NOTIFICATIONS & ALERTS
  // =========================================================
  {
    label: 'Notifications',
    icon: Bell,
    children: [
      {
        label: 'Notification Center',
        href: '/notifications',
        icon: Bell,
      },
      {
        label: 'Low Stock Alerts',
        href: '/notifications/low-stock',
        icon: ArchiveX,
      },
      {
        label: 'Order Alerts',
        href: '/notifications/orders',
        icon: ShoppingCart,
      },
      {
        label: 'Receiving Alerts',
        href: '/notifications/receiving',
        icon: PackageCheck,
      },
      {
        label: 'Picking Exceptions',
        href: '/notifications/picking-exceptions',
        icon: ClipboardCheck,
      },
      {
        label: 'Inventory Discrepancies',
        href: '/notifications/inventory-discrepancies',
        icon: Boxes,
      },
      {
        label: 'Shipment Alerts',
        href: '/notifications/shipments',
        icon: Truck,
      },
      {
        label: 'Notification Settings',
        href: '/notifications/settings',
        icon: Settings2,
      },
    ],
  },

  // =========================================================
  // M18 - AUDIT, SECURITY & SYSTEM CONFIGURATION
  // Audit Trail already exists at /audit-trail
  // =========================================================
  {
    label: 'System Configuration',
    icon: Settings2,
    children: [
      {
        label: 'Transaction History',
        href: '/system/transaction-history',
        icon: FileClock,
      },
      {
        label: 'Approval Controls',
        href: '/system/approvals',
        icon: ShieldCheck,
      },
      {
        label: 'Data Backup',
        href: '/system/backup',
        icon: Database,
      },
      {
        label: 'System Configuration',
        href: '/system/configuration',
        icon: SlidersHorizontal,
      },
      {
        label: 'Numbering Configuration',
        href: '/system/numbering',
        icon: ListChecks,
      },
      {
        label: 'Status Configuration',
        href: '/system/statuses',
        icon: ClipboardCheck,
      },
      {
        label: 'Master Data Import',
        href: '/system/master-data-import',
        icon: Upload,
      },
      {
        label: 'Activity Logs',
        href: '/system/activity-logs',
        icon: Activity,
      },
    ],
  },

  // =========================================================
  // EXISTING SETTINGS
  // =========================================================
  {
    label: 'Settings',
    icon: Settings,
    children: [
      {
        label: 'General Settings',
        href: '/settings',
        icon: SlidersHorizontal,
      },
      {
        label: 'Access Control',
        href: '/settings/access',
        icon: KeyRound,
        permission: 'access:users:read',
      },
    ],
  },
];

export function inferredPermission(href?: string) {
  if (!href) return undefined;

  const parts = href.split('/').filter(Boolean);

  if (href === '/dashboard') {
    return 'dashboard:dashboard:read';
  }

  if (parts[0] === 'settings') {
    return parts[1] === 'access'
      ? 'access:users:read'
      : 'company:company:read';
  }

  if (parts[0] === 'audit-trail') {
    return 'access:audit:read';
  }

  if (parts[0] === 'customers') {
    return 'customers:customers:read';
  }

  if (parts[0] === 'suppliers') {
    return 'suppliers:suppliers:read';
  }

  if (parts[0] === 'projects') {
    return 'projects:projects:read';
  }

  if (parts[0] === 'sales') {
    return `sales:${
      parts[1] === 'orders' ? 'sales-orders' : parts[1]
    }:read`;
  }

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
    const resource =
      parts[1] === 'reports'
        ? 'reports'
        : parts[1];

    return `invoicing:${resource}:read`;
  }

  if (
    parts[0] === 'inventory' ||
    parts[0] === 'crm' ||
    parts[0] === 'accounting' ||
    parts[0] === 'procurement'
  ) {
    return `${parts[0]}:${parts[1]}:read`;
  }

  return undefined;
}
