'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  GitBranch,
  KeyRound,
  Landmark,
  LockKeyhole,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
  Workflow,
} from 'lucide-react';

const slides = [
  {
    eyebrow: 'Document lifecycle',
    title: 'Quotation to invoice without losing the audit trail',
    desc: 'Create sales documents from one another, submit them, lock them, amend them, and keep every financial movement traceable.',
    accent: '#2490ef',
    metrics: ['Draft', 'Submitted', 'Paid'],
  },
  {
    eyebrow: 'Company access control',
    title: 'Give exact module permissions, then deny what must stay closed',
    desc: 'Super Admin can create employees, assign roles, and control read, create, write, submit, cancel, report, print, and manage access.',
    accent: '#0f9d58',
    metrics: ['Allow', 'Deny', 'Audit'],
  },
  {
    eyebrow: 'Operations desk',
    title: 'Run HR, inventory, sales, accounting, and projects from one shell',
    desc: 'A Frappe-style desk built for daily work: compact tables, status badges, module navigation, and records linked across teams.',
    accent: '#d98324',
    metrics: ['HR', 'Stock', 'Ledger'],
  },
];

const modules = [
  { icon: BarChart3, title: 'Dashboard', desc: 'Live desk metrics for revenue, invoices, stock, payments, and work queues.' },
  { icon: Landmark, title: 'Accounting', desc: 'Chart of accounts, journal entries, fiscal years, trial balance, and ledger records.' },
  { icon: Package, title: 'Inventory', desc: 'Products, categories, warehouses, stock movement, units, and reorder visibility.' },
  { icon: Users, title: 'HRMS', desc: 'Employees, departments, positions, shifts, attendance, leave ledger, payroll, and salary slips.' },
  { icon: ReceiptText, title: 'Invoicing', desc: 'Sales invoices, delivery notes, payments, credit notes, aging, recurring invoices, and PDF print.' },
  { icon: ClipboardList, title: 'Sales', desc: 'Quotations, sales orders, document conversion, customer links, and order status.' },
  { icon: ShoppingBag, title: 'Procurement', desc: 'Purchase orders, supplier invoices, suppliers, and buying workflows.' },
  { icon: FolderOpen, title: 'Projects', desc: 'Projects, tasks, milestones, comments, members, and execution tracking.' },
];

const lifecycle = [
  'Lead or customer created',
  'Quotation drafted',
  'Sales order confirmed',
  'Delivery note submitted',
  'Invoice posted',
  'Payment allocated',
  'Ledger updated',
];

