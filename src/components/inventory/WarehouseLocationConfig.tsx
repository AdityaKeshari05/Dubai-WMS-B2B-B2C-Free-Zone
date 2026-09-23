'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Warehouse, MapPin, Layers, Grid3X3, Package, Thermometer,
  Settings2, Plus, Edit3, ChevronRight, ChevronDown, Search,
  Filter, AlertTriangle, CheckCircle2, Clock, Zap,
  Building2, Globe, ShieldCheck, Archive, SlidersHorizontal, Target,
  RefreshCcw, Move, Gauge, Lock, Unlock,
  AlertCircle, BadgeCheck, MapPinned, Cpu, Timer, ListOrdered,
  BarChart3, Save, RotateCcw, LayoutDashboard, Ruler, Sparkles,
  ArrowUpRight, Check, X, Wand2, Printer, QrCode, Compass, ListTree,
  Copy, Download, ArrowUp, ArrowDown
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

// ── Initial Mock Data ───────────────────────────────────────────────
const WAREHOUSES_INIT = [
  { id: 'wh-01', code: 'JAFZA-WH01', name: 'Jebel Ali Free Zone Warehouse - Hub A', type: 'Main', city: 'Dubai', state: 'Dubai Emirate', country: 'United Arab Emirates', category: 'Bonded', region: 'JAFZA South', address: 'Plot J-047, Jebel Ali FZ South, Dubai', gps: '25.0275 N, 55.0748 E', phone: '+971 4 881 4400', email: 'hub-a@oruswms.ae', timezone: 'Asia/Dubai', currency: 'AED', operatingHours: '06:00-22:00 (Sun-Thu)', status: 'ACTIVE', zones: 12, locations: 4840, capacity: 78 },
  { id: 'wh-02', code: 'DWC-WH02', name: 'Dubai South Logistics District - Hub B', type: 'Sub', city: 'Dubai', state: 'Dubai Emirate', country: 'United Arab Emirates', category: 'Non-Bonded', region: 'DWC Al Maktoum', address: 'Block B-211, Dubai South LD, Dubai', gps: '24.8969 N, 55.1592 E', phone: '+971 4 588 2200', email: 'hub-b@oruswms.ae', timezone: 'Asia/Dubai', currency: 'AED', operatingHours: '00:00-24:00 (24/7)', status: 'ACTIVE', zones: 8, locations: 3200, capacity: 65 },
  { id: 'wh-03', code: 'DXB-WH03', name: 'Dubai Mainland Central Depot - Al Quoz', type: 'Sub', city: 'Dubai', state: 'Dubai Emirate', country: 'United Arab Emirates', category: 'Mainland', region: 'Al Quoz Industrial 3', address: 'Street 14A, Al Quoz Industrial 3, Dubai', gps: '25.1467 N, 55.2211 E', phone: '+971 4 347 9988', email: 'alquoz@oruswms.ae', timezone: 'Asia/Dubai', currency: 'AED', operatingHours: '07:00-20:00 (Sun-Sat)', status: 'ACTIVE', zones: 6, locations: 1920, capacity: 91 },
  { id: 'wh-04', code: 'KIZAD-WH04', name: 'KIZAD Coastal Transit Yard - Abu Dhabi', type: '3PL', city: 'Abu Dhabi', state: 'Abu Dhabi Emirate', country: 'United Arab Emirates', category: 'Free Zone', region: 'Abu Dhabi Link', address: 'Zone 8, KIZAD Industrial Zone, AD', gps: '24.4539 N, 54.6055 E', phone: '+971 2 510 0022', email: 'kizad@oruswms.ae', timezone: 'Asia/Dubai', currency: 'AED', operatingHours: '08:00-18:00 (Sun-Thu)', status: 'INACTIVE', zones: 4, locations: 960, capacity: 42 },
];

const ZONES_INIT = [
  { id: 'zn-rcv', warehouseId: 'wh-01', code: 'ZN-RCV-01', name: 'Inbound Receiving Dock', type: 'Receiving', temperature: 'Ambient', maxWeight: 8000, maxVolume: 12000, isHazmat: false, isBonded: true, binCount: 48, occupancy: 41, status: 'ACTIVE', purpose: 'GRN staging, ASN check-in and dock-to-stock hold' },
  { id: 'zn-str', warehouseId: 'wh-01', code: 'ZN-STR-A', name: 'Reserve Storage — Bulk A', type: 'Storage', temperature: 'Ambient', maxWeight: 18000, maxVolume: 42000, isHazmat: false, isBonded: true, binCount: 1840, occupancy: 78, status: 'ACTIVE', purpose: 'Pallet reserve holding for slow and medium movers' },
  { id: 'zn-pck', warehouseId: 'wh-01', code: 'ZN-PCK-F', name: 'Forward Picking Face', type: 'Picking', temperature: 'Ambient', maxWeight: 3500, maxVolume: 9000, isHazmat: false, isBonded: true, binCount: 420, occupancy: 66, status: 'ACTIVE', purpose: 'Case and each-pick from carton-flow and pallet faces' },
  { id: 'zn-pkg', warehouseId: 'wh-01', code: 'ZN-PKG-01', name: 'Packing & VAS Bay', type: 'Packing', temperature: 'Ambient', maxWeight: 1200, maxVolume: 2400, isHazmat: false, isBonded: false, binCount: 36, occupancy: 52, status: 'ACTIVE', purpose: 'Order consolidation, labelling, kitting and gift wrap' },
  { id: 'zn-qtn', warehouseId: 'wh-01', code: 'ZN-QTN-QC', name: 'Quarantine / Quality Hold', type: 'Quarantine', temperature: 'Controlled 18C', maxWeight: 800, maxVolume: 1600, isHazmat: true, isBonded: true, binCount: 64, occupancy: 29, status: 'ACTIVE', purpose: 'Blocked stock, inspection hold and returns isolation' },
  { id: 'zn-dsp', warehouseId: 'wh-01', code: 'ZN-DSP-01', name: 'Outbound Dispatch Staging', type: 'Dispatch', temperature: 'Ambient', maxWeight: 6000, maxVolume: 10000, isHazmat: false, isBonded: false, binCount: 72, occupancy: 58, status: 'ACTIVE', purpose: 'Wave staging by carrier, route and cut-off window' },
  { id: 'zn-cld', warehouseId: 'wh-01', code: 'ZN-CLD-B', name: 'Chilled Storage 2–8°C', type: 'Storage', temperature: '2°C–8°C', maxWeight: 2000, maxVolume: 6000, isHazmat: false, isBonded: true, binCount: 120, occupancy: 88, status: 'ACTIVE', purpose: 'Pharma and perishable reserve storage' },
  { id: 'zn-005', warehouseId: 'wh-02', code: 'ZN-RCV-02', name: 'Automated Inbound Buffer', type: 'Receiving', temperature: 'Ambient', maxWeight: 10000, maxVolume: 18000, isHazmat: false, isBonded: false, binCount: 96, occupancy: 44, status: 'ACTIVE', purpose: 'AS/RS inbound induction' },
  { id: 'zn-006', warehouseId: 'wh-02', code: 'ZN-STR-HB', name: 'High-Bay Reserve Storage', type: 'Storage', temperature: 'Ambient', maxWeight: 24000, maxVolume: 60000, isHazmat: false, isBonded: false, binCount: 2400, occupancy: 61, status: 'ACTIVE', purpose: 'Double-deep pallet reserve' },
  { id: 'zn-007', warehouseId: 'wh-02', code: 'ZN-PCK-02', name: 'Goods-to-Person Picking', type: 'Picking', temperature: 'Ambient', maxWeight: 4000, maxVolume: 8000, isHazmat: false, isBonded: false, binCount: 280, occupancy: 55, status: 'ACTIVE', purpose: 'Shuttle tote picking' },
  { id: 'zn-008', warehouseId: 'wh-03', code: 'ZN-CLD-A', name: 'Frozen Storage −18°C', type: 'Storage', temperature: '−18°C to −24°C', maxWeight: 1500, maxVolume: 4000, isHazmat: false, isBonded: false, binCount: 200, occupancy: 94, status: 'ACTIVE', purpose: 'Frozen food reserve' },
  { id: 'zn-009', warehouseId: 'wh-03', code: 'ZN-DSP-03', name: 'Cold Dispatch Dock', type: 'Dispatch', temperature: '2°C–8°C', maxWeight: 900, maxVolume: 1800, isHazmat: false, isBonded: false, binCount: 24, occupancy: 71, status: 'ACTIVE', purpose: 'Reefer loading lanes' },
];

const LOCATIONS_INIT = [
  { id: 'loc-001', zoneId: 'zn-str', warehouseId: 'wh-01', code: 'JAFZA-WH01-STR-A-A03-R02-S1-B04', aisle: 'A03', rack: 'R02', shelf: 'S1', bin: 'B04', maxWeight: 500, maxVolume: 1500, currentWeight: 380, currentVolume: 940, velocityClass: 'A', isBonded: true, isLocked: false, status: 'OCCUPIED', pickSequence: 104, sku: 'SKU-ELEC-9042', skuName: 'Samsung Smart LED 65"', qty: 12, uom: 'PLT', lot: 'LOT-DXB-24091', expiry: '—' },
  { id: 'loc-002', zoneId: 'zn-str', warehouseId: 'wh-01', code: 'JAFZA-WH01-STR-A-A03-R02-S2-B01', aisle: 'A03', rack: 'R02', shelf: 'S2', bin: 'B01', maxWeight: 500, maxVolume: 1500, currentWeight: 0, currentVolume: 0, velocityClass: 'B', isBonded: true, isLocked: false, status: 'EMPTY', pickSequence: 105, sku: '—', skuName: 'Available slot', qty: 0, uom: 'PLT', lot: '—', expiry: '—' },
  { id: 'loc-003', zoneId: 'zn-cld', warehouseId: 'wh-01', code: 'JAFZA-WH01-CLD-B-B01-R01-S1-B01', aisle: 'B01', rack: 'R01', shelf: 'S1', bin: 'B01', maxWeight: 200, maxVolume: 600, currentWeight: 195, currentVolume: 575, velocityClass: 'A', isBonded: true, isLocked: false, status: 'NEAR_FULL', pickSequence: 201, sku: 'SKU-PHRM-0211', skuName: 'Paracetamol IV 500mg', qty: 48, uom: 'CTN', lot: 'LOT-PH-1182', expiry: '30 Nov 2026' },
  { id: 'loc-004', zoneId: 'zn-qtn', warehouseId: 'wh-01', code: 'JAFZA-WH01-QTN-QC-C01-R01-S1-B01', aisle: 'C01', rack: 'R01', shelf: 'S1', bin: 'B01', maxWeight: 100, maxVolume: 300, currentWeight: 42, currentVolume: 80, velocityClass: 'C', isBonded: true, isLocked: true, status: 'QUARANTINE', pickSequence: 301, sku: 'SKU-CHEM-1885', skuName: 'IPA 99% 20L Drum', qty: 2, uom: 'DRM', lot: 'LOT-HZ-044', expiry: '—' },
  { id: 'loc-005', zoneId: 'zn-pck', warehouseId: 'wh-01', code: 'JAFZA-WH01-PCK-F-D02-R03-S1-B07', aisle: 'D02', rack: 'R03', shelf: 'S1', bin: 'B07', maxWeight: 300, maxVolume: 900, currentWeight: 210, currentVolume: 650, velocityClass: 'A', isBonded: false, isLocked: false, status: 'OCCUPIED', pickSequence: 407, sku: 'SKU-APRL-3390', skuName: 'Polo Shirts Mixed Cartons', qty: 80, uom: 'CTN', lot: 'LOT-AP-7721', expiry: '—' },
  { id: 'loc-006', zoneId: 'zn-rcv', warehouseId: 'wh-01', code: 'JAFZA-WH01-RCV-01-G01-R01-S1-B02', aisle: 'G01', rack: 'R01', shelf: 'S1', bin: 'B02', maxWeight: 800, maxVolume: 2000, currentWeight: 260, currentVolume: 720, velocityClass: 'B', isBonded: true, isLocked: false, status: 'OCCUPIED', pickSequence: 12, sku: 'SKU-HOME-4410', skuName: 'IKEA MALM Chest (Inbound ASN)', qty: 18, uom: 'PLT', lot: 'ASN-98211', expiry: '—' },
  { id: 'loc-007', zoneId: 'zn-dsp', warehouseId: 'wh-01', code: 'JAFZA-WH01-DSP-01-H01-R01-S1-B01', aisle: 'H01', rack: 'R01', shelf: 'S1', bin: 'B01', maxWeight: 600, maxVolume: 1600, currentWeight: 310, currentVolume: 880, velocityClass: 'A', isBonded: false, isLocked: false, status: 'OCCUPIED', pickSequence: 901, sku: 'SKU-ELEC-1102', skuName: 'Wave #W-4418 · Aramex Lane', qty: 6, uom: 'PLT', lot: 'WAVE-4418', expiry: '—' },
  { id: 'loc-008', zoneId: 'zn-pkg', warehouseId: 'wh-01', code: 'JAFZA-WH01-PKG-01-K01-R01-S1-B03', aisle: 'K01', rack: 'R01', shelf: 'S1', bin: 'B03', maxWeight: 80, maxVolume: 240, currentWeight: 22, currentVolume: 60, velocityClass: 'A', isBonded: false, isLocked: false, status: 'OCCUPIED', pickSequence: 510, sku: 'ORD-77821', skuName: 'Order pack station 03', qty: 14, uom: 'EA', lot: '—', expiry: '—' },
];

