export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'ACCOUNTANT' | 'HR_MANAGER' | 'HR_OFFICER' | 'PAYROLL_OFFICER' | 'SALES_REP' | 'PURCHASE_MANAGER';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Company
export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  currency: string;
  logo?: string;
}

// Accounting
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type EntryStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subType?: string;
  parentId?: string;
  parent?: { name: string; code: string };
  children?: Account[];
  description?: string;
  isActive: boolean;
  balance: number;
  currency: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  status: EntryStatus;
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
  lines: JournalLine[];
}

export interface JournalLine {
  id: string;
  debitAccountId?: string;
  debitAccount?: Account;
  creditAccountId?: string;
  creditAccount?: Account;
  debit: number;
  credit: number;
  description?: string;
}

// Inventory
export type ProductType = 'PRODUCT' | 'SERVICE' | 'DIGITAL';
export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';

export interface Category {
  id: string;
  code?: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: { products: number };
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  unitId?: string;
  unit?: Unit;
  type: ProductType;
  costPrice: number;
  salePrice: number;
  taxRate: number;
  minStockLevel: number;
  maxStockLevel?: number;
  isActive: boolean;
  image?: string;
  barcode?: string;
  stockLevels?: StockLevel[];
  createdAt: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
}

export interface StockLevel {
  id: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reservedQty: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: { name: string; sku: string };
  warehouseId: string;
  warehouse?: { name: string };
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reference?: string;
  notes?: string;
  createdAt: string;
}

// HR
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'PROBATION';
export type SalaryType = 'HOURLY' | 'DAILY' | 'MONTHLY' | 'ANNUAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type PayrollStatus = 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE' | 'HOLIDAY';

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  description?: string;
  isActive: boolean;
  _count?: { employees: number };
  positions?: Position[];
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  department?: Department;
  minSalary?: number;
  maxSalary?: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  userId: string;
  user: { firstName: string; lastName: string; email: string; avatar?: string };
  departmentId?: string;
  department?: Department;
  positionId?: string;
  position?: Position;
  managerId?: string;
  manager?: Employee;
  hireDate: string;
  salary: number;
  salaryType: SalaryType;
  status: EmployeeStatus;
  address?: string;
  city?: string;
  country?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  overtime?: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
  isPaid: boolean;
  description?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveTypeId: string;
  leaveType?: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employee?: Employee;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  netSalary: number;
  status: PayrollStatus;
  payDate?: string;
  items?: PayrollItem[];
}

export interface PayrollItem {
  id: string;
  type: 'EARNING' | 'DEDUCTION' | 'TAX';
  name: string;
  amount: number;
}

// CRM
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED';
export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'EMAIL' | 'PHONE' | 'ADVERTISEMENT' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type OpportunityStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE' | 'FOLLOW_UP';
export type ActivityStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Lead {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: Priority;
  value?: number;
  notes?: string;
  createdById: string;
  createdBy?: { firstName: string; lastName: string };
  assignedToId?: string;
  assignedTo?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  leadId?: string;
  contactId?: string;
  contact?: Contact;
  value: number;
  currency: string;
  stage: OpportunityStage;
  probability: number;
  expectedClose?: string;
  notes?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  status: ActivityStatus;
  leadId?: string;
  contactId?: string;
  userId: string;
  user?: { firstName: string; lastName: string };
  createdAt: string;
}

// Customers & Suppliers
export interface Customer {
  id: string;
  customerNo: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxId?: string;
  currency: string;
  creditLimit: number;
  paymentTerms: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { salesOrders: number; invoices: number };
}

export interface Supplier {
  id: string;
  supplierNo: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  currency: string;
  paymentTerms: number;
  bankAccount?: string;
  bankName?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

// Sales
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type InvoiceStatus = 'DRAFT' | 'SUBMITTED' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentType = 'RECEIVED' | 'MADE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'CREDIT_CARD' | 'CHEQUE' | 'ONLINE';
export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'RECEIVING' | 'RECEIVED' | 'CANCELLED';

export interface OrderItem {
  id?: string;
  productId: string;
  product?: Product;
  itemCode?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  rate?: number;
  taxRate: number;
  discount: number;
  netAmount?: number;
  taxAmount?: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  customerId: string;
  customer?: { name: string; email?: string };
  date: string;
  validUntil?: string;
  status: QuotationStatus;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface SalesOrder {
  id: string;
  orderNo: string;
  customerId: string;
  customer?: { name: string; email?: string };
  quotationId?: string;
  date: string;
  deliveryDate?: string;
  status: SalesOrderStatus;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customer?: { name: string; email?: string };
  salesOrderId?: string;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  grandTotal?: number;
  amountPaid: number;
  outstandingAmount?: number;
  currency: string;
  notes?: string;
  terms?: string;
  items: OrderItem[];
  payments?: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNo: string;
  type: PaymentType;
  customerId?: string;
  customer?: { name: string };
  invoiceId?: string;
  invoice?: { invoiceNo: string };
  date: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  supplier?: { name: string; email?: string };
  date: string;
  expectedDate?: string;
  status: PurchaseOrderStatus;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplier?: { name: string };
  purchaseOrderId?: string;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
}

// Projects
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress: number;
  members?: ProjectMember[];
  tasks?: Task[];
  milestones?: Milestone[];
  _count?: { tasks: number; milestones: number };
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  project?: { name: string };
  assigneeId?: string;
  assignee?: { firstName: string; lastName: string; avatar?: string };
  creatorId: string;
  creator?: { firstName: string; lastName: string };
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  completedAt?: string;
  parentId?: string;
  subtasks?: Task[];
  tags: string[];
  _count?: { comments: number };
  comments?: Comment[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  project?: { name: string };
  dueDate?: string;
  status: MilestoneStatus;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId?: string;
  userId: string;
  user?: { firstName: string; lastName: string; avatar?: string };
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Dashboard
export interface DashboardStats {
  revenue: { total: number; thisMonth: number };
  expenses: { total: number };
  pendingInvoices: { count: number; amount: number };
  activeCustomers: number;
  activeEmployees: number;
  openLeads: number;
  pendingTasks: number;
  lowStock: { id: string; sku: string; name: string; currentStock: number; minStockLevel: number }[];
  recentInvoices: SalesInvoice[];
  recentLeads: Lead[];
  monthlyRevenue: { month: string; revenue: number }[];
}