const permissions = [
  'Company creator becomes Super Admin',
  'Employees are created with login access',
  'Roles can be assigned per user',
  'Every module has allow and deny rules',
  'Denied permission wins over allowed permission',
  'Access changes are logged for audit',
];

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1f2937]">
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/55 bg-[#fbfaf8]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2490ef] font-bold text-white shadow-sm shadow-[#2490ef]/25">O</div>
            <div>
              <span className="block text-base font-semibold leading-4">Orus ERP</span>
              <span className="text-xs text-[#6b7280]">Production business desk</span>
            </div>
          </Link>
          <div className="hidden items-center gap-5 text-sm text-[#4b5563] md:flex">
            <a href="#modules" className="hover:text-[#1674c4]">Modules</a>
            <a href="#security" className="hover:text-[#1674c4]">Access</a>
            <a href="#workflow" className="hover:text-[#1674c4]">Workflow</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-[#4b5563] hover:bg-[#eef3f5]">
              Sign in
            </Link>
            <Link href="/register" className="rounded-md bg-[#2490ef] px-3 py-2 text-sm font-medium text-white shadow-sm shadow-[#2490ef]/20 hover:bg-[#1674c4]">
              Create company
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="landing-hero relative flex min-h-[92vh] overflow-hidden border-b border-[#e5e2dc] px-5 pt-24">
          <div className="landing-grid" />
          <div className="landing-desk-scene" aria-hidden="true">
            <div className="scene-window scene-window-a">
              <div className="scene-header"><span /><span /><span /></div>
              <div className="scene-bars">
                <i style={{ height: '42%' }} /><i style={{ height: '70%' }} /><i style={{ height: '55%' }} /><i style={{ height: '84%' }} /><i style={{ height: '62%' }} />
              </div>
            </div>
            <div className="scene-window scene-window-b">
              <div className="scene-header"><span /><span /><span /></div>
              <div className="scene-lines">
                <i /><i /><i /><i />
              </div>
            </div>
            <div className="scene-window scene-window-c">
              <div className="scene-header"><span /><span /><span /></div>
              <div className="scene-chain">
                <b>QT</b><em /><b>SO</b><em /><b>INV</b><em /><b>PAY</b>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-center pb-14">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#cde6fb] bg-white/82 px-3 py-1 text-xs font-semibold text-[#1674c4] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                ERP Desk for finance, operations, HR, and access control
              </div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-[#172033] sm:text-5xl lg:text-6xl">
                Orus ERP
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4b5563]">
                A complete business workspace for companies that need document lifecycles, permissions, invoicing, HRMS, inventory, accounting, and operational reporting in one connected desk.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex items-center rounded-md bg-[#2490ef] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2490ef]/20 hover:bg-[#1674c4]">
                  Create your company <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/login" className="rounded-md border border-[#d9d4cc] bg-white px-4 py-2.5 text-sm font-medium text-[#383838] shadow-sm hover:bg-[#f8faf9]">
                  Sign in to desk
                </Link>
              </div>
            </div>

            <div className="mt-14 grid max-w-4xl gap-3 sm:grid-cols-3">
              {['Document workflow', 'Role-based access', 'Linked operations'].map((item, index) => (
                <div key={item} className="landing-stat" style={{ animationDelay: `${index * 120}ms` }}>
                  <CheckCircle2 className="h-4 w-4 text-[#0f9d58]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
            <div>
              <p className="text-xs font-semibold uppercase text-[#1674c4]">Product Slides</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#1f2937]">Three core systems working together</h2>
              <p className="mt-3 max-w-xl leading-7 text-[#6b7280]">
                Orus is structured like a real ERP desk: documents are linked, roles decide what users can do, and every operational module feeds the same business context.
              </p>
              <div className="mt-5 flex gap-2">
                {slides.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-10 bg-[#2490ef]' : 'w-2.5 bg-[#d9d4cc]'}`}
                    aria-label={`Show slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="landing-slide-panel">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ede8] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ color: slide.accent }}>{slide.eyebrow}</p>
                  <h3 className="mt-1 text-xl font-semibold">{slide.title}</h3>
                </div>
                <Workflow className="h-6 w-6" style={{ color: slide.accent }} />
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-[1fr_280px]">
                <p className="leading-7 text-[#6b7280]">{slide.desc}</p>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
                  {slide.metrics.map((metric) => (
                    <div key={metric} className="rounded-md border border-[#e5e2dc] bg-[#f8faf9] px-3 py-2">
                      <p className="text-xs text-[#6b7280]">Status</p>
                      <p className="font-semibold" style={{ color: slide.accent }}>{metric}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="border-y border-[#e5e2dc] bg-white px-5 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase text-[#1674c4]">ERP Modules</p>
                <h2 className="mt-2 text-2xl font-semibold">A complete operating system for the company</h2>
              </div>
              <p className="max-w-xl leading-7 text-[#6b7280]">
                Each module is built for repeated daily use: compact lists, connected records, statuses, reports, and permission-aware actions.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map((module, index) => (
                <div key={module.title} className="landing-module" style={{ animationDelay: `${index * 80}ms` }}>
                  <module.icon className="mb-4 h-5 w-5 text-[#1674c4]" />
                  <h3 className="text-sm font-semibold">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">{module.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase text-[#1674c4]">Workflow</p>
            <h2 className="mt-2 text-2xl font-semibold">Documents move forward, not sideways</h2>
            <p className="mt-3 leading-7 text-[#6b7280]">
              Sales and invoicing records follow an ERP-style chain. Submitted records are locked, payments update outstanding balances, and ledger/audit records preserve what happened.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="landing-pill"><GitBranch className="h-3.5 w-3.5" />Linked documents</span>
              <span className="landing-pill"><FileText className="h-3.5 w-3.5" />PDF-ready invoices</span>
              <span className="landing-pill"><BookOpen className="h-3.5 w-3.5" />Ledger trail</span>
            </div>
          </div>
          <div className="landing-timeline">
            {lifecycle.map((item, index) => (
              <div key={item} className="landing-step">
                <div className="landing-step-index">{index + 1}</div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="security" className="border-y border-[#e5e2dc] bg-[#f2f6f7] px-5 py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase text-[#1674c4]">Access Control</p>
              <h2 className="mt-2 text-2xl font-semibold">Super Admin owns the company boundary</h2>
              <p className="mt-3 leading-7 text-[#5d6673]">
                The access model is built around company ownership. A Super Admin can create users, assign roles, and control every module using allow/deny permissions.
              </p>
              <div className="mt-6 grid gap-2">
                {permissions.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md border border-[#d9e4e8] bg-white px-3 py-2 text-sm text-[#374151]">
                    <ShieldCheck className="h-4 w-4 text-[#0f9d58]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="landing-access-console">
              <div className="flex items-center justify-between border-b border-[#f0ede8] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Access Matrix</p>
                  <p className="text-xs text-[#6b7280]">Example role configuration</p>
                </div>
                <LockKeyhole className="h-5 w-5 text-[#1674c4]" />
              </div>
              <div className="p-4">
                {['Sales Invoice', 'HR Payroll', 'Inventory Stock', 'Access Users'].map((row, index) => (
                  <div key={row} className="landing-permission-row">
                    <span>{row}</span>
                    <b className={index === 1 ? 'deny' : 'allow'}>{index === 1 ? 'Deny' : 'Allow'}</b>
                    <em>{index === 3 ? 'Manage' : index === 2 ? 'Write' : 'Read'}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14">
          <div className="landing-final">
            <div>
              <p className="text-xs font-semibold uppercase text-[#cde6fb]">Start clean</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Create the company, then build the desk around real roles.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#d9e8f5]">
                Set up departments, positions, employees, role access, inventory, customers, invoices, payments, and reports from a single connected ERP shell.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="rounded-md bg-white px-4 py-2.5 text-sm font-medium text-[#1674c4] shadow-sm hover:bg-[#eef6fd]">
                Create company
              </Link>
              <Link href="/login" className="rounded-md border border-white/25 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e2dc] px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[#6b7280] md:flex-row">
          <span>Orus ERP</span>
          <span>Accounting • HRMS • Inventory • Invoicing • Access Control</span>
        </div>
      </footer>
    </div>
  );
}