const LOCATION_ATTRIBUTES_INIT = [
  { id: 'attr-001', code: 'JAFZA-WH01-STR-A-A03-R02-S1-B04', warehouseId: 'wh-01', zoneCode: 'ZN-STR-A', type: 'Pallet Position', width: 120, height: 160, depth: 100, cbm: 1.92, maxWeight: 1200, currentWeight: 840, temp: 'Ambient', hazmat: 'Non-Hazmat', highValueLock: false, forkliftAccess: true, mixSku: false, restriction: 'Pallet only · no mixed SKU', status: 'OCCUPIED' },
  { id: 'attr-002', code: 'JAFZA-WH01-CLD-B-B01-R01-S1-B01', warehouseId: 'wh-01', zoneCode: 'ZN-CLD-B', type: 'Carton Flow Rack', width: 80, height: 100, depth: 120, cbm: 0.96, maxWeight: 400, currentWeight: 390, temp: 'Chilled (2°C–8°C)', hazmat: 'Non-Hazmat', highValueLock: true, forkliftAccess: false, mixSku: false, restriction: 'Pharma FEFO · chilled only', status: 'NEAR_FULL' },
  { id: 'attr-003', code: 'JAFZA-WH01-QTN-QC-C01-R01-S1-B01', warehouseId: 'wh-01', zoneCode: 'ZN-QTN-QC', type: 'Cantilever Rack', width: 200, height: 180, depth: 100, cbm: 3.60, maxWeight: 1500, currentWeight: 42, temp: 'Controlled (18°C)', hazmat: 'Hazmat Class 3', highValueLock: true, forkliftAccess: true, mixSku: false, restriction: 'Quarantine lock · no pick', status: 'QUARANTINE' },
  { id: 'attr-004', code: 'DXB-WH03-CLD-A-A01-R01-S1-B01', warehouseId: 'wh-03', zoneCode: 'ZN-CLD-A', type: 'Bulk Floor Stack', width: 240, height: 200, depth: 200, cbm: 9.60, maxWeight: 5000, currentWeight: 4700, temp: 'Frozen (−18°C to −24°C)', hazmat: 'Non-Hazmat', highValueLock: false, forkliftAccess: true, mixSku: true, restriction: 'Frozen food · max 3 high', status: 'OCCUPIED' },
  { id: 'attr-005', code: 'DWC-WH02-STR-HB-A01-R01-S1-B01', warehouseId: 'wh-02', zoneCode: 'ZN-STR-HB', type: 'Small-Parts Drawer', width: 40, height: 30, depth: 60, cbm: 0.07, maxWeight: 50, currentWeight: 12, temp: 'Ambient', hazmat: 'Non-Hazmat', highValueLock: false, forkliftAccess: false, mixSku: true, restriction: 'Each-pick · no liquids', status: 'OCCUPIED' },
  { id: 'attr-006', code: 'JAFZA-WH01-STR-A-A03-R02-S2-B01', warehouseId: 'wh-01', zoneCode: 'ZN-STR-A', type: 'Pallet Position', width: 120, height: 160, depth: 100, cbm: 1.92, maxWeight: 1200, currentWeight: 0, temp: 'Ambient', hazmat: 'Non-Hazmat', highValueLock: false, forkliftAccess: true, mixSku: false, restriction: 'Pallet only · no mixed SKU', status: 'EMPTY' },
  { id: 'attr-007', code: 'JAFZA-WH01-PCK-F-D02-R03-S1-B07', warehouseId: 'wh-01', zoneCode: 'ZN-PCK-F', type: 'Carton Flow Rack', width: 80, height: 90, depth: 110, cbm: 0.79, maxWeight: 250, currentWeight: 210, temp: 'Ambient', hazmat: 'Non-Hazmat', highValueLock: false, forkliftAccess: false, mixSku: true, restriction: 'Forward pick · Class A only', status: 'OCCUPIED' },
];

const SLOTTING_RULES_INIT = [
  { id: 'r1', name: 'Fast-moving electronics to forward pick', priority: 1, condition: 'Velocity = A AND Category = Electronics', targetZone: 'ZN-PCK-F', targetShelf: 'S1–S2 (pick face)', strategy: 'FIFO', active: true },
  { id: 'r2', name: 'Chilled pharma — FEFO reserve', priority: 2, condition: 'Category = Pharma AND Temp = 2–8°C', targetZone: 'ZN-CLD-B', targetShelf: 'Any chilled slot', strategy: 'FEFO', active: true },
  { id: 'r3', name: 'Hazmat to quarantine isolation', priority: 3, condition: 'IsHazmat = true OR Inspection = HOLD', targetZone: 'ZN-QTN-QC', targetShelf: 'Locked bins only', strategy: 'LIFO', active: true },
  { id: 'r4', name: 'Slow-moving bulk to high rack', priority: 4, condition: 'Velocity = C AND Weight over 100 kg', targetZone: 'ZN-STR-A', targetShelf: 'S4–S6 (high rack)', strategy: 'FIFO', active: false },
  { id: 'r5', name: 'Cleared bonded goods to reserve', priority: 5, condition: 'IsBonded = true AND CustomsStatus = CLEARED', targetZone: 'ZN-STR-A', targetShelf: 'Any pallet position', strategy: 'FIFO', active: true },
];

const PUTAWAY_QUEUE = [
  { skuCode: 'SKU-ELEC-9042', skuName: 'Samsung Smart LED 65"', qty: 24, weight: 480, cls: 'A', bin: 'JAFZA-WH01-PCK-F-D02-R01-S1-B03', confidence: 97, reason: 'Class A velocity — nearest empty pick-face bin, FIFO aligned to dispatch dock' },
  { skuCode: 'SKU-PHRM-0211', skuName: 'Paracetamol IV 500mg (Carton)', qty: 600, weight: 120, cls: 'A', bin: 'JAFZA-WH01-CLD-B-B01-R01-S1-B02', confidence: 99, reason: 'FEFO chilled storage — expiry 30 Nov 2026, 2–8°C restriction match' },
  { skuCode: 'SKU-CHEM-1885', skuName: 'Isopropyl Alcohol 99% (20L Drums)', qty: 10, weight: 200, cls: 'C', bin: 'JAFZA-WH01-QTN-QC-C01-R01-S3-B01', confidence: 100, reason: 'Hazmat Class 3 — quarantine isolation until SDS and DG check complete' },
  { skuCode: 'SKU-APRL-3390', skuName: 'Polo Shirts Mixed Sizes (Cartons)', qty: 80, weight: 160, cls: 'B', bin: 'JAFZA-WH01-STR-A-A03-R02-S2-B01', confidence: 83, reason: 'Empty reserve pallet slot — mid-velocity Class B, no mix-SKU restriction' },
];

const WH_CFG_INIT: Record<string, any> = {
  'wh-01': { pickStrategy: 'FIFO', barcodeValidation: 'STRICT', tolerance: 2, cutoff: '18:00', morning: '06:00-14:00', afternoon: '14:00-22:00', supervisorOverride: true, autoSlotting: true, capacityAlerts: true, alertThreshold: 85 },
  'wh-02': { pickStrategy: 'FIFO', barcodeValidation: 'STRICT', tolerance: 0, cutoff: '22:00', morning: '00:00-08:00', afternoon: '08:00-16:00', supervisorOverride: true, autoSlotting: true, capacityAlerts: true, alertThreshold: 90 },
  'wh-03': { pickStrategy: 'FEFO', barcodeValidation: 'STANDARD', tolerance: 5, cutoff: '19:00', morning: '07:00-15:00', afternoon: '15:00-20:00', supervisorOverride: false, autoSlotting: false, capacityAlerts: true, alertThreshold: 80 },
  'wh-04': { pickStrategy: 'LIFO', barcodeValidation: 'RELAXED', tolerance: 10, cutoff: '17:00', morning: '08:00-14:00', afternoon: '14:00-18:00', supervisorOverride: false, autoSlotting: false, capacityAlerts: false, alertThreshold: 75 },
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
    OCCUPIED: 'bg-blue-50 text-blue-700 border-blue-200',
    EMPTY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    NEAR_FULL: 'bg-amber-50 text-amber-700 border-amber-200',
    QUARANTINE: 'bg-red-50 text-red-700 border-red-200',
  };
  const lbl: Record<string, string> = { ACTIVE: 'Active', MAINTENANCE: 'Maintenance', OCCUPIED: 'Occupied', EMPTY: 'Empty', NEAR_FULL: 'Near Full', QUARANTINE: 'Quarantine' };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{lbl[status] || status}</span>;
}

function Bar({ value }: { value: number }) {
  const c = value >= 90 ? 'bg-red-500' : value >= 75 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full ${c} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 w-8 text-right">{value}%</span>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${on ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 text-xs py-1">
      <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-800 truncate">{value}</span>
    </div>
  );
}

