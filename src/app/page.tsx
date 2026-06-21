import Link from 'next/link';

const modules = [
  { icon: '📊', title: 'Dashboard', desc: 'Revenue, expenses, KPIs and charts at a glance' },
  { icon: '📒', title: 'Accounting', desc: 'Chart of accounts, journal entries, trial balance' },
  { icon: '📦', title: 'Inventory', desc: 'Products, warehouses, stock movements & alerts' },
  { icon: '👥', title: 'HR', desc: 'Employees, payroll, attendance and leave management' },
  { icon: '🎯', title: 'CRM', desc: 'Leads, contacts, opportunities and activity tracking' },
  { icon: '🧾', title: 'Sales', desc: 'Quotations and sales orders with status workflows' },
  { icon: '💳', title: 'Invoicing', desc: 'Sales invoices, payment recording and tracking' },
  { icon: '🛒', title: 'Procurement', desc: 'Purchase orders and supplier invoice management' },
  { icon: '🗂️', title: 'Projects', desc: 'Kanban board, tasks, milestones and team workspace' },
  { icon: '🏢', title: 'Customers', desc: 'Customer directory with credit limits and terms' },
  { icon: '🤝', title: 'Suppliers', desc: 'Supplier management with payment terms and banking' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">O</div>
          <span className="font-semibold text-lg tracking-tight">Orus ERP</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
          <Link href="/dashboard" className="text-sm bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-lg font-medium">
            Go to Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          Full-stack ERP · Built with Next.js + Express + Prisma
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          One platform for your<br />
          <span className="text-blue-400">entire business</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
          Accounting, inventory, HR, sales, CRM, procurement and project management — all in one place.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-3 rounded-lg font-semibold text-sm"
          >
            Open Dashboard
          </Link>
          <Link
            href="/register"
            className="border border-slate-700 hover:border-slate-500 transition-colors px-6 py-3 rounded-lg font-semibold text-sm text-slate-300"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Modules grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8">
          {modules.length} modules included
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((m) => (
            <div
              key={m.title}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800 transition-all"
            >
              <div className="text-2xl mb-3">{m.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{m.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-slate-800 text-center py-6 text-xs text-slate-600">
        Orus ERP — powered by Next.js 16, Express 5, Prisma 7, PostgreSQL
      </div>
    </div>
  );
}
