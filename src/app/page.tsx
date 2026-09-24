'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderOpen,
  GitBranch,
  Globe,
  Landmark,
  LockKeyhole,
  Package,
  Plug,
  ReceiptText,
  RefreshCw,
  Settings,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
  Warehouse,
  Workflow,
} from 'lucide-react';

const slides = [
  {
    eyebrow: 'Document lifecycle',
    title: 'Inbound PO to Outbound ASN without losing the audit trail',
    desc: 'Create fulfillment documents seamlessly, track putaway and picking, lock completed tasks, and keep every stock movement in WMS Desk traceable.',
    accent: '#2490ef',
    metrics: ['Received', 'Picked', 'Dispatched'],
  },
  {
    eyebrow: 'Company access control',
    title: 'Give exact module permissions, then deny what must stay closed',
    desc: 'Super Admin can create company users, assign roles, and control read, create, write, submit, cancel, report, print, and manage access.',
    accent: '#0f9d58',
    metrics: ['Allow', 'Deny', 'Audit'],
  },
  {
    eyebrow: 'Operations desk',
    title: 'Run B2B, B2C, Free Zone, 3PL, and Mobile Ops from one desk',
    desc: 'An enterprise desk custom-tuned for WMS operations: compact tables, status badges, module navigation, and real-time inventory tracking.',
    accent: '#d98324',
    metrics: ['Inbound', 'Stock', 'Outbound'],
  },
];

const modules = [
  { icon: Warehouse, title: 'Warehouse & Locations', desc: 'Multi-warehouse management, hierarchy, zones, bin-level inventory, putaway rules, and location capacity.' },
  { icon: Boxes, title: 'Product & Inventory Master', desc: 'SKU master, categories, barcodes, UOM management, batches, serials, expiry tracking, and HS codes.' },
  { icon: Truck, title: 'Inbound / Receiving', desc: 'PO receiving, ASN, dock scheduling, goods receipt, barcode receiving, quality inspection, and putaway.' },
  { icon: Warehouse, title: '3PL Warehouse', desc: 'Multi-client management, client inventory, client orders, storage billing, and handling charges.' },
  { icon: RefreshCw, title: 'Returns & Logistics', desc: 'Return authorizations, return receiving, inspection, restocking, and reverse logistics.' },
  { icon: Truck, title: 'Transport & Shipments', desc: 'Shipment management, carrier integration, delivery tracking, and proof of delivery.' },
  { icon: Globe, title: 'UAE Configuration', desc: 'Currency & VAT (5%), tax details, UAE HS codes, and commercial export/import documents.' },
  { icon: ShieldCheck, title: 'Free Zone', desc: 'Bonded stock, customs inventory tracking, duty status, FZ transfers, mainland moves, and re-export workflows.' },
  { icon: Boxes, title: 'Inventory Control', desc: 'Real-time inventory tracking, availability, cycle counting, physical stock counts, stock transfers, and FEFO/FIFO.' },
  { icon: Building2, title: 'B2B Orders', desc: 'B2B sales orders, customer-specific SKUs, price lists, order allocation, partial fulfillment, and backorders.' },
  { icon: ShoppingBag, title: 'B2C Fulfillment', desc: 'E-commerce order import, wave/batch/single picking, packing, shipping labels, tracking, and COD support.' },
  { icon: ClipboardCheck, title: 'Picking & Dispatch', desc: 'Picking tasks, wave planning, zone picking, packing station verification, and shipment consolidation.' },
  { icon: Warehouse, title: 'Mobile Operations', desc: 'Handheld scanner workflows for receiving, putaway, picking, transfers, cycle counting, and dispatch.' },
  { icon: BarChart3, title: 'WMS Analytics', desc: 'Operational dashboards for inventory, inbound, outbound, B2B, B2C, Free Zone, and executive reports.' },
  { icon: Plug, title: 'Integrations', desc: 'REST API, e-commerce & marketplace connectors, ERP/accounting sync, courier APIs, and webhooks.' },
  { icon: Bell, title: 'Notifications', desc: 'Low stock alerts, order notifications, receiving alerts, picking exceptions, and discrepancy management.' },
  { icon: Settings2, title: 'System Configuration', desc: 'Transaction history, approval workflows, automated backups, numbering schemes, and audit activity logs.' },
  { icon: Settings, title: 'Settings', desc: 'User accounts, role permissions, access control, and user management.' },
];

const lifecycle = [
  'Advance Shipment Notice (ASN) received',
  'PO receiving & quality inspection',
  'Putaway to assigned bin location',
  'Order picking & wave allocation',
  'Packing station verification',
  'Dispatch & shipping label generated',
  'Audit trail & stock ledger updated',
];