function ThermalSticker({
  locCode,
  whCode,
  zoneCode,
  aisle,
  rack,
  shelf,
  bin,
  pickSequence = 101,
}: {
  locCode: string;
  whCode: string;
  zoneCode: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  pickSequence?: number;
}) {
  return (
    <div className="w-[310px] bg-white border-2 border-slate-900 rounded p-3 font-mono shadow-md text-slate-900 relative select-none">
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="bg-slate-900 text-white px-1.5 py-0.5 text-[10px] font-bold rounded-xs tracking-wider">{whCode}</span>
          <span className="text-xs font-extrabold uppercase tracking-tight">{zoneCode}</span>
        </div>
        <div className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-900 px-1.5 py-0.5 rounded-xs">
          SEQ #{pickSequence}
        </div>
      </div>
      <div className="text-center my-2">
        <div className="text-2xl font-black tracking-tighter text-slate-900 font-mono">
          {aisle}-{rack}-{shelf}-{bin}
        </div>
        <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{locCode}</div>
      </div>
      <div className="flex items-center justify-between border-t border-dashed border-slate-400 pt-2 mt-2">
        <div className="flex-1 pr-2">
          <div className="h-9 w-full flex items-end justify-between px-1 bg-slate-50 border border-slate-300 py-1">
            {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4].map((w, i) => (
              <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }} />
            ))}
          </div>
          <p className="text-[9px] font-mono text-center mt-0.5 tracking-widest text-slate-600 font-semibold">CODE 128 BARCODE</p>
        </div>
        <div className="h-10 w-10 bg-slate-900 p-1 rounded-xs flex flex-col justify-between shrink-0">
          <div className="flex justify-between">
            <div className="w-2.5 h-2.5 bg-white border border-slate-900" />
            <div className="w-2.5 h-2.5 bg-white border border-slate-900" />
          </div>
          <div className="flex justify-between">
            <div className="w-2 h-2 bg-white" />
            <div className="w-2.5 h-2.5 bg-white border border-slate-900" />
          </div>
        </div>
      </div>
      <div className="mt-2 pt-1.5 border-t border-slate-900 flex items-center justify-between text-[9px] font-bold uppercase">
        <span className="flex items-center gap-1 text-slate-800">
          {shelf.includes('1') ? <ArrowDown className="h-3 w-3 text-amber-600" /> : <ArrowUp className="h-3 w-3 text-emerald-600" />}
          TIER LEVEL: {shelf}
        </span>
        <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-xs font-semibold">ZEBRA 4"x2" THERMAL</span>
      </div>
    </div>
  );
}

const TAB_ROUTES: Record<string, string> = {
  overview: '/warehouse-locations/overview',
  warehouses: '/warehouse-locations/warehouses',
  hierarchy: '/warehouse-locations/hierarchy',
  zones: '/warehouse-locations/zones',
  bins: '/warehouse-locations/bins',
  capacity: '/warehouse-locations/capacity',
  attributes: '/warehouse-locations/attributes',
  putaway: '/warehouse-locations/putaway',
  config: '/warehouse-locations/configuration',
};

const PAGE_TITLES: Record<string, { title: string }> = {
  overview: { title: 'Facility Overview' },
  warehouses: { title: 'Multi-Warehouse' },
  hierarchy: { title: 'Warehouse Hierarchy' },
  zones: { title: 'Storage Zones' },
  bins: { title: 'Bin-Level Inventory' },
  capacity: { title: 'Warehouse Capacity' },
  attributes: { title: 'Location Attributes' },
  putaway: { title: 'Putaway Rules' },
  config: { title: 'Warehouse Configuration' },
};

