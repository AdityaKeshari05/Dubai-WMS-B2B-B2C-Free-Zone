import Link from 'next/link';
import {
  BarChart3,
  BookOpen,
  Building2,
  FileText,
  FolderOpen,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';

const modules = [
  { icon: BarChart3, title: 'Dashboard', desc: 'Revenue, invoices, stock, and lead movement.' },
  { icon: BookOpen, title: 'Accounting', desc: 'Accounts, journals, and reporting workflows.' },
  { icon: Package, title: 'Inventory', desc: 'Products, warehouses, and stock movement.' },
  { icon: Users, title: 'HR', desc: 'Employees, attendance, leave, and payroll.' },
  { icon: FileText, title: 'Sales', desc: 'Quotations, orders, invoices, and payments.' },
  { icon: ShoppingBag, title: 'Procurement', desc: 'Purchase orders and supplier invoices.' },
  { icon: FolderOpen, title: 'Projects', desc: 'Tasks, milestones, and execution status.' },
  { icon: Building2, title: 'Parties', desc: 'Customers, suppliers, contacts, and terms.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1f2937]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2490ef] font-bold text-white">O</div>
          <span className="text-base font-semibold">Orus ERP</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-[#4b5563] hover:bg-[#eef3f5]">
            Sign in
          </Link>
          <Link href="/dashboard" className="rounded-md bg-[#2490ef] px-3 py-2 text-sm font-medium text-white shadow-sm shadow-[#2490ef]/20 hover:bg-[#1674c4]">
            Open Desk
          </Link>
        </div>
      </nav>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 pb-14 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="pt-8">
          <p className="mb-3 text-xs font-semibold uppercase text-[#1674c4]">ERP Desk</p>
          <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
            Orus ERP
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#6b7280]">
            A focused workspace for accounting, inventory, sales, HR, CRM, procurement, and projects.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/dashboard" className="rounded-md bg-[#2490ef] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#2490ef]/20 hover:bg-[#1674c4]">
              Open Dashboard
            </Link>
            <Link href="/register" className="rounded-md border border-[#d9d4cc] bg-white px-4 py-2 text-sm font-medium text-[#383838] shadow-sm hover:bg-[#f8faf9]">
              Create Account
            </Link>
          </div>
        </section>

        <section className="rounded-md border border-[#e5e2dc] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.08)]">
          <div className="border-b border-[#f0ede8] px-4 py-3">
            <p className="text-sm font-semibold">Workspace Modules</p>
            <p className="text-xs text-[#6b7280]">The same structure your desk opens into.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module.title} className="border-b border-r border-[#f0ede8] p-4 last:border-b-0 even:border-r-0">
                <module.icon className="mb-3 h-5 w-5 text-[#1674c4]" />
                <h2 className="text-sm font-semibold">{module.title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#6b7280]">{module.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