const permissions = [
  'Super Admin & Admin manage facility clearance',
  'Warehouse personnel created with login access',
  'Role hierarchy (Admin, Supervisor, Picker, Packer, Auditor)',
  'Sub-modules have granular allow/deny rules',
  'Denied permission wins over allowed permission',
  'Access changes & approvals logged in audit trail',
];

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1f2937]">
      {/* Navigation Bar */}
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/55 bg-[#fbfaf8]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2490ef] font-bold text-white shadow-sm shadow-[#2490ef]/25">V</div>
            <div>
              <span className="block text-base font-semibold leading-4">WMS Desk</span>
              <span className="text-xs text-[#6b7280]">Multi-Tenant Enterprise Portal</span>
            </div>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-[#4b5563] md:flex">
            <a href="#modules" className="hover:text-[#1674c4] transition-colors">Modules</a>
            <a href="#security" className="hover:text-[#1674c4] transition-colors">Access Control</a>
            <a href="#workflow" className="hover:text-[#1674c4] transition-colors">Workflow</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-[#2490ef] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#2490ef]/20 hover:bg-[#1674c4] transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-[#2490ef] px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-[#2490ef]/20 hover:bg-[#1674c4] transition-colors"
              >
                Sign In
              </Link>
            )}
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
                Dedicated Subdomain Workspaces
              </div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-[#172033] sm:text-5xl lg:text-6xl">
                WMS Desk
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4b5563]">
                End-to-end warehouse management system for UAE/Dubai operations covering B2B, B2C, free zone/bonded inventory, inbound, inventory, picking, packing, outbound, returns, 3PL operations, mobile scanning, reporting and integrations for a 25-user pilot.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#modules"
                  className="rounded-md border border-[#d9d4cc] bg-white px-4 py-2.5 text-sm font-medium text-[#383838] shadow-sm hover:bg-[#f8faf9] transition-colors"
                >
                  Explore Modules
                </a>
              </div>
            </div>

            <div className="mt-14 grid max-w-4xl gap-3 sm:grid-cols-3">
              {['Dedicated Subdomains', 'Role-Based Control', 'Audited Financials'].map((item, index) => (
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
              <p className="text-xs font-semibold uppercase text-[#1674c4]">WMS Desk Core</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#1f2937]">Three integrated systems working as one</h2>
              <p className="mt-3 max-w-xl leading-7 text-[#6b7280]">
                WMS Desk connects every department: documents are linked, role-based controls protect operations, and every module feeds the central operational desk.
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
                <p className="text-xs font-semibold uppercase text-[#1674c4]">WMS Desk Modules</p>
                <h2 className="mt-2 text-2xl font-semibold">Operational Desk for All Departments</h2>
              </div>
              <p className="max-w-xl leading-7 text-[#6b7280]">
                Every module is built for team productivity: compact record views, linked transactions, live status tracking, and strict role permissions.
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
            <p className="text-xs font-semibold uppercase text-[#1674c4]">WMS Desk Workflows</p>
            <h2 className="mt-2 text-2xl font-semibold">Strict transaction progression and governance</h2>
            <p className="mt-3 leading-7 text-[#6b7280]">
              Inbound, picking, packing, and shipment records follow an audited chain. Submitted records are locked, inventory levels update in real time, and activity logs preserve exact history.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="landing-pill"><GitBranch className="h-3.5 w-3.5" />Linked documents</span>
              <span className="landing-pill"><FileText className="h-3.5 w-3.5" />Shipping documentation</span>
              <span className="landing-pill"><BookOpen className="h-3.5 w-3.5" />Inventory audit trail</span>
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
              <p className="text-xs font-semibold uppercase text-[#1674c4]">WMS Desk Security</p>
              <h2 className="mt-2 text-2xl font-semibold">Super Admin controls enterprise access</h2>
              <p className="mt-3 leading-7 text-[#5d6673]">
                The access control model is configured specifically for company hierarchy. Super Admin manages employee access, warehouse boundaries, and module-level permissions.
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
                  <p className="text-sm font-semibold">WMS Desk Access Matrix</p>
                  <p className="text-xs text-[#6b7280]">Role & module permission matrix</p>
                </div>
                <LockKeyhole className="h-5 w-5 text-[#1674c4]" />
              </div>
              <div className="p-4">
                {[
                  { name: 'Inbound Receiving', allow: true, action: 'Approve' },
                  { name: 'Picking & Scanning', allow: true, action: 'Write' },
                  { name: 'Stock Adjustment', allow: false, action: 'Delete' },
                  { name: 'User & Access Control', allow: true, action: 'Manage' },
                ].map((row) => (
                  <div key={row.name} className="landing-permission-row">
                    <span>{row.name}</span>
                    <b className={row.allow ? 'allow' : 'deny'}>{row.allow ? 'Allow' : 'Deny'}</b>
                    <em>{row.action}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


      </main>

      <footer className="border-t border-[#e5e2dc] px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[#6b7280] md:flex-row">
          <span>WMS Desk — Enterprise Warehouse & Logistics Operations</span>
          <span>Inbound & Outbound • B2B/B2C Fulfillment • Free Zone • 3PL Operations</span>
        </div>
      </footer>
    </div>
  );
}