export default function WarehouseLocationConfig({ defaultTab = 'overview' }: { defaultTab?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState(defaultTab);
  const [warehouses, setWarehouses] = useState(WAREHOUSES_INIT);
  const [zones, setZones] = useState(ZONES_INIT);
  const [locs, setLocs] = useState(LOCATIONS_INIT);
  const [attributes, setAttributes] = useState(LOCATION_ATTRIBUTES_INIT);
  const [rules, setRules] = useState(SLOTTING_RULES_INIT);
  const [cfgs, setCfgs] = useState<Record<string, any>>(WH_CFG_INIT);
  const [whId, setWhId] = useState('wh-01');
  const [zType, setZType] = useState('ALL');
  const [lStat, setLStat] = useState('ALL');
  const [attrType, setAttrType] = useState('ALL');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ A03: true, B01: false });
  const [whModal, setWhModal] = useState(false);
  const [editWh, setEditWh] = useState<any>(null);
  const [zModal, setZModal] = useState(false);
  const [editZ, setEditZ] = useState<any>(null);
  const [lModal, setLModal] = useState(false);
  const [rModal, setRModal] = useState(false);
  const [attrModal, setAttrModal] = useState(false);
  const [editAttr, setEditAttr] = useState<any>(null);

  // ── Feature Specific States (2.1 to 2.8) ──
  const [whViewMode, setWhViewMode] = useState<'grid' | 'table'>('grid');
  const [binDetailLoc, setBinDetailLoc] = useState<any>(null);
  const [childNodeModal, setChildNodeModal] = useState<{ open: boolean; parentType: string; parentCode: string; level: string } | null>(null);
  const [childNodeForm, setChildNodeForm] = useState({ code: '', name: '', seq: 1, status: 'ACTIVE' });
  const [ruleWizardOpen, setRuleWizardOpen] = useState(false);
  const [ruleWizardStep, setRuleWizardStep] = useState<1 | 2 | 3>(1);
  const [ruleWizardForm, setRuleWizardForm] = useState({
    name: '',
    field: 'Category',
    operator: '=',
    value: 'Electronics',
    targetZone: 'ZN-STR-A',
    targetShelf: 'S1-S2',
    strategy: 'FIFO',
    priority: 1,
  });

  // ── Hierarchy Feature 2.2 States ──
  const [hierSubTab, setHierSubTab] = useState<'tree' | 'builder' | 'labels'>('tree');
  const [nomenConfig, setNomenConfig] = useState({
    separator: '-',
    aislePrefix: 'A',
    rackPrefix: 'R',
    shelfPrefix: 'S',
    binPrefix: 'B',
    zeroPadding: true,
  });
  const [builderForm, setBuilderForm] = useState({
    targetWh: 'wh-01',
    targetZone: 'zn-001',
    aisleFrom: 1,
    aisleTo: 2,
    rackFrom: 1,
    rackTo: 3,
    shelfFrom: 1,
    shelfTo: 3,
    binFrom: 1,
    binTo: 2,
    maxWeight: 500,
    cbm: 1.44,
    velocityClass: 'B',
    locationType: 'Standard Pallet Rack',
  });
  const [selectedLocNode, setSelectedLocNode] = useState<any>(null);
  const [labelPrintModal, setLabelPrintModal] = useState(false);
  const [labelFilterAisle, setLabelFilterAisle] = useState('ALL');

  // Sync internal tab state if defaultTab prop changes
  React.useEffect(() => {
    if (defaultTab && defaultTab !== tab) {
      setTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (val: string) => {
    setTab(val);
    const target = TAB_ROUTES[val];
    if (target && pathname !== target) {
      router.push(target);
    }
  };

  const selWH = warehouses.find(w => w.id === whId) || warehouses[0];
  const whZones = zones.filter(z => z.warehouseId === whId);
  const whLocs = locs.filter(l => l.warehouseId === whId);
  const whAttrs = attributes.filter(a => a.warehouseId === whId);
  const cfg = cfgs[whId] || {};

  const fZones = whZones.filter(z => zType === 'ALL' || z.type === zType);
  const fLocs = whLocs.filter(l => (lStat === 'ALL' || l.status === lStat) && (!q || l.code.toLowerCase().includes(q.toLowerCase())));
  const fAttrs = whAttrs.filter(a => (attrType === 'ALL' || a.type === attrType) && (!q || a.code.toLowerCase().includes(q.toLowerCase())));

  const hier: Record<string, Record<string, Record<string, string[]>>> = {};
  whLocs.forEach(l => {
    if (!hier[l.aisle]) hier[l.aisle] = {};
    if (!hier[l.aisle][l.rack]) hier[l.aisle][l.rack] = {};
    if (!hier[l.aisle][l.rack][l.shelf]) hier[l.aisle][l.rack][l.shelf] = [];
    if (!hier[l.aisle][l.rack][l.shelf].includes(l.bin)) hier[l.aisle][l.rack][l.shelf].push(l.bin);
  });

  const generateBulkLocations = (isPreview = false) => {
    const targetWhObj = warehouses.find(w => w.id === builderForm.targetWh);
    const targetZoneObj = zones.find(z => z.id === builderForm.targetZone);
    const whCode = targetWhObj ? targetWhObj.code : 'WH1';
    const zoneCode = targetZoneObj ? targetZoneObj.code : 'ZN-A';
    const sep = nomenConfig.separator;

    const newLocs: any[] = [];
    let seq = 100;
    for (let a = Number(builderForm.aisleFrom); a <= Number(builderForm.aisleTo); a++) {
      const aisleNum = nomenConfig.zeroPadding ? String(a).padStart(2, '0') : String(a);
      const aisleStr = `${nomenConfig.aislePrefix}${aisleNum}`;
      for (let r = Number(builderForm.rackFrom); r <= Number(builderForm.rackTo); r++) {
        const rackNum = nomenConfig.zeroPadding ? String(r).padStart(2, '0') : String(r);
        const rackStr = `${nomenConfig.rackPrefix}${rackNum}`;
        for (let s = Number(builderForm.shelfFrom); s <= Number(builderForm.shelfTo); s++) {
          const shelfStr = `${nomenConfig.shelfPrefix}${s}`;
          for (let b = Number(builderForm.binFrom); b <= Number(builderForm.binTo); b++) {
            const binNum = nomenConfig.zeroPadding ? String(b).padStart(2, '0') : String(b);
            const binStr = `${nomenConfig.binPrefix}${binNum}`;

            seq++;
            const code = `${whCode}${sep}${zoneCode}${sep}${aisleStr}${sep}${rackStr}${sep}${shelfStr}${sep}${binStr}`;
            newLocs.push({
              id: `loc-gen-${Date.now()}-${seq}-${Math.random().toString(36).substr(2, 4)}`,
              warehouseId: builderForm.targetWh,
              zoneId: builderForm.targetZone,
              code,
              aisle: aisleStr,
              rack: rackStr,
              shelf: shelfStr,
              bin: binStr,
              maxWeight: Number(builderForm.maxWeight),
              maxVolume: Math.round(Number(builderForm.cbm) * 1000),
              currentWeight: 0,
              currentVolume: 0,
              velocityClass: builderForm.velocityClass,
              isBonded: targetZoneObj?.isBonded ?? true,
              isLocked: false,
              status: 'EMPTY',
              pickSequence: seq,
            });

            if (isPreview && newLocs.length >= 20) return newLocs;
          }
        }
      }
    }
    return newLocs;
  };

  const handleRunBulkGenerate = () => {
    const generated = generateBulkLocations(false);
    setLocs(prev => [...prev, ...generated]);
    toast.success(`Generated ${generated.length} warehouse locations successfully!`);
    setHierSubTab('tree');
  };

  const setCfgVal = (k: string, v: any) => setCfgs(p => ({ ...p, [whId]: { ...p[whId], [k]: v } }));

  // ── Tab 1: Overview (Digital Twin Master View) ─────────────────────
  const tabOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button size="sm" className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700" onClick={() => { setEditWh(null); setWhModal(true); }}>
          <Plus className="h-3.5 w-3.5" /> Add Facility
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border border-gray-200 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
                <p className="text-xs text-gray-500">Active Facilities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{warehouses.reduce((s, w) => s + w.locations, 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Bins / Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(warehouses.reduce((s, w) => s + w.capacity, 0) / warehouses.length)}%
                </p>
                <p className="text-xs text-gray-500">Network Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{PUTAWAY_QUEUE.length}</p>
                <p className="text-xs text-gray-500">Pending Putaways</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facility Cards Grid */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Facility Hubs & Storage Profiles</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {warehouses.map(wh => (
            <Card key={wh.id} className="border border-gray-200 shadow-none hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                      <Warehouse className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{wh.name}</p>
                      <p className="text-xs font-mono text-blue-600 mt-0.5">{wh.code} · {wh.region}</p>
                    </div>
                  </div>
                  <StatusBadge status={wh.status} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 my-3 text-xs">
                  <Row label="Type" value={wh.type} icon={Building2} />
                  <Row label="Category" value={wh.category} icon={ShieldCheck} />
                  <Row label="Hours" value={wh.operatingHours} icon={Clock} />
                  <Row label="GPS" value={wh.gps} icon={MapPinned} />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{wh.zones} zones · {wh.locations.toLocaleString()} locations</span>
                    <span className="font-semibold text-gray-700">Capacity: {wh.capacity}%</span>
                  </div>
                  <Bar value={wh.capacity} />
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-500">Currency: <strong className="text-gray-800">{wh.currency}</strong></span>
                  <span className="text-gray-500 font-mono text-[11px]">{wh.phone}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Tab 2: Warehouses (Feature 2.1) ────────────────────────────────
  const tabWH = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={whViewMode === 'grid' ? 'default' : 'outline'}
            className="h-8 text-xs gap-1.5"
            onClick={() => setWhViewMode('grid')}
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Grid View
          </Button>
          <Button
            size="sm"
            variant={whViewMode === 'table' ? 'default' : 'outline'}
            className="h-8 text-xs gap-1.5"
            onClick={() => setWhViewMode('table')}
          >
            <ListOrdered className="h-3.5 w-3.5" /> Table View
          </Button>
        </div>
        <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 h-8 text-xs" onClick={() => { setEditWh(null); setWhModal(true); }}>
          <Plus className="h-3.5 w-3.5" /> + Add Warehouse
        </Button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: 'Total Facilities', v: warehouses.length, i: Building2, c: 'text-blue-600 bg-blue-50' },
          { l: 'Active Facilities', v: warehouses.filter(w => w.status === 'ACTIVE').length, i: CheckCircle2, c: 'text-emerald-600 bg-emerald-50' },
          { l: 'Total Storage Zones', v: warehouses.reduce((s, w) => s + w.zones, 0), i: Layers, c: 'text-purple-600 bg-purple-50' },
          { l: 'Total Bins & Locations', v: warehouses.reduce((s, w) => s + w.locations, 0).toLocaleString(), i: MapPin, c: 'text-orange-600 bg-orange-50' }
        ].map(st => (
          <Card key={st.l} className="border border-gray-200 shadow-none">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${st.c} flex items-center justify-center`}><st.i className="h-4 w-4" /></div>
                <div><p className="text-xl font-bold text-gray-900">{st.v}</p><p className="text-xs text-gray-500">{st.l}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid View */}
      {whViewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2">
          {warehouses.map(wh => (
            <Card key={wh.id} className={`border shadow-none transition-all hover:shadow-md ${whId === wh.id ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
                      <Warehouse className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{wh.name}</p>
                      <p className="text-xs font-mono text-blue-600 mt-0.5">{wh.code} · {wh.city || wh.region}, {wh.country || 'UAE'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={wh.status} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] gap-1"
                      onClick={() => {
                        setWhId(wh.id);
                        handleTabChange('hierarchy');
                      }}
                    >
                      Hierarchy <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 my-3 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <Row label="Type" value={wh.type || 'Main'} icon={Building2} />
                  <Row label="City / Location" value={`${wh.city || 'Dubai'}, ${wh.country || 'UAE'}`} icon={MapPinned} />
                  <Row label="Operating Hours" value={wh.operatingHours} icon={Clock} />
                  <Row label="Zones Count" value={`${wh.zones} Storage Zones`} icon={Layers} />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{wh.locations.toLocaleString()} Bins Mapped</span>
                    <span className="font-semibold text-gray-700">Capacity: {wh.capacity}%</span>
                  </div>
                  <Bar value={wh.capacity} />
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-500 font-mono text-[11px]">{wh.address}</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-gray-600 hover:text-gray-900 px-2"
                      onClick={() => { setEditWh(wh); setWhModal(true); }}
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-7 text-xs px-2 ${wh.status === 'ACTIVE' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      onClick={() => {
                        setWarehouses(p => p.map(w => w.id === wh.id ? { ...w, status: w.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : w));
                        toast.success(`Warehouse ${wh.code} ${wh.status === 'ACTIVE' ? 'deactivated' : 'activated'}`);
                      }}
                    >
                      {wh.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {whViewMode === 'table' && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Warehouse Name', 'Code', 'Location / City', 'Type', 'Zones', 'Bins', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {warehouses.map(wh => (
                <tr key={wh.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-xs">{wh.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{wh.address}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-blue-600 font-bold">{wh.code}</td>
                  <td className="px-4 py-3 text-gray-700">{wh.city || 'Dubai'}, {wh.country || 'UAE'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${wh.type === 'Main' ? 'bg-blue-50 text-blue-700 border-blue-200' : wh.type === '3PL' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {wh.type || 'Main'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{wh.zones} Zones</td>
                  <td className="px-4 py-3 text-gray-800 font-mono">{wh.locations.toLocaleString()} Bins</td>
                  <td className="px-4 py-3"><StatusBadge status={wh.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2 gap-1 text-blue-600 border-blue-200 bg-blue-50"
                        onClick={() => {
                          setWhId(wh.id);
                          handleTabChange('hierarchy');
                        }}
                      >
                        Hierarchy <ArrowUpRight className="h-3 w-3" />
                      </Button>
                      <button className="p-1 rounded hover:bg-gray-100 text-gray-500" onClick={() => { setEditWh(wh); setWhModal(true); }}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={`p-1 rounded hover:bg-gray-100 ${wh.status === 'ACTIVE' ? 'text-amber-500' : 'text-emerald-600'}`}
                        onClick={() => {
                          setWarehouses(p => p.map(w => w.id === wh.id ? { ...w, status: w.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : w));
                          toast.success(`Warehouse ${wh.code} ${wh.status === 'ACTIVE' ? 'deactivated' : 'activated'}`);
                        }}
                      >
                        {wh.status === 'ACTIVE' ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ── Tab 3: Hierarchy (Feature 2.2) ────────────────────────────────
  const tabHierarchy = () => {
    const previewLocs = generateBulkLocations(true);
    const totalCalc = (Number(builderForm.aisleTo) - Number(builderForm.aisleFrom) + 1) *
      (Number(builderForm.rackTo) - Number(builderForm.rackFrom) + 1) *
      (Number(builderForm.shelfTo) - Number(builderForm.shelfFrom) + 1) *
      (Number(builderForm.binTo) - Number(builderForm.binFrom) + 1);

    const activeNode = selectedLocNode || whLocs[0] || {
      code: `${selWH?.code}-ZN-BULK-A-A03-R02-S1-B04`,
      aisle: 'A03',
      rack: 'R02',
      shelf: 'S1',
      bin: 'B04',
      maxWeight: 500,
      currentWeight: 380,
      maxVolume: 1500,
      currentVolume: 940,
      velocityClass: 'A',
      status: 'OCCUPIED',
      pickSequence: 104,
    };

    return (
      <div className="space-y-5">
        {/* Top Control Header & Sub-Tab Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 text-white p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setHierSubTab('tree')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                hierSubTab === 'tree' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ListTree className="h-3.5 w-3.5" /> Visual Topology Tree
            </button>
            <button
              onClick={() => setHierSubTab('builder')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                hierSubTab === 'builder' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Wand2 className="h-3.5 w-3.5 text-amber-300" /> Rapid Hierarchy Builder
            </button>
            <button
              onClick={() => setHierSubTab('labels')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                hierSubTab === 'labels' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Printer className="h-3.5 w-3.5 text-emerald-300" /> Nomenclature & Labels
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Facility:</span>
            <Select value={whId} onValueChange={setWhId}>
              <SelectTrigger className="w-48 h-8 text-xs bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Sub-Tab 1: Visual Topology Tree & Node Inspector ── */}
        {hierSubTab === 'tree' && (
          <div className="space-y-5">
            {/* Structural Breadcrumb Ribbon */}
            <div className="flex items-center justify-between gap-2 text-xs bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-200">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Warehouse className="h-4 w-4 text-blue-600" /><span className="font-bold text-blue-700">{selWH?.code}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" /><Layers className="h-4 w-4 text-purple-600" /><span className="font-medium text-purple-700">Storage Zone</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" /><Grid3X3 className="h-4 w-4 text-amber-600" /><span className="font-medium text-amber-700">Aisle (Corridor)</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium text-orange-600">Rack (Steel Bay)</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium text-rose-600">Shelf (Tier/Level)</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" /><MapPin className="h-4 w-4 text-red-600" /><span className="font-semibold text-red-600">Bin Slot (Leaf)</span>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
                Pick Path Index: Serpentine Continuous
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-12">
              {/* Left Column: Interactive Hierarchy Tree Explorer (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                      <Grid3X3 className="h-4 w-4 text-blue-600" /> Physical 3D Topology Tree — {selWH?.code}
                    </CardTitle>
                    <span className="text-xs text-slate-500 font-medium">{whLocs.length} Bins Mapped</span>
                  </CardHeader>
                  <CardContent className="pt-4 font-mono text-xs space-y-2 max-h-[600px] overflow-y-auto">
                    {Object.entries(hier).length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        No structural nodes mapped for this warehouse yet. Use the Rapid Builder to generate hierarchy.
                      </div>
                    ) : (
                      Object.entries(hier).map(([aisle, racks]) => (
                        <div key={aisle} className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                          <button
                            className="flex items-center justify-between w-full text-amber-800 font-bold py-1 px-2 rounded hover:bg-amber-100/60 transition-colors"
                            onClick={() => setExpanded(p => ({ ...p, [aisle]: !p[aisle] }))}
                          >
                            <span className="flex items-center gap-2">
                              {expanded[aisle] ? <ChevronDown className="h-4 w-4 text-amber-600" /> : <ChevronRight className="h-4 w-4 text-amber-600" />}
                              <Grid3X3 className="h-4 w-4 text-amber-600" /> Aisle {aisle}
                            </span>
                            <span className="text-[11px] font-normal text-slate-500">Corridor Route #{aisle}</span>
                          </button>

                          {expanded[aisle] && (
                            <div className="ml-4 mt-2 space-y-2 border-l-2 border-amber-200 pl-3">
                              {Object.entries(racks).map(([rack, shelves]) => (
                                <div key={rack} className="bg-white rounded border border-slate-200 p-2">
                                  <div className="flex items-center gap-1.5 text-orange-700 font-semibold mb-1.5">
                                    <ChevronRight className="h-3.5 w-3.5 text-orange-500" /> Rack / Bay {rack}
                                  </div>
                                  <div className="ml-3 space-y-1.5">
                                    {Object.entries(shelves).map(([shelf, bins]) => (
                                      <div key={shelf} className="flex flex-col gap-1 py-1 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-rose-700 text-[11px] font-medium">
                                          <ChevronRight className="h-3 w-3 text-rose-400" /> Shelf Level {shelf}
                                          <span className="text-slate-400 text-[10px]">({bins.length} Slots)</span>
                                        </div>
                                        <div className="flex gap-1.5 flex-wrap ml-4 mt-0.5">
                                          {bins.map(bin => {
                                            const loc = whLocs.find(l => l.bin === bin && l.shelf === shelf && l.rack === rack && l.aisle === aisle);
                                            const isSelected = activeNode?.code === loc?.code;
                                            return (
                                              <button
                                                key={bin}
                                                onClick={() => loc && setSelectedLocNode(loc)}
                                                className={`rounded px-2 py-1 text-[11px] font-mono border transition-all flex items-center gap-1 ${
                                                  isSelected ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 font-bold' :
                                                  loc?.status === 'EMPTY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                                                  loc?.status === 'QUARANTINE' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                                                  loc?.status === 'NEAR_FULL' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                                                  'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                }`}
                                              >
                                                <span>{bin}</span>
                                                {loc?.pickSequence && <span className="opacity-75 text-[9px]">#{loc.pickSequence}</span>}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Node Details & Live Label Preview Inspector (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="border border-slate-200 shadow-sm sticky top-4">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-900">
                      <span className="flex items-center gap-2">
                        <Compass className="h-4 w-4 text-blue-600" /> Bin Node Inspector
                      </span>
                      <StatusBadge status={activeNode.status} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Node Identifier */}
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Full Location Code</Label>
                      <p className="font-mono text-sm font-bold text-slate-900 bg-slate-100 p-2 rounded border border-slate-200 mt-1 break-all select-all">
                        {activeNode.code}
                      </p>
                    </div>

                    {/* Coordinate Grid Breakdown */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-amber-50 border border-amber-200 rounded p-2">
                        <p className="text-[10px] text-amber-700 font-medium">Aisle</p>
                        <p className="font-mono font-bold text-amber-900 text-sm">{activeNode.aisle}</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded p-2">
                        <p className="text-[10px] text-orange-700 font-medium">Rack</p>
                        <p className="font-mono font-bold text-orange-900 text-sm">{activeNode.rack}</p>
                      </div>
                      <div className="bg-rose-50 border border-rose-200 rounded p-2">
                        <p className="text-[10px] text-rose-700 font-medium">Shelf Tier</p>
                        <p className="font-mono font-bold text-rose-900 text-sm">{activeNode.shelf}</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-[10px] text-blue-700 font-medium">Bin Slot</p>
                        <p className="font-mono font-bold text-blue-900 text-sm">{activeNode.bin}</p>
                      </div>
                    </div>

                    {/* Pick Path & Physical Attributes */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Pick Sequence Index:</span>
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Serpentine #{activeNode.pickSequence || 104}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Velocity Class:</span>
                        <span className="font-bold text-slate-800">Class {activeNode.velocityClass || 'B'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Max Weight Capacity:</span>
                        <span className="font-medium text-slate-800">{activeNode.maxWeight || 500} kg</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Volume Capacity:</span>
                        <span className="font-medium text-slate-800">{activeNode.maxVolume || 1500} Liters</span>
                      </div>
                    </div>

                    {/* Industrial Thermal Sticker Preview */}
                    <div className="pt-3 border-t border-slate-100">
                      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        Zebra Thermal Label Sticker Preview
                      </Label>
                      <div className="flex justify-center p-2 bg-slate-100 rounded-lg border border-slate-200">
                        <ThermalSticker
                          locCode={activeNode.code}
                          whCode={selWH?.code || 'WH1'}
                          zoneCode="ZN-BULK-A"
                          aisle={activeNode.aisle}
                          rack={activeNode.rack}
                          shelf={activeNode.shelf}
                          bin={activeNode.bin}
                          pickSequence={activeNode.pickSequence || 104}
                        />
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 gap-2 bg-slate-900 hover:bg-slate-800 text-white"
                        onClick={() => toast.success(`Sending thermal label job for ${activeNode.code} to Zebra ZT411 Printer...`)}
                      >
                        <Printer className="h-4 w-4" /> Print Industrial Sticker Label
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── Sub-Tab 2: Rapid Hierarchy Builder (Bulk Location Generator Wizard) ── */}
        {hierSubTab === 'builder' && (
          <div className="space-y-5">
            <Card className="border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/40 shadow-none">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Rapid Bulk Location Generator Wizard</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Avoid creating thousands of locations manually. Specify aisle, rack, shelf, and bin ranges to execute a single bulk database transaction generating full coordinate nodes, snake pick path sequences, and barcode codes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 md:grid-cols-12">
              {/* Form Input Parameters (7 Cols) */}
              <div className="md:col-span-7 space-y-4">
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-blue-600" /> Hierarchy Range Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Target Warehouse</Label>
                        <Select value={builderForm.targetWh} onValueChange={v => setBuilderForm(p => ({ ...p, targetWh: v }))}>
                          <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Target Storage Zone</Label>
                        <Select value={builderForm.targetZone} onValueChange={v => setBuilderForm(p => ({ ...p, targetZone: v }))}>
                          <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>{whZones.map(z => <SelectItem key={z.id} value={z.id}>{z.name} ({z.code})</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Aisle Range</Label>
                        <div className="flex items-center gap-1 mt-1">
                          <Input type="number" min={1} value={builderForm.aisleFrom} onChange={e => setBuilderForm(p => ({ ...p, aisleFrom: parseInt(e.target.value) || 1 }))} className="h-8 text-xs font-mono text-center" />
                          <span className="text-xs text-slate-400">to</span>
                          <Input type="number" min={1} value={builderForm.aisleTo} onChange={e => setBuilderForm(p => ({ ...p, aisleTo: parseInt(e.target.value) || 1 }))} className="h-8 text-xs font-mono text-center" />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Rack Range</Label>
                        <div className="flex items-center gap-1 mt-1">
                          <Input type="number" min={1} value={builderForm.rackFrom} onChange={e => setBuilderForm(p => ({ ...p, rackFrom: parseInt(e.target.value) || 1 }))} className="h-8 text-xs font-mono text-center" />
                          <span className="text-xs text-slate-400">to</span>
                          <Input type="number" min={1} value={builderForm.rackTo} onChange={e => setBuilderForm(p => ({ ...p, rackTo: parseInt(e.target.value) || 1 }))} className="h-8 text-xs font-mono text-center" />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Shelf Range</Label>
                        <div className="flex items-center gap-1 mt-1">
                          <Input type="number" min={1} value={builderForm.shelfFrom} onChange={e => setBuilderForm(p => ({ ...p, shelfFrom: parseInt(e.target.value) || 1 }))} className="h-8 text-xs font-mono text-center" />
                          <span className="text-xs text-slate-400">to</span>
                          <Input type="number" min={1} value={builderForm.shelfTo} onChange={e => setBuilderForm(p => ({ ...p, shelfTo: parseInt(e.target.value) || 1 }))} className="h-8 text-xs font-mono text-center" />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Bin Range</Label>
                        <div className="flex items-center gap-1 mt-1">
                          <Input type="number" min={1} value={builderForm.binFrom} onChange={e => setBuilderForm(p => ({ ...p, binFrom: parseInt(e.target.value) || 1 }))} className="h-8 text-xs font-mono text-center" />
                          <span className="text-xs text-slate-400">to</span>
                          <Input type="number" min={1} value={builderForm.binTo} onChange={e => setBuilderForm(p => ({ ...p, binTo: parseInt(e.target.value) || 1 }))} className="h-8 text-xs font-mono text-center" />
                        </div>
                      </div>
                    </div>

                    {/* Default Physical Attributes */}
                    <div className="pt-3 border-t border-slate-100">
                      <h5 className="text-xs font-bold text-slate-900 mb-2">Default Physical & Storage Attributes</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[11px] text-slate-600">Max Weight (kg)</Label>
                          <Input type="number" value={builderForm.maxWeight} onChange={e => setBuilderForm(p => ({ ...p, maxWeight: Number(e.target.value) }))} className="h-8 text-xs mt-1" />
                        </div>
                        <div>
                          <Label className="text-[11px] text-slate-600">Dimensions (CBM)</Label>
                          <Input type="number" step="0.1" value={builderForm.cbm} onChange={e => setBuilderForm(p => ({ ...p, cbm: Number(e.target.value) }))} className="h-8 text-xs mt-1" />
                        </div>
                        <div>
                          <Label className="text-[11px] text-slate-600">Velocity Class</Label>
                          <Select value={builderForm.velocityClass} onValueChange={v => setBuilderForm(p => ({ ...p, velocityClass: v }))}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Class A (Fast Moving)</SelectItem>
                              <SelectItem value="B">Class B (Medium)</SelectItem>
                              <SelectItem value="C">Class C (Slow)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Calculated Combination:</p>
                        <p className="text-lg font-bold text-blue-600 font-mono">{totalCalc.toLocaleString()} Bins</p>
                      </div>
                      <Button onClick={handleRunBulkGenerate} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2">
                        <Zap className="h-4 w-4" /> Run Batch Database Transaction
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Table of First 20 Generated Codes (5 Cols) */}
              <div className="md:col-span-5 space-y-4">
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" /> Live Preview (First 20 Codes)
                    </CardTitle>
                    <span className="text-[11px] font-mono text-slate-400">Total: {totalCalc}</span>
                  </CardHeader>
                  <CardContent className="pt-2 p-0 overflow-hidden">
                    <div className="max-h-[440px] overflow-y-auto">
                      <table className="w-full text-xs font-mono">
                        <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-600">Seq #</th>
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-600">Generated Barcode</th>
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-600">Max Wt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewLocs.map((loc, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-500 text-[11px]">#{loc.pickSequence}</td>
                              <td className="px-3 py-2 font-bold text-blue-700 text-[11px]">{loc.code}</td>
                              <td className="px-3 py-2 text-slate-600 text-[11px]">{loc.maxWeight} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── Sub-Tab 3: Nomenclature Generator & Thermal Label Studio ── */}
        {hierSubTab === 'labels' && (
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-12">
              {/* Nomenclature Formatter Configurator (5 Cols) */}
              <div className="md:col-span-5 space-y-4">
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-blue-600" /> Nomenclature Rule Configurator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Naming Template Pattern</Label>
                      <p className="font-mono text-xs font-bold text-slate-900 bg-slate-100 p-2 rounded border border-slate-200 mt-1">
                        [WH_CODE]{nomenConfig.separator}[ZONE]{nomenConfig.separator}[AISLE]{nomenConfig.separator}[RACK]{nomenConfig.separator}[SHELF]{nomenConfig.separator}[BIN]
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Code Separator</Label>
                        <Select value={nomenConfig.separator} onValueChange={v => setNomenConfig(p => ({ ...p, separator: v }))}>
                          <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="-">Hyphen (-)</SelectItem>
                            <SelectItem value="/">Slash (/)</SelectItem>
                            <SelectItem value=".">Dot (.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Zero-Padded Numbers</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Toggle on={nomenConfig.zeroPadding} onChange={v => setNomenConfig(p => ({ ...p, zeroPadding: v }))} />
                          <span className="text-xs text-slate-600 font-mono">{nomenConfig.zeroPadding ? '01 vs 1' : '1 vs 01'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <Label className="text-xs text-slate-600">Aisle Prefix</Label>
                        <Input value={nomenConfig.aislePrefix} onChange={e => setNomenConfig(p => ({ ...p, aislePrefix: e.target.value }))} className="h-8 text-xs font-mono mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Rack Prefix</Label>
                        <Input value={nomenConfig.rackPrefix} onChange={e => setNomenConfig(p => ({ ...p, rackPrefix: e.target.value }))} className="h-8 text-xs font-mono mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Shelf Prefix</Label>
                        <Input value={nomenConfig.shelfPrefix} onChange={e => setNomenConfig(p => ({ ...p, shelfPrefix: e.target.value }))} className="h-8 text-xs font-mono mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Bin Prefix</Label>
                        <Input value={nomenConfig.binPrefix} onChange={e => setNomenConfig(p => ({ ...p, binPrefix: e.target.value }))} className="h-8 text-xs font-mono mt-1" />
                      </div>
                    </div>

                    <Button className="w-full h-8 text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white" onClick={() => toast.success('Saved location nomenclature system rule!')}>
                      <Save className="h-3.5 w-3.5" /> Save Nomenclature Rules
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Thermal Label Printing Studio Grid (7 Cols) */}
              <div className="md:col-span-7 space-y-4">
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Printer className="h-4 w-4 text-emerald-600" /> Thermal Label Studio & Batch Print
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={labelFilterAisle} onValueChange={setLabelFilterAisle}>
                        <SelectTrigger className="w-32 h-7 text-[11px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Aisles</SelectItem>
                          <SelectItem value="A03">Aisle A03</SelectItem>
                          <SelectItem value="B01">Aisle B01</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => toast.success(`Sending ${whLocs.length} labels to Zebra industrial spooler...`)}>
                        <Printer className="h-3 w-3" /> Print Batch ({whLocs.length})
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-1">
                      {whLocs
                        .filter(l => labelFilterAisle === 'ALL' || l.aisle === labelFilterAisle)
                        .map(loc => (
                          <div key={loc.id} className="flex flex-col items-center">
                            <ThermalSticker
                              locCode={loc.code}
                              whCode={selWH?.code || 'WH1'}
                              zoneCode="ZN-A"
                              aisle={loc.aisle}
                              rack={loc.rack}
                              shelf={loc.shelf}
                              bin={loc.bin}
                              pickSequence={loc.pickSequence || 101}
                            />
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-slate-500 hover:text-slate-900 mt-1" onClick={() => toast.success(`Printing sticker for ${loc.code}`)}>
                              Print Single Sticker
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Tab 4: Storage Zones (Feature 2.3) ─────────────────────────────
  const tabZones = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={zType} onValueChange={setZType}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Zone Type..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Zone Types</SelectItem>
              <SelectItem value="Receiving">Receiving</SelectItem>
              <SelectItem value="Storage">Storage</SelectItem>
              <SelectItem value="Picking">Picking</SelectItem>
              <SelectItem value="Packing">Packing</SelectItem>
              <SelectItem value="Quarantine">Quarantine</SelectItem>
              <SelectItem value="Dispatch">Dispatch</SelectItem>
            </SelectContent>
          </Select>
          <Select value={whId} onValueChange={setWhId}>
            <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button size="sm" className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => { setEditZ(null); setZModal(true); }}>
          <Plus className="h-3.5 w-3.5" /> + Add Zone
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Zone Name & Code', 'Zone Type', 'Associated Warehouse', 'Capacity Limit', 'Occupancy', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fZones.map(z => {
              const whObj = warehouses.find(w => w.id === z.warehouseId);
              const typeColorMap: Record<string, string> = {
                Receiving: 'bg-purple-50 text-purple-700 border-purple-200',
                Storage: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                Picking: 'bg-blue-50 text-blue-700 border-blue-200',
                Packing: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                Quarantine: 'bg-red-50 text-red-700 border-red-200',
                Dispatch: 'bg-amber-50 text-amber-700 border-amber-200',
              };
              return (
                <tr key={z.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900 text-xs">{z.name}</p>
                    <p className="font-mono text-[11px] text-blue-600 mt-0.5">{z.code}</p>
                    {z.purpose && <p className="text-[10px] text-gray-400 mt-0.5">{z.purpose}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${typeColorMap[z.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {z.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {whObj ? whObj.code : z.warehouseId}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <p className="font-semibold">{z.maxWeight.toLocaleString()} kg</p>
                    <p className="text-gray-400 text-[10px]">{z.binCount} Bins</p>
                  </td>
                  <td className="px-4 py-3 w-36">
                    <Bar value={z.occupancy} />
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={z.status || 'ACTIVE'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-gray-100 text-gray-500" onClick={() => { setEditZ(z); setZModal(true); }}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {fZones.length === 0 && <p className="py-12 text-center text-sm text-gray-500">No storage zones found for selected filter.</p>}
      </div>
    </div>
  );

  // ── Tab 5: Bin-Level Inventory (Feature 2.4) ───────────────────────
  const tabBins = () => {
    const totalBins = whLocs.length;
    const occupiedBins = whLocs.filter(l => l.status === 'OCCUPIED' || l.status === 'NEAR_FULL').length;
    const emptyBins = whLocs.filter(l => l.status === 'EMPTY').length;

    return (
      <div className="space-y-4">
        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-3 bg-slate-900 text-white p-3.5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 border-r border-slate-800 pr-3">
            <div className="h-9 w-9 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-sm">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{totalBins}</p>
              <p className="text-[11px] text-slate-400">Total Bins</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-r border-slate-800 pr-3">
            <div className="h-9 w-9 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-sm">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{occupiedBins}</p>
              <p className="text-[11px] text-slate-400">Occupied Bins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{emptyBins}</p>
              <p className="text-[11px] text-slate-400">Empty Bins</p>
            </div>
          </div>
        </div>

        {/* Top Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search Product / SKU / Bin..." className="pl-8 h-8 text-xs w-56" />
            </div>
            <Select value={whId} onValueChange={setWhId}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={lStat} onValueChange={setLStat}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="EMPTY">Empty</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="NEAR_FULL">Near Full</SelectItem>
                <SelectItem value="QUARANTINE">Quarantine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => setLModal(true)}>
            <Plus className="h-3.5 w-3.5" /> + Add Location
          </Button>
        </div>

        {/* Table View */}
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Bin ID / Location Code', 'Warehouse', 'Zone', 'Product / Stored SKU', 'Quantity', 'Unit (UOM)', 'Last Updated', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fLocs.map(loc => {
                const whObj = warehouses.find(w => w.id === loc.warehouseId);
                const znObj = zones.find(z => z.id === loc.zoneId);
                return (
                  <tr
                    key={loc.id}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    onClick={() => setBinDetailLoc(loc)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-[11px] font-bold text-blue-700">{loc.code}</p>
                      <p className="text-[10px] text-gray-400 font-mono">Path: {loc.aisle}-{loc.rack}-{loc.shelf}-{loc.bin}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{whObj ? whObj.code : selWH?.code}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{znObj ? znObj.code : 'ZN-STR-A'}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{loc.skuName || 'Available Slot'}</p>
                      <p className="font-mono text-[10px] text-blue-600">{loc.sku || '—'}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-xs">{loc.qty ?? 0}</td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-[11px]">{loc.uom || 'PLT'}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-[10px]">Today, 15:30</td>
                    <td className="px-4 py-3"><StatusBadge status={loc.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {fLocs.length === 0 && <p className="py-12 text-center text-sm text-gray-500">No bin inventory records match search.</p>}
        </div>

        {/* Bin Inventory Side Panel Drawer Modal */}
        {binDetailLoc && (
          <Dialog open={!!binDetailLoc} onOpenChange={() => setBinDetailLoc(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between text-base">
                  <span className="font-mono font-bold text-blue-700">{binDetailLoc.code}</span>
                  <StatusBadge status={binDetailLoc.status} />
                </DialogTitle>
                <DialogDescription>Stored inventory SKU breakdown and bin capacity ledger.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">Max Weight</p>
                    <p className="font-mono font-bold text-slate-900 text-xs">{binDetailLoc.maxWeight || 500} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">Current Load</p>
                    <p className="font-mono font-bold text-blue-600 text-xs">{binDetailLoc.currentWeight || 0} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">Velocity Class</p>
                    <p className="font-mono font-bold text-slate-900 text-xs">Class {binDetailLoc.velocityClass || 'B'}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-blue-600" /> Stored Inventory Items
                  </h5>

                  {binDetailLoc.qty > 0 ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-600">SKU Code</th>
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-600">Product Name</th>
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-600">Lot / Batch</th>
                            <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-600">Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          <tr>
                            <td className="px-3 py-2 text-blue-700 font-bold">{binDetailLoc.sku}</td>
                            <td className="px-3 py-2 font-sans font-medium text-slate-900">{binDetailLoc.skuName}</td>
                            <td className="px-3 py-2 text-slate-600 text-[11px]">{binDetailLoc.lot || 'LOT-2026-X'}</td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900">{binDetailLoc.qty} {binDetailLoc.uom || 'EA'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Bin is currently empty</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Ready for putaway assignment</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button size="sm" variant="outline" onClick={() => setBinDetailLoc(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  // ── Tab 6: Capacity (Feature 2.5) ──────────────────────────────────
  const tabCapacity = () => (
    <div className="space-y-4">
      {/* Warehouse Cards Dashboard */}
      <div className="grid gap-4 md:grid-cols-2">
        {warehouses.map(wh => {
          const usedPct = wh.capacity;
          const availPct = Math.max(0, 100 - usedPct);
          const colorClass = usedPct >= 90 ? 'border-red-300 bg-red-50/20' : usedPct >= 70 ? 'border-amber-300 bg-amber-50/20' : 'border-emerald-300 bg-emerald-50/20';
          const textClass = usedPct >= 90 ? 'text-red-600' : usedPct >= 70 ? 'text-amber-600' : 'text-emerald-600';

          return (
            <Card key={wh.id} className={`border shadow-none ${colorClass}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{wh.name}</p>
                    <p className="text-xs font-mono text-blue-600">{wh.code}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${textClass}`}>{usedPct}%</p>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Utilized</p>
                  </div>
                </div>

                <Bar value={usedPct} />

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white border border-gray-200 p-2">
                    <p className="text-xs font-bold text-gray-900">{wh.locations.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">Total Bins</p>
                  </div>
                  <div className="rounded-lg bg-white border border-gray-200 p-2">
                    <p className="text-xs font-bold text-blue-700">{Math.round(wh.locations * (usedPct / 100)).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">Occupied ({usedPct}%)</p>
                  </div>
                  <div className="rounded-lg bg-white border border-gray-200 p-2">
                    <p className="text-xs font-bold text-emerald-700">{Math.round(wh.locations * (availPct / 100)).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">Available ({availPct}%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Zone Capacity Breakdown Table */}
      <Card className="border border-gray-200 shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
              <BarChart3 className="h-4 w-4 text-blue-600" /> Zone-Level Capacity & Utilization — {selWH?.code}
            </CardTitle>
            <Select value={whId} onValueChange={setWhId}>
              <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold text-left">
                <th className="pb-2">Zone Name</th>
                <th className="pb-2">Total Capacity</th>
                <th className="pb-2">Used</th>
                <th className="pb-2">Available</th>
                <th className="pb-2 text-right">% Utilized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {whZones.map(z => {
                const usedBins = Math.round(z.binCount * (z.occupancy / 100));
                const availBins = Math.max(0, z.binCount - usedBins);
                const statusColor = z.occupancy >= 90 ? 'text-red-600' : z.occupancy >= 70 ? 'text-amber-600' : 'text-emerald-600';

                return (
                  <tr key={z.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium text-slate-900">
                      <span>{z.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-blue-600">({z.code})</span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-700">{z.binCount} bins</td>
                    <td className="py-2.5 font-mono text-slate-700">{usedBins} bins</td>
                    <td className="py-2.5 font-mono text-slate-700">{availBins} bins</td>
                    <td className="py-2.5 w-44">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${z.occupancy >= 90 ? 'bg-red-500' : z.occupancy >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${z.occupancy}%` }}
                          />
                        </div>
                        <span className={`font-bold font-mono text-xs ${statusColor}`}>{z.occupancy}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );

  // ── Tab 7: Location Attributes (Feature 2.6) ───────────────────────
  const tabAttributes = () => (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2">
        <Select value={attrType} onValueChange={setAttrType}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Location Types</SelectItem>
            <SelectItem value="Bin">Bin / Slot</SelectItem>
            <SelectItem value="Shelf">Shelf Tier</SelectItem>
            <SelectItem value="Rack">Rack Bay</SelectItem>
            <SelectItem value="Pallet Position">Pallet Position</SelectItem>
          </SelectContent>
        </Select>
        <Select value={whId} onValueChange={setWhId}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
        </Select>
        <Button size="sm" className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => { setEditAttr(null); setAttrModal(true); }}>
          <Plus className="h-3.5 w-3.5" /> + Add/Edit Location
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Location Code', 'Type', 'Dimensions (L×W×H)', 'Max Weight Capacity', 'Storage Restrictions', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fAttrs.map(attr => (
              <tr key={attr.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-mono text-[11px] font-bold text-blue-700">{attr.code}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{attr.zoneCode}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                    {attr.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-gray-700">
                  {attr.depth || 100}cm × {attr.width || 120}cm × {attr.height || 160}cm
                </td>
                <td className="px-4 py-3 text-gray-800 font-bold">
                  {attr.maxWeight} kg
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    <span className="rounded-full bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 text-[10px]">
                      {attr.restriction || 'Pallet only · No mix SKU'}
                    </span>
                    {attr.highValueLock && <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 text-[10px] font-bold">High-Value Lock</span>}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={attr.status} /></td>
                <td className="px-4 py-3">
                  <button className="p-1 rounded hover:bg-gray-100 text-gray-500" onClick={() => { setEditAttr(attr); setAttrModal(true); }}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Tab 8: Putaway Rules (Feature 2.7) ─────────────────────────────
  const tabPutaway = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-gray-900">Configured Putaway Routing Rules</h4>
        <Button size="sm" className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => { setRuleWizardStep(1); setRuleWizardOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> + Add Rule (3-Step Wizard)
        </Button>
      </div>

      {/* Rules List in Priority Order */}
      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <Card key={rule.id} className={`border shadow-none ${rule.active ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                      #{rule.priority}
                    </div>
                    <div className="flex flex-col">
                      <button
                        disabled={idx === 0}
                        onClick={() => {
                          const copy = [...rules];
                          const temp = copy[idx].priority;
                          copy[idx].priority = copy[idx - 1].priority;
                          copy[idx - 1].priority = temp;
                          copy.sort((a, b) => a.priority - b.priority);
                          setRules(copy);
                          toast.success('Priority reordered');
                        }}
                        className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        <ArrowUp className="h-3 w-3 text-slate-600" />
                      </button>
                      <button
                        disabled={idx === rules.length - 1}
                        onClick={() => {
                          const copy = [...rules];
                          const temp = copy[idx].priority;
                          copy[idx].priority = copy[idx + 1].priority;
                          copy[idx + 1].priority = temp;
                          copy.sort((a, b) => a.priority - b.priority);
                          setRules(copy);
                          toast.success('Priority reordered');
                        }}
                        className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="h-3 w-3 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">{rule.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">If <strong>{rule.condition}</strong></span>
                      <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5">Target: <strong>{rule.targetZone}</strong> ({rule.targetShelf})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500 font-mono">{rule.active ? 'Active' : 'Inactive'}</span>
                  <Toggle on={rule.active} onChange={v => setRules(p => p.map(r => r.id === rule.id ? { ...r, active: v } : r))} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3-Step Rule Wizard Modal */}
      {ruleWizardOpen && (
        <Dialog open={ruleWizardOpen} onOpenChange={setRuleWizardOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>+ Add Putaway Rule — Step {ruleWizardStep} of 3</DialogTitle>
              <DialogDescription>
                {ruleWizardStep === 1 && 'Step 1: Select condition field, operator, and matching value.'}
                {ruleWizardStep === 2 && 'Step 2: Select target storage zone and rack/shelf location.'}
                {ruleWizardStep === 3 && 'Step 3: Set rule priority order in the system routing table.'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-4">
              {ruleWizardStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Rule Name *</Label>
                    <Input value={ruleWizardForm.name} onChange={e => setRuleWizardForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Fragile Electronics Priority Slotting" className="h-8 text-xs mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[11px]">Condition Field</Label>
                      <Select value={ruleWizardForm.field} onValueChange={v => setRuleWizardForm(p => ({ ...p, field: v }))}>
                        <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Category">Category</SelectItem>
                          <SelectItem value="SKU">SKU</SelectItem>
                          <SelectItem value="Weight">Weight</SelectItem>
                          <SelectItem value="Temperature Sensitivity">Temp Sensitivity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px]">Operator</Label>
                      <Select value={ruleWizardForm.operator} onValueChange={v => setRuleWizardForm(p => ({ ...p, operator: v }))}>
                        <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="=">=</SelectItem>
                          <SelectItem value=">">&gt;</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px]">Value</Label>
                      <Input value={ruleWizardForm.value} onChange={e => setRuleWizardForm(p => ({ ...p, value: e.target.value }))} className="h-8 text-xs mt-1" />
                    </div>
                  </div>
                </div>
              )}

              {ruleWizardStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Target Storage Zone</Label>
                    <Select value={ruleWizardForm.targetZone} onValueChange={v => setRuleWizardForm(p => ({ ...p, targetZone: v }))}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{whZones.map(z => <SelectItem key={z.id} value={z.code}>{z.name} ({z.code})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Target Shelf Level / Bin</Label>
                    <Input value={ruleWizardForm.targetShelf} onChange={e => setRuleWizardForm(p => ({ ...p, targetShelf: e.target.value }))} placeholder="S1-S2 (pick face) or Any" className="h-8 text-xs mt-1" />
                  </div>
                </div>
              )}

              {ruleWizardStep === 3 && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Priority Order Number</Label>
                    <Input type="number" min={1} value={ruleWizardForm.priority} onChange={e => setRuleWizardForm(p => ({ ...p, priority: Number(e.target.value) }))} className="h-8 text-xs mt-1 w-24 font-mono" />
                    <p className="text-[11px] text-slate-500 mt-1">Lower numbers execute first in the putaway evaluation queue.</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between">
              {ruleWizardStep > 1 ? (
                <Button size="sm" variant="outline" onClick={() => setRuleWizardStep(p => (p - 1) as any)}>Back</Button>
              ) : <div />}
              {ruleWizardStep < 3 ? (
                <Button size="sm" className="bg-blue-600 text-white" onClick={() => { if (!ruleWizardForm.name && ruleWizardStep === 1) { toast.error('Rule Name is required'); return; } setRuleWizardStep(p => (p + 1) as any); }}>Next Step</Button>
              ) : (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
                  setRules(p => [...p, { id: `r-${Date.now()}`, name: ruleWizardForm.name, priority: ruleWizardForm.priority, condition: `${ruleWizardForm.field} ${ruleWizardForm.operator} ${ruleWizardForm.value}`, targetZone: ruleWizardForm.targetZone, targetShelf: ruleWizardForm.targetShelf, strategy: ruleWizardForm.strategy, active: true }]);
                  toast.success('Putaway rule created!');
                  setRuleWizardOpen(false);
                }}>Finish & Create Rule</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  // ── Tab 9: Warehouse Configuration (Feature 2.8) ───────────────────
  const tabConfig = () => (
    <div className="space-y-5 pb-16">
      <div className="flex justify-end items-center gap-2">
        <Select value={whId} onValueChange={setWhId}>
          <SelectTrigger className="w-64 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Card 1: General Settings */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
              <Clock className="h-4 w-4 text-blue-600" /> General Facility Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">Working Hours</Label>
              <Input value={cfg.morning || '08:00-18:00 (Sun-Thu)'} onChange={e => setCfgVal('morning', e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">Time Zone</Label>
              <Input value={selWH?.timezone || 'Asia/Dubai'} readOnly className="h-8 text-xs font-mono bg-slate-50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">Default Unit of Measure (UOM)</Label>
              <Select value={cfg.defaultUom || 'PLT'} onValueChange={v => setCfgVal('defaultUom', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLT">Pallet (PLT)</SelectItem>
                  <SelectItem value="CTN">Carton (CTN)</SelectItem>
                  <SelectItem value="EA">Each (EA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Notifications & Capacity Thresholds */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> System Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-xs font-semibold text-gray-800">Low Stock Alerts</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Automated notification when bin inventory falls below safety stock.</p>
              </div>
              <Toggle on={cfg.lowStockAlerts ?? true} onChange={v => setCfgVal('lowStockAlerts', v)} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-800">Capacity Threshold Alert (%)</Label>
              <div className="flex items-center gap-3">
                <Input type="number" min="50" max="100" value={cfg.alertThreshold ?? 85} onChange={e => setCfgVal('alertThreshold', Number(e.target.value))} className="h-8 text-xs w-24 font-mono font-bold" />
                <span className="text-xs text-gray-500">% network utilization trigger</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Operational Rules */}
        <Card className="border border-gray-200 shadow-sm md:col-span-2">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-purple-600" /> Operational Warehouse Control Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { k: 'allowNegativeStock', l: 'Allow Negative Stock', d: 'Permit inventory transactions to drop below zero quantity.' },
                { k: 'autoPutaway', l: 'Auto-Putaway Routing Engine', d: 'Automatically compute target bin upon GRN validation.' },
                { k: 'requireBinPickConfirm', l: 'Require Bin Confirmation on Pick', d: 'Mandatory handheld scan confirmation of location tag before picking.' },
                { k: 'batchSerialTracking', l: 'Batch & Serial Tracking', d: 'Enforce lot numbers and serial tracking on stock movements.' }
              ].map(t => (
                <div key={t.k} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{t.l}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{t.d}</p>
                  </div>
                  <Toggle on={cfg[t.k] ?? true} onChange={v => setCfgVal(t.k, v)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Save Changes bar at bottom-right */}
      <div className="fixed bottom-4 right-6 bg-slate-900 text-white p-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 z-50">
        <span className="text-xs font-medium text-slate-300">Warehouse Operating Policy</span>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 h-8 text-xs" onClick={() => toast.success(`Saved all operational rules for ${selWH?.name}`)}>
          <Save className="h-3.5 w-3.5" /> Save Changes
        </Button>
      </div>
    </div>
  );

  // ── Warehouse Modal ───────────────────────────────────────────────
  function WhModal() {
    const [f, setF] = useState<any>(editWh || {
      code: '',
      name: '',
      type: 'Main',
      address: '',
      city: 'Dubai',
      state: 'Dubai Emirate',
      country: 'United Arab Emirates',
      status: 'ACTIVE',
      operatingHours: '08:00-18:00',
    });
    const isEdit = !!editWh;
    const save = () => {
      if (!f.code || !f.name) { toast.error('Code and Name are required'); return; }
      if (isEdit) {
        setWarehouses(p => p.map(w => w.id === editWh.id ? { ...w, ...f } : w));
        toast.success('Warehouse updated');
      } else {
        setWarehouses(p => [...p, { ...f, id: `wh-${Date.now()}`, zones: 0, locations: 0, capacity: 0 }]);
        toast.success('Warehouse created');
      }
      setWhModal(false);
    };
    return (
      <Dialog open={whModal} onOpenChange={setWhModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Warehouse Facility' : '+ Add Warehouse'}</DialogTitle>
            <DialogDescription>Manage multi-warehouse facility boundaries and operating metadata.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Warehouse Code *</Label><Input value={f.code} onChange={e => setF((p: any) => ({ ...p, code: e.target.value }))} placeholder="DXB-WH05" className="h-8 text-xs font-mono" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Warehouse Type</Label>
                <Select value={f.type || 'Main'} onValueChange={v => setF((p: any) => ({ ...p, type: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main">Main Facility Hub</SelectItem>
                    <SelectItem value="Sub">Sub Depot / Satellite</SelectItem>
                    <SelectItem value="3PL">3PL Transit Facility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Warehouse Name *</Label><Input value={f.name} onChange={e => setF((p: any) => ({ ...p, name: e.target.value }))} placeholder="e.g. Dubai South Logistics Hub C" className="h-8 text-xs" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Address</Label><Input value={f.address} onChange={e => setF((p: any) => ({ ...p, address: e.target.value }))} placeholder="Plot No 47, Logistics District" className="h-8 text-xs" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label className="text-xs">City</Label><Input value={f.city} onChange={e => setF((p: any) => ({ ...p, city: e.target.value }))} placeholder="Dubai" className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs">State / Region</Label><Input value={f.state} onChange={e => setF((p: any) => ({ ...p, state: e.target.value }))} placeholder="Dubai Emirate" className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs">Country</Label><Input value={f.country} onChange={e => setF((p: any) => ({ ...p, country: e.target.value }))} placeholder="United Arab Emirates" className="h-8 text-xs" /></div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-700">Facility Status</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono">{f.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                <Toggle on={f.status === 'ACTIVE'} onChange={v => setF((p: any) => ({ ...p, status: v ? 'ACTIVE' : 'INACTIVE' }))} />
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setWhModal(false)}>Cancel</Button><Button size="sm" onClick={save} className="bg-blue-600 hover:bg-blue-700">{isEdit ? 'Save Changes' : 'Create Warehouse'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Zone Modal ────────────────────────────────────────────────────
  function ZoneModal() {
    const [f, setF] = useState<any>(editZ || {
      code: '',
      name: '',
      type: 'Storage',
      warehouseId: whId,
      maxWeight: 5000,
      maxVolume: 15000,
      description: '',
      status: 'ACTIVE',
    });
    const isEdit = !!editZ;
    const save = () => {
      if (!f.code || !f.name) { toast.error('Zone Code and Name are required'); return; }
      if (isEdit) {
        setZones(p => p.map(z => z.id === editZ.id ? { ...z, ...f } : z));
        toast.success('Zone updated');
      } else {
        setZones(p => [...p, { ...f, id: `zn-${Date.now()}`, binCount: 0, occupancy: 0 }]);
        toast.success('Zone created');
      }
      setZModal(false);
    };
    return (
      <Dialog open={zModal} onOpenChange={setZModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Storage Zone' : '+ Add Storage Zone'}</DialogTitle>
            <DialogDescription>Define functional warehouse zone boundaries and capacity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Zone Code *</Label><Input value={f.code} onChange={e => setF((p: any) => ({ ...p, code: e.target.value }))} placeholder="ZN-STR-01" className="h-8 text-xs font-mono" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Associated Warehouse</Label>
                <Select value={f.warehouseId} onValueChange={v => setF((p: any) => ({ ...p, warehouseId: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Zone Name *</Label><Input value={f.name} onChange={e => setF((p: any) => ({ ...p, name: e.target.value }))} placeholder="High-Density Pallet Storage" className="h-8 text-xs" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Zone Type</Label>
                <Select value={f.type} onValueChange={v => setF((p: any) => ({ ...p, type: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receiving">Receiving (Dock Hold)</SelectItem>
                    <SelectItem value="Storage">Storage (Reserve)</SelectItem>
                    <SelectItem value="Picking">Picking (Forward Face)</SelectItem>
                    <SelectItem value="Packing">Packing (VAS Bay)</SelectItem>
                    <SelectItem value="Quarantine">Quarantine (QC Hold)</SelectItem>
                    <SelectItem value="Dispatch">Dispatch (Staging)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Capacity (Max Weight kg)</Label><Input type="number" value={f.maxWeight} onChange={e => setF((p: any) => ({ ...p, maxWeight: Number(e.target.value) }))} className="h-8 text-xs" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Description / Operating Purpose</Label><Input value={f.description || f.purpose || ''} onChange={e => setF((p: any) => ({ ...p, description: e.target.value, purpose: e.target.value }))} placeholder="Functional purpose of this zone..." className="h-8 text-xs" /></div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-700">Status</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono">{f.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                <Toggle on={f.status === 'ACTIVE'} onChange={v => setF((p: any) => ({ ...p, status: v ? 'ACTIVE' : 'INACTIVE' }))} />
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setZModal(false)}>Cancel</Button><Button size="sm" onClick={save} className="bg-blue-600 hover:bg-blue-700">{isEdit ? 'Save Changes' : 'Create Zone'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Location Attributes Modal ─────────────────────────────────────
  function AttrModal() {
    const [f, setF] = useState<any>(editAttr || { code: '', type: 'Pallet Position', width: 120, height: 160, depth: 100, maxWeight: 1200, temp: 'Ambient', hazmat: 'Non-Hazmat', highValueLock: false, forkliftAccess: true });
    const isEdit = !!editAttr;
    const save = () => {
      if (!f.code) { toast.error('Location code is required'); return; }
      const cbm = (f.width * f.height * f.depth) / 1000000;
      if (isEdit) {
        setAttributes(p => p.map(a => a.id === editAttr.id ? { ...a, ...f, cbm } : a));
        toast.success('Location attributes updated');
      } else {
        setAttributes(p => [...p, { ...f, id: `attr-${Date.now()}`, warehouseId: whId, zoneCode: whZones[0]?.code || 'ZN-01', currentWeight: 0, cbm, status: 'EMPTY' }]);
        toast.success('Location profile created');
      }
      setAttrModal(false);
    };
    return (
      <Dialog open={attrModal} onOpenChange={setAttrModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{isEdit ? 'Edit Location Attributes' : 'Define Location Profile'}</DialogTitle><DialogDescription>Configure dimensional constraints, type, load limit, and security locks.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Location Code *</Label><Input value={f.code} onChange={e => setF((p: any) => ({ ...p, code: e.target.value }))} placeholder="JAFZA-WH01-BULK-A-A01-R01-S1-B01" className="h-8 text-xs font-mono" /></div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Location Type</Label>
              <Select value={f.type} onValueChange={v => setF((p: any) => ({ ...p, type: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pallet Position">Pallet Position</SelectItem>
                  <SelectItem value="Cantilever Rack">Cantilever Rack</SelectItem>
                  <SelectItem value="Carton Flow Rack">Carton Flow Rack</SelectItem>
                  <SelectItem value="Small-Parts Drawer">Small-Parts Drawer</SelectItem>
                  <SelectItem value="Bulk Floor Stack">Bulk Floor Stack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label className="text-xs">Width (cm)</Label><Input type="number" value={f.width} onChange={e => setF((p: any) => ({ ...p, width: Number(e.target.value) }))} className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs">Height (cm)</Label><Input type="number" value={f.height} onChange={e => setF((p: any) => ({ ...p, height: Number(e.target.value) }))} className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs">Depth (cm)</Label><Input type="number" value={f.depth} onChange={e => setF((p: any) => ({ ...p, depth: Number(e.target.value) }))} className="h-8 text-xs" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Max Weight Load (kg)</Label><Input type="number" value={f.maxWeight} onChange={e => setF((p: any) => ({ ...p, maxWeight: Number(e.target.value) }))} className="h-8 text-xs" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Temperature Profile</Label>
                <Select value={f.temp} onValueChange={v => setF((p: any) => ({ ...p, temp: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ambient">Ambient</SelectItem>
                    <SelectItem value="Chilled (2C-8C)">Chilled (2°C-8°C)</SelectItem>
                    <SelectItem value="Frozen (-18C to -24C)">Frozen (-18°C)</SelectItem>
                    <SelectItem value="Controlled (18C)">Controlled (18°C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={f.highValueLock} onChange={e => setF((p: any) => ({ ...p, highValueLock: e.target.checked }))} />High-Value Security Lock</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={f.forkliftAccess} onChange={e => setF((p: any) => ({ ...p, forkliftAccess: e.target.checked }))} />Forklift Accessible</label>
            </div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setAttrModal(false)}>Cancel</Button><Button size="sm" onClick={save} className="bg-blue-600 hover:bg-blue-700">{isEdit ? 'Save Changes' : 'Create Profile'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Render Master Container ───────────────────────────────────────
  const meta = PAGE_TITLES[tab] || PAGE_TITLES.overview;

  return (
    <div className="space-y-5">
      <PageHeader
        title={meta.title}
      />
      <div>
        {tab === 'overview' && tabOverview()}
        {tab === 'warehouses' && tabWH()}
        {tab === 'hierarchy' && tabHierarchy()}
        {tab === 'zones' && tabZones()}
        {tab === 'bins' && tabBins()}
        {tab === 'capacity' && tabCapacity()}
        {tab === 'attributes' && tabAttributes()}
        {tab === 'putaway' && tabPutaway()}
        {tab === 'config' && tabConfig()}
      </div>

      {whModal && <WhModal />}
      {zModal && <ZoneModal />}
      {attrModal && <AttrModal />}

      <Dialog open={lModal} onOpenChange={setLModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Location / Bin</DialogTitle><DialogDescription>Define a new bin coordinate within the warehouse zone.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {[{ l: 'Zone Code', ph: 'ZN-BULK-A' }, { l: 'Aisle', ph: 'A01' }, { l: 'Rack', ph: 'R01' }, { l: 'Shelf', ph: 'S1' }, { l: 'Bin', ph: 'B01' }, { l: 'Max Weight (kg)', ph: '500' }].map(fd => (
              <div key={fd.l} className="space-y-1.5"><Label className="text-xs font-semibold">{fd.l}</Label><Input placeholder={fd.ph} className="h-8 text-xs" /></div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setLModal(false)}>Cancel</Button><Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => { toast.success('Location added'); setLModal(false); }}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rModal} onOpenChange={setRModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Slotting Rule</DialogTitle><DialogDescription>Define conditions and target placement for automatic putaway routing.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Rule Name</Label><Input placeholder="e.g. Fragile Electronics - Class A" className="h-8 text-xs" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Priority</Label><Input type="number" min="1" defaultValue={rules.length + 1} className="h-8 text-xs" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Strategy</Label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="FIFO">FIFO</SelectItem><SelectItem value="FEFO">FEFO</SelectItem><SelectItem value="LIFO">LIFO</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Condition</Label><Input placeholder="Velocity = A AND Category = Electronics" className="h-8 text-xs" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Target Zone</Label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Zone..." /></SelectTrigger><SelectContent>{whZones.map(z => <SelectItem key={z.id} value={z.code}>{z.code}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Target Shelf</Label><Input placeholder="S1-S2 or Any" className="h-8 text-xs" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setRModal(false)}>Cancel</Button><Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => { toast.success('Rule created'); setRModal(false); }}>Create Rule</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
