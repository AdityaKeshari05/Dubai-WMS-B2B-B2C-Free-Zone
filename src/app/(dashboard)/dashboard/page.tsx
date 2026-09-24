'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  PackageCheck,
  Plug,
  RefreshCw,
  ScanLine,
  Settings,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Warehouse,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const WMS_FACILITIES = [
  { name: 'Jebel Ali Free Zone (JAFZA-WH01)', zone: 'Free Zone / Bonded', occupancy: '84%', picked: 1248, dispatched: 1102, health: 'Healthy' },
  { name: 'Dubai South Hub (DWC-WH02)', zone: 'Automated High-Bay', occupancy: '92%', picked: 842, dispatched: 790, health: 'Healthy' },
  { name: 'Dubai Central Depot (DXB-WH03)', zone: 'Cold Storage & General', occupancy: '68%', picked: 412, dispatched: 395, health: 'Healthy' },
  { name: 'KIZAD Transit Yard (KIZAD-WH04)', zone: '3PL Transit Facility', occupancy: '45%', picked: 209, dispatched: 188, health: 'Watch' },
];

const WMS_SECTIONS = [
  { title: 'Warehouse & Locations', desc: 'Hierarchy, zones, bin-level inventory & putaway rules', icon: Warehouse, href: '/warehouse-locations/warehouses', color: '#2490ef' },
  { title: 'Product & Inventory Master', desc: 'SKU master, barcodes, UOM, batches & serials', icon: Boxes, href: '/product-master/sku-master', color: '#0f9d58' },
  { title: 'Inbound / Receiving', desc: 'PO receiving, ASN, dock scheduling & GRN generation', icon: Truck, href: '/inbound/po-receiving', color: '#d98324' },
  { title: '3PL Warehouse', desc: 'Multi-client management, client stock & storage billing', icon: Warehouse, href: '/3pl/clients', color: '#6350b8' },
  { title: 'Returns & Logistics', desc: 'Return authorizations, inspection, restocking & RTO', icon: RefreshCw, href: '/returns/authorizations', color: '#0f7a8a' },
  { title: 'Transport & Shipments', desc: 'Carriers, delivery tracking & proof of delivery', icon: Truck, href: '/shipments', color: '#1674c4' },
  { title: 'UAE Configuration', desc: 'Currency, 5% VAT tax details & HS codes', icon: Globe, href: '/uae-config/currency-vat', color: '#059669' },
  { title: 'Free Zone', desc: 'Bonded stock, customs tracking & duty classification', icon: ShieldCheck, href: '/free-zone/dashboard', color: '#4f46e5' },
  { title: 'Inventory Control', desc: 'Real-time stock, cycle counts & stock transfers', icon: Boxes, href: '/wms-inventory-control', color: '#ea580c' },
  { title: 'B2B Orders', desc: 'Sales order allocation, pallet handling & backorders', icon: Building2, href: '/b2b-orders', color: '#2563eb' },
  { title: 'B2C Fulfillment', desc: 'E-commerce order sync, wave picking & shipping labels', icon: ShoppingBag, href: '/b2c-fulfillment', color: '#db2777' },
  { title: 'Picking & Dispatch', desc: 'Wave planning, zone picking & packing station', icon: ClipboardCheck, href: '/warehouse-fulfillment', color: '#16a34a' },
  { title: 'Mobile Operations', desc: 'RF Scanner receiving, putaway, picking & dispatch', icon: ScanLine, href: '/mobile-operations', color: '#7c3aed' },
  { title: 'WMS Analytics', desc: 'Inbound, outbound, B2B, B2C & Free Zone reports', icon: BarChart3, href: '/wms-analytics', color: '#0891b2' },
  { title: 'Integrations', desc: 'REST API, e-commerce, ERP sync & webhooks', icon: Plug, href: '/integrations', color: '#4b5563' },
  { title: 'Notifications', desc: 'Low stock alerts, picking exceptions & order alerts', icon: Bell, href: '/notifications', color: '#dc2626' },
  { title: 'System Configuration', desc: 'Approvals, numbering, automated backups & activity logs', icon: Settings2, href: '/system/configuration', color: '#475569' },
  { title: 'Settings', desc: 'User & Access Management, role permissions', icon: Settings, href: '/settings/user-access', color: '#1e293b' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#e5e2dc] pb-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-[#1f2937]">WMS Operations Desk</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Live warehouse management overview for UAE/Dubai operations: B2B, B2C, Free Zone bonded stock, 3PL, picking, packing, and dispatch.
          </p>
        </div>
        <Link
          href="/wms-analytics"
          className="inline-flex items-center rounded-md bg-[#2490ef] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1674c4] transition-colors"
        >
          <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Warehouses" value="4 Facilities" note="JAFZA, DWC, DXB, KIZAD" icon={Warehouse} tone="blue" href="/warehouse-locations/warehouses" />
        <KpiCard title="Total Inventory" value="48,920 Units" note="Real-time stock balance" icon={Boxes} tone="green" href="/wms-inventory-control" />
        <KpiCard title="Inbound Shipments" value="24 Orders" note="PO & ASN receiving" icon={Truck} tone="amber" href="/inbound/po-receiving" />
        <KpiCard title="Outbound Dispatch" value="312 Orders" note="B2B & B2C fulfillment" icon={PackageCheck} tone="purple" href="/b2b-orders" />
      </div>

      {/* Workload Completion & Facility Health */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Warehouse Workload Completion</CardTitle>
            <CardDescription className="text-xs text-[#6b7280]">Real-time operational task progress across active shifts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StageBar label="Inbound PO & ASN Receiving" count="126 / 150 Units" pct={84} color="#2490ef" />
            <StageBar label="Bin Putaway & Stock Storage" count="92 / 130 Bins" pct={71} color="#0f9d58" />
            <StageBar label="Wave & Order Picking" count="267 / 300 Lines" pct={89} color="#d98324" />
            <StageBar label="Pack Station Verification" count="181 / 238 Packages" pct={76} color="#6350b8" />
            <StageBar label="Outbound Dispatch & Labels" count="95 / 150 Shipments" pct={63} color="#1674c4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Facility Status Snapshot</CardTitle>
            <CardDescription className="text-xs text-[#6b7280]">Capacity & dispatch health across UAE sites</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {WMS_FACILITIES.map((facility) => (
              <div key={facility.name} className="flex items-center justify-between rounded-md border border-[#f0ede8] p-2.5 text-xs">
                <div>
                  <p className="font-semibold text-[#1f2937]">{facility.name}</p>
                  <p className="text-[#6b7280]">{facility.zone} · {facility.occupancy} Capacity</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 font-semibold text-[11px] ${facility.health === 'Healthy' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fef3c7] text-[#92400e]'}`}>
                  {facility.health}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* WMS Desk Modules Grid (Matches sidebarNav.ts) */}
      <div>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-[#1f2937]">WMS Desk Sections</h2>
          <p className="text-xs text-[#6b7280]">Direct access to all active warehouse management modules</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {WMS_SECTIONS.map((sec) => (
            <Link
              key={sec.title}
              href={sec.href}
              className="group flex flex-col justify-between rounded-lg border border-[#e5e2dc] bg-white p-4 shadow-sm transition-all hover:border-[#2490ef] hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f8faf9] text-[#1674c4] group-hover:bg-[#e8f3ff]">
                    <sec.icon className="h-4 w-4" style={{ color: sec.color }} />
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#9ca3af] transition-transform group-hover:translate-x-1 group-hover:text-[#2490ef]" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#1f2937] group-hover:text-[#2490ef]">{sec.title}</h3>
                <p className="mt-1 text-xs text-[#6b7280] leading-relaxed">{sec.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, note, icon: Icon, tone, href }: any) {
  const tones: Record<string, string> = {
    blue: 'bg-[#e8f3ff] text-[#1674c4]',
    green: 'bg-[#eefaf3] text-[#0f9d58]',
    amber: 'bg-[#fff7ed] text-[#d98324]',
    purple: 'bg-[#f4f1ff] text-[#6350b8]',
  };
  return (
    <Link href={href} className="block rounded-lg border border-[#e5e2dc] bg-white p-4 shadow-sm transition-all hover:border-[#2490ef] hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#7c8591]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[#1f2937]">{value}</p>
          <p className="mt-0.5 text-xs text-[#6b7280]">{note}</p>
        </div>
        <span className={`rounded-md p-2 ${tones[tone] || tones.blue}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}

function StageBar({ label, count, pct, color }: { label: string; count: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-[#1f2937]">{label}</span>
        <span className="text-[#6b7280]">{count} ({pct}%)</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#f0ede8]">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
