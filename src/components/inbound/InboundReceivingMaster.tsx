'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Truck,
  ShoppingBag,
  ClipboardList,
  CalendarDays,
  PackageCheck,
  Tags,
  AlertTriangle,
  ShieldCheck,
  LockKeyhole,
  LockKeyholeOpen,
  Target,
  FileCheck2,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Printer,
  Download,
  LayoutGrid,
  List,
  Check,
  X,
  Upload,
  ArrowRight,
  Boxes,
  Package,
  Layers,
  Building2,
  UserCheck
} from 'lucide-react';

// --- TAB DEFINITIONS ---
export const INBOUND_TABS = [
  { id: 'po-receiving', label: 'PO Receiving', icon: ShoppingBag },
  { id: 'asn', label: 'Advance Shipment Notice', icon: Truck },
  { id: 'inbound-orders', label: 'Inbound Orders', icon: ClipboardList },
  { id: 'appointments', label: 'Dock Scheduling', icon: CalendarDays },
  { id: 'goods-receipt', label: 'Goods Receipt', icon: PackageCheck },
  { id: 'barcode-receiving', label: 'Barcode Receiving', icon: Tags },
  { id: 'short-excess', label: 'Short / Excess', icon: AlertTriangle },
  { id: 'quality-inspection', label: 'Quality Inspection', icon: ShieldCheck },
  { id: 'quarantine', label: 'Quarantine Stock', icon: LockKeyhole },
  { id: 'putaway', label: 'Putaway Queue', icon: Target },
  { id: 'grn', label: 'GRN Generation', icon: FileCheck2 },
];

// --- SEED DATA TYPES & INITIAL STATES ---

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  totalSkus: number;
  totalOrderedQty: number;
  totalReceivedQty: number;
  status: 'Open' | 'Partially Received' | 'Fully Received' | 'Closed';
  items: {
    sku: string;
    productName: string;
    orderedQty: number;
    receivedQty: number;
    uom: string;
  }[];
}

export interface ASNItem {
  id: string;
  asnNumber: string;
  poNumber: string;
  supplier: string;
  carrier: string;
  awbTracking: string;
  expectedArrival: string; // ISO or formatted string
  cartonsPallets: string;
  status: 'Pending' | 'In Transit' | 'Arrived';
  notes?: string;
}

export interface InboundOrder {
  id: string;
  inboundOrderId: string;
  linkedRef: string;
  warehouse: string;
  type: 'PO-based' | 'Return' | 'Transfer-In' | 'Direct';
  assignedOperator: string;
  priority: 'Normal' | 'Urgent';
  status: 'Draft' | 'Scheduled' | 'In Progress' | 'Completed';
  createdDate: string;
}

export interface DockAppointment {
  id: string;
  appointmentId: string;
  dockDoor: string;
  supplierCarrier: string;
  vehicleNumber: string;
  scheduledTime: string;
  duration: string;
  linkedRef: string;
  status: 'Scheduled' | 'Checked-In' | 'Unloading' | 'Completed' | 'No-Show';
}

export interface GoodsReceiptLine {
  id: string;
  sku: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  uom: string;
  condition: 'Good' | 'Damaged';
  notes: string;
}

export interface BarcodeScanItem {
  id: string;
  barcode: string;
  sku: string;
  productName: string;
  scannedQty: number;
  timestamp: string;
}

export interface DiscrepancyItem {
  id: string;
  refOrder: string;
  sku: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  variance: number;
  reasonCode: 'Damaged in Transit' | 'Supplier Error' | 'Miscount' | 'Other';
  status: 'Open' | 'Resolved' | 'Escalated';
  notes?: string;
}

export interface InspectionItem {
  id: string;
  inspectionId: string;
  sku: string;
  productName: string;
  batchLot: string;
  qty: number;
  inspector: string;
  result: 'Pending' | 'Passed' | 'Failed' | 'Partial Pass';
  checklistNotes: string;
  date: string;
}

export interface QuarantineItem {
  id: string;
  sku: string;
  productName: string;
  batchLot: string;
  qty: number;
  reason: 'Failed QC' | 'Damaged' | 'Expired' | 'Under Investigation';
  location: string;
  dateQuarantined: string;
  status: 'In Quarantine' | 'Released' | 'Disposed';
}

export interface PutawayItem {
  id: string;
  sku: string;
  productName: string;
  qty: number;
  suggestedBin: string;
  warehouse: string;
  zone: string;
  confidence: number;
  status: 'Pending' | 'Confirmed';
}

export interface GRNItem {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplier: string;
  dateGenerated: string;
  totalSkus: number;
  totalQtyReceived: number;
  status: 'Draft' | 'Finalized' | 'Sent to Accounts';
  items: {
    sku: string;
    productName: string;
    orderedQty: number;
    receivedQty: number;
    variance: number;
  }[];
}

// --- INITIAL SEED DATA OBJECTS ---
const SEED_POS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-001',
    supplierName: 'Apple Logistics Middle East',
    orderDate: '2026-03-10',
    expectedDeliveryDate: '2026-03-24',
    totalSkus: 3,
    totalOrderedQty: 300,
    totalReceivedQty: 120,
    status: 'Partially Received',
    items: [
      { sku: 'SKU-ELC-001', productName: 'Apple iPhone 15 Pro Max 256GB', orderedQty: 100, receivedQty: 100, uom: 'EA' },
      { sku: 'SKU-ELC-002', productName: 'Apple iPad Pro 12.9" M2 512GB', orderedQty: 100, receivedQty: 20, uom: 'EA' },
      { sku: 'SKU-ELC-003', productName: 'Apple AirPods Pro Gen 2', orderedQty: 100, receivedQty: 0, uom: 'EA' },
    ]
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-002',
    supplierName: 'Sony Gulf FZCO',
    orderDate: '2026-03-12',
    expectedDeliveryDate: '2026-03-25',
    totalSkus: 2,
    totalOrderedQty: 150,
    totalReceivedQty: 0,
    status: 'Open',
    items: [
      { sku: 'SKU-ELC-010', productName: 'Sony Bravia XR 65" 4K OLED TV', orderedQty: 50, receivedQty: 0, uom: 'EA' },
      { sku: 'SKU-ELC-011', productName: 'Sony PlayStation 5 Slim Edition', orderedQty: 100, receivedQty: 0, uom: 'EA' },
    ]
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-003',
    supplierName: 'Al Foah Dates Factory LLC',
    orderDate: '2026-03-01',
    expectedDeliveryDate: '2026-03-15',
    totalSkus: 4,
    totalOrderedQty: 1000,
    totalReceivedQty: 1000,
    status: 'Fully Received',
    items: [
      { sku: 'SKU-FMC-201', productName: 'Organic Medjool Dates 1kg Box', orderedQty: 500, receivedQty: 500, uom: 'BOX' },
      { sku: 'SKU-FMC-202', productName: 'Premium Kholas Dates 500g Pack', orderedQty: 500, receivedQty: 500, uom: 'CTN' },
    ]
  }
];

const SEED_ASNS: ASNItem[] = [
  {
    id: 'asn-1',
    asnNumber: 'ASN-2026-8801',
    poNumber: 'PO-2026-001',
    supplier: 'Apple Logistics Middle East',
    carrier: 'DHL Express Gulf',
    awbTracking: 'DHL-992381203',
    expectedArrival: '2026-03-24 14:00',
    cartonsPallets: '4 Pallets / 80 Cartons',
    status: 'In Transit',
    notes: 'Air freight shipment via DXB Hub'
  },
  {
    id: 'asn-2',
    asnNumber: 'ASN-2026-8802',
    poNumber: 'PO-2026-002',
    supplier: 'Sony Gulf FZCO',
    carrier: 'Aramex Freight',
    awbTracking: 'ARM-40192831',
    expectedArrival: '2026-03-25 09:30',
    cartonsPallets: '2 Pallets',
    status: 'Pending',
    notes: 'Direct delivery from JAFZA Freezone'
  }
];

const SEED_INBOUND_ORDERS: InboundOrder[] = [
  { id: 'io-1', inboundOrderId: 'IO-9001', linkedRef: 'PO-2026-001 / ASN-8801', warehouse: 'Jebel Ali Main Hub', type: 'PO-based', assignedOperator: 'Ahmed Al-Mansoori', priority: 'Urgent', status: 'In Progress', createdDate: '2026-03-23' },
  { id: 'io-2', inboundOrderId: 'IO-9002', linkedRef: 'PO-2026-002', warehouse: 'Dubai South Logistics City', type: 'PO-based', assignedOperator: 'Rashid Khan', priority: 'Normal', status: 'Scheduled', createdDate: '2026-03-22' },
  { id: 'io-3', inboundOrderId: 'IO-9003', linkedRef: 'RET-4401', warehouse: 'Al Quoz Central Warehouse', type: 'Return', assignedOperator: 'Sariyah Omar', priority: 'Normal', status: 'Draft', createdDate: '2026-03-21' },
];

const SEED_APPOINTMENTS: DockAppointment[] = [
  { id: 'app-1', appointmentId: 'APT-101', dockDoor: 'Dock Door #01 (Inbound)', supplierCarrier: 'DHL Express / Apple', vehicleNumber: 'DXB-TRK-4910', scheduledTime: '2026-03-24 10:00 AM', duration: '2 Hours', linkedRef: 'PO-2026-001', status: 'Checked-In' },
  { id: 'app-2', appointmentId: 'APT-102', dockDoor: 'Dock Door #02 (Refrigerated)', supplierCarrier: 'Aramex / Sony', vehicleNumber: 'SHJ-TRK-8821', scheduledTime: '2026-03-24 02:00 PM', duration: '1.5 Hours', linkedRef: 'ASN-8802', status: 'Scheduled' },
  { id: 'app-3', appointmentId: 'APT-103', dockDoor: 'Dock Door #03 (Bulk Pallets)', supplierCarrier: 'Agility Logistics', vehicleNumber: 'AUH-TRK-1029', scheduledTime: '2026-03-23 04:00 PM', duration: '3 Hours', linkedRef: 'PO-2026-003', status: 'Completed' },
];

const SEED_DISCREPANCIES: DiscrepancyItem[] = [
  { id: 'disc-1', refOrder: 'PO-2026-001', sku: 'SKU-ELC-002', productName: 'Apple iPad Pro 12.9" M2', orderedQty: 100, receivedQty: 20, variance: -80, reasonCode: 'Damaged in Transit', status: 'Open', notes: 'Outer carton crushed upon arrival at Bay 2' },
  { id: 'disc-2', refOrder: 'PO-2026-003', sku: 'SKU-FMC-201', productName: 'Organic Medjool Dates 1kg', orderedQty: 500, receivedQty: 520, variance: 20, reasonCode: 'Supplier Error', status: 'Resolved', notes: 'Excess 20 boxes accepted under bonus allowance' }
];

const SEED_INSPECTIONS: InspectionItem[] = [
  { id: 'qc-1', inspectionId: 'QC-2026-501', sku: 'SKU-FRG-101', productName: 'Oud Royal Luxury Perfume 100ml', batchLot: 'B2026-0819', qty: 200, inspector: 'Fatima Hassan (Senior QA)', result: 'Pending', checklistNotes: 'Check seals, atomizer spray valves, and outer foil packaging', date: '2026-03-23' },
  { id: 'qc-2', inspectionId: 'QC-2026-502', sku: 'SKU-ELC-001', productName: 'Apple iPhone 15 Pro Max', batchLot: 'APL-2026-Q1', qty: 100, inspector: 'Tariq Ziyad (QC Tech)', result: 'Passed', checklistNotes: 'IMEI barcode scan 100% verified, zero outer box denting', date: '2026-03-22' }
];

const SEED_QUARANTINE: QuarantineItem[] = [
  { id: 'qua-1', sku: 'SKU-ELC-002', productName: 'Apple iPad Pro 12.9" M2 512GB', batchLot: 'APL-2026-BAD1', qty: 15, reason: 'Failed QC', location: 'Zone Q - Quarantine Bay 01', dateQuarantined: '2026-03-23', status: 'In Quarantine' },
  { id: 'qua-2', sku: 'SKU-FRG-105', productName: 'Rose Amber Attar Concentrate', batchLot: 'ATT-2024-EXP', qty: 4, reason: 'Expired', location: 'Zone Q - Quarantine Bay 03', dateQuarantined: '2026-03-20', status: 'In Quarantine' }
];

const SEED_PUTAWAY_QUEUE: PutawayItem[] = [
  { id: 'put-1', sku: 'SKU-ELC-001', productName: 'Apple iPhone 15 Pro Max 256GB', qty: 100, suggestedBin: 'WH1-ZN-A-A01-R02-S1-B04', warehouse: 'Jebel Ali Main Hub', zone: 'Zone A - High Value', confidence: 98, status: 'Pending' },
  { id: 'put-2', sku: 'SKU-FMC-201', productName: 'Organic Medjool Dates 1kg Box', qty: 500, suggestedBin: 'WH1-ZN-C-A04-R01-S2-B01', warehouse: 'Jebel Ali Main Hub', zone: 'Zone C - Staging', confidence: 92, status: 'Pending' }
];

const SEED_GRNS: GRNItem[] = [
  {
    id: 'grn-1',
    grnNumber: 'GRN-2026-7701',
    poNumber: 'PO-2026-003',
    supplier: 'Al Foah Dates Factory LLC',
    dateGenerated: '2026-03-15',
    totalSkus: 2,
    totalQtyReceived: 1000,
    status: 'Finalized',
    items: [
      { sku: 'SKU-FMC-201', productName: 'Organic Medjool Dates 1kg Box', orderedQty: 500, receivedQty: 500, variance: 0 },
      { sku: 'SKU-FMC-202', productName: 'Premium Kholas Dates 500g Pack', orderedQty: 500, receivedQty: 500, variance: 0 }
    ]
  }
];

function getDynamicEtaBadge(expectedArrival: string) {
  if (!expectedArrival) {
    return { label: 'Scheduled', style: 'bg-emerald-100 text-emerald-800' };
  }
  try {
    const formattedStr = expectedArrival.replace(' ', 'T');
    const arrivalDate = new Date(formattedStr);
    const baseTime = new Date('2026-03-24T11:00:00').getTime();
    const targetTime = arrivalDate.getTime();
    
    if (isNaN(targetTime)) {
      return { label: `Scheduled: ${expectedArrival}`, style: 'bg-emerald-100 text-emerald-800' };
    }

    const diffMs = targetTime - baseTime;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return { label: `Overdue (${Math.abs(diffHours)}h ago)`, style: 'bg-red-100 text-red-800' };
    } else if (diffHours <= 12) {
      return { label: `Arriving in ${Math.max(1, diffHours)}h`, style: 'bg-emerald-100 text-emerald-800' };
    } else if (diffHours <= 24) {
      return { label: `Arriving Tomorrow`, style: 'bg-amber-100 text-amber-800' };
    } else {
      return { label: `In ${diffDays} days`, style: 'bg-blue-100 text-blue-800' };
    }
  } catch {
    return { label: `Expected: ${expectedArrival}`, style: 'bg-emerald-100 text-emerald-800' };
  }
}

export default function InboundReceivingMaster({ defaultTab = 'po-receiving' }: { defaultTab?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState('ALL');
  const [putawayZoneFilter, setPutawayZoneFilter] = useState('ALL');

  // --- STATE STORES ---
  const [pos, setPos] = useState<PurchaseOrder[]>(SEED_POS);
  const [asns, setAsns] = useState<ASNItem[]>(SEED_ASNS);
  const [inboundOrders, setInboundOrders] = useState<InboundOrder[]>(SEED_INBOUND_ORDERS);
  const [appointments, setAppointments] = useState<DockAppointment[]>(SEED_APPOINTMENTS);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyItem[]>(SEED_DISCREPANCIES);
  const [inspections, setInspections] = useState<InspectionItem[]>(SEED_INSPECTIONS);
  const [quarantineList, setQuarantineList] = useState<QuarantineItem[]>(SEED_QUARANTINE);
  const [putawayQueue, setPutawayQueue] = useState<PutawayItem[]>(SEED_PUTAWAY_QUEUE);
  const [grnList, setGrnList] = useState<GRNItem[]>(SEED_GRNS);

  // --- MODAL / DRAWER STATES ---
  // PO Detail Drawer
  const [selectedPoDetail, setSelectedPoDetail] = useState<PurchaseOrder | null>(null);

  // Add ASN Modal
  const [asnModalOpen, setAsnModalOpen] = useState(false);
  const [asnForm, setAsnForm] = useState({ poNumber: 'PO-2026-001', supplier: 'Apple Logistics Middle East', carrier: 'DHL Express Gulf', awbTracking: '', expectedArrival: '', cartonsPallets: '', notes: '' });

  // Add Inbound Order Modal
  const [ioModalOpen, setIoModalOpen] = useState(false);
  const [ioForm, setIoForm] = useState({ type: 'PO-based' as any, linkedRef: 'PO-2026-001', warehouse: 'Jebel Ali Main Hub', assignedOperator: 'Ahmed Al-Mansoori', priority: 'Normal' as any });

  // Schedule Appointment Modal
  const [aptModalOpen, setAptModalOpen] = useState(false);
  const [aptForm, setAptForm] = useState({ dockDoor: 'Dock Door #01 (Inbound)', date: '2026-03-25', time: '10:00', duration: '2 Hours', supplierCarrier: 'DHL / Apple', vehicleNumber: '', linkedRef: 'PO-2026-001' });

  // Goods Receipt Worksheet State
  const [receiptPoSelect, setReceiptPoSelect] = useState('PO-2026-001');
  const [receiptWorksheet, setReceiptWorksheet] = useState<GoodsReceiptLine[]>([
    { id: 'grl-1', sku: 'SKU-ELC-001', productName: 'Apple iPhone 15 Pro Max 256GB', orderedQty: 100, receivedQty: 100, uom: 'EA', condition: 'Good', notes: 'Inspected carton seals' },
    { id: 'grl-2', sku: 'SKU-ELC-002', productName: 'Apple iPad Pro 12.9" M2 512GB', orderedQty: 100, receivedQty: 20, uom: 'EA', condition: 'Damaged', notes: '80 units damaged outer pallet' },
  ]);

  // Barcode Receiving State
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [barcodeScans, setBarcodeScans] = useState<BarcodeScanItem[]>([
    { id: 'bs-1', barcode: '194253091001', sku: 'SKU-ELC-001', productName: 'Apple iPhone 15 Pro Max 256GB', scannedQty: 25, timestamp: '10:14 AM' },
    { id: 'bs-2', barcode: '4548736123456', sku: 'SKU-ELC-010', productName: 'Sony Bravia XR 65" 4K OLED TV', scannedQty: 5, timestamp: '10:20 AM' },
  ]);
  const [manualAddModal, setManualAddModal] = useState(false);
  const [manualBarcodeForm, setManualBarcodeForm] = useState({ sku: 'SKU-ELC-001', productName: 'Apple iPhone 15 Pro Max 256GB', barcode: '194253091001', qty: 1 });

  // Log Discrepancy Modal
  const [discModalOpen, setDiscModalOpen] = useState(false);
  const [discForm, setDiscForm] = useState({ refOrder: 'PO-2026-001', sku: 'SKU-ELC-002', productName: 'Apple iPad Pro 12.9" M2', orderedQty: 100, receivedQty: 20, reasonCode: 'Damaged in Transit' as any, notes: '' });

  // Send to Inspection Modal
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({ sku: 'SKU-FRG-101', productName: 'Oud Royal Luxury Perfume 100ml', batchLot: 'B2026-0901', qty: 50, inspector: 'Fatima Hassan (Senior QA)', notes: 'Check atomizers & serial foil sticker' });

  // Move to Quarantine Modal
  const [quarantineModalOpen, setQuarantineModalOpen] = useState(false);
  const [quarantineForm, setQuarantineForm] = useState({ sku: 'SKU-ELC-002', productName: 'Apple iPad Pro 12.9" M2', batchLot: 'APL-2026-BAD1', qty: 10, reason: 'Failed QC' as any, location: 'Zone Q - Quarantine Bay 01', notes: '' });

  // Putaway Override Modal
  const [putawayOverrideModal, setPutawayOverrideModal] = useState<PutawayItem | null>(null);
  const [overrideBin, setOverrideBin] = useState('');

  // GRN Preview Modal
  const [grnPreviewModal, setGrnPreviewModal] = useState<GRNItem | null>(null);

  // --- TAB NAVIGATION HANDLER ---
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/inbound/${tabId}`);
  };

  // --- ACTIONS & HANDLERS ---
  const handleAddASN = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsn: ASNItem = {
      id: `asn-${Date.now()}`,
      asnNumber: `ASN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      poNumber: asnForm.poNumber,
      supplier: asnForm.supplier,
      carrier: asnForm.carrier,
      awbTracking: asnForm.awbTracking || 'TRK-PENDING',
      expectedArrival: asnForm.expectedArrival || '2026-03-26 12:00',
      cartonsPallets: asnForm.cartonsPallets || '1 Pallet',
      status: 'Pending',
      notes: asnForm.notes
    };
    setAsns([newAsn, ...asns]);
    setAsnModalOpen(false);
    toast.success(`ASN ${newAsn.asnNumber} created successfully!`);
  };

  const handleCreateInboundOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newIo: InboundOrder = {
      id: `io-${Date.now()}`,
      inboundOrderId: `IO-${Math.floor(9000 + Math.random() * 999)}`,
      linkedRef: ioForm.linkedRef,
      warehouse: ioForm.warehouse,
      type: ioForm.type,
      assignedOperator: ioForm.assignedOperator,
      priority: ioForm.priority,
      status: 'Scheduled',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setInboundOrders([newIo, ...inboundOrders]);
    setIoModalOpen(false);
    toast.success(`Inbound Order ${newIo.inboundOrderId} scheduled!`);
  };

  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: DockAppointment = {
      id: `app-${Date.now()}`,
      appointmentId: `APT-${Math.floor(100 + Math.random() * 900)}`,
      dockDoor: aptForm.dockDoor,
      supplierCarrier: aptForm.supplierCarrier,
      vehicleNumber: aptForm.vehicleNumber || 'TRK-TBD',
      scheduledTime: `${aptForm.date} ${aptForm.time}`,
      duration: aptForm.duration,
      linkedRef: aptForm.linkedRef,
      status: 'Scheduled'
    };
    setAppointments([newApt, ...appointments]);
    setAptModalOpen(false);
    toast.success(`Dock Appointment ${newApt.appointmentId} booked!`);
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode.trim()) return;
    const existing = barcodeScans.find(b => b.barcode === scannedBarcode.trim() || b.sku.toLowerCase() === scannedBarcode.trim().toLowerCase());
    if (existing) {
      setBarcodeScans(barcodeScans.map(b => b.id === existing.id ? { ...b, scannedQty: b.scannedQty + 1 } : b));
      toast.success(`Incremented scan for ${existing.sku} (Qty: ${existing.scannedQty + 1})`);
    } else {
      const newScan: BarcodeScanItem = {
        id: `bs-${Date.now()}`,
        barcode: scannedBarcode.trim(),
        sku: `SKU-SCAN-${Math.floor(100 + Math.random() * 900)}`,
        productName: 'Scanned Item Item Description',
        scannedQty: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setBarcodeScans([newScan, ...barcodeScans]);
      toast.success(`New barcode registered: ${newScan.barcode}`);
    }
    setScannedBarcode('');
  };

  const handleCompleteReceipt = () => {
    const hasDiscrepancy = receiptWorksheet.some(l => l.receivedQty !== l.orderedQty);
    if (hasDiscrepancy) {
      toast.error('Receipt completed with short/excess discrepancies! Flagged in 4.7 Discrepancy Log.', { duration: 4000 });
    } else {
      toast.success('Goods Receipt finalized successfully! Stock moved to Putaway queue.');
    }
  };

  const handleLogDiscrepancy = (e: React.FormEvent) => {
    e.preventDefault();
    const varQty = discForm.receivedQty - discForm.orderedQty;
    const newDisc: DiscrepancyItem = {
      id: `disc-${Date.now()}`,
      refOrder: discForm.refOrder,
      sku: discForm.sku,
      productName: discForm.productName,
      orderedQty: discForm.orderedQty,
      receivedQty: discForm.receivedQty,
      variance: varQty,
      reasonCode: discForm.reasonCode,
      status: 'Open',
      notes: discForm.notes
    };
    setDiscrepancies([newDisc, ...discrepancies]);
    setDiscModalOpen(false);
    toast.success(`Discrepancy logged for ${newDisc.sku} (${varQty > 0 ? '+' : ''}${varQty})`);
  };

  const handleSendInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const newQc: InspectionItem = {
      id: `qc-${Date.now()}`,
      inspectionId: `QC-2026-${Math.floor(500 + Math.random() * 400)}`,
      sku: inspectionForm.sku,
      productName: inspectionForm.productName,
      batchLot: inspectionForm.batchLot,
      qty: inspectionForm.qty,
      inspector: inspectionForm.inspector,
      result: 'Pending',
      checklistNotes: inspectionForm.notes,
      date: new Date().toISOString().split('T')[0]
    };
    setInspections([newQc, ...inspections]);
    setInspectionModalOpen(false);
    toast.success(`Quality Inspection ${newQc.inspectionId} created!`);
  };

  const handleInspectionPass = (qcId: string) => {
    setInspections(inspections.map(i => i.id === qcId ? { ...i, result: 'Passed' } : i));
    toast.success('QC Inspection Passed! Stock released to Putaway Queue.');
  };

  const handleInspectionFail = (qc: InspectionItem) => {
    setInspections(inspections.map(i => i.id === qc.id ? { ...i, result: 'Failed' } : i));
    // Auto add to quarantine
    const newQua: QuarantineItem = {
      id: `qua-${Date.now()}`,
      sku: qc.sku,
      productName: qc.productName,
      batchLot: qc.batchLot,
      qty: qc.qty,
      reason: 'Failed QC',
      location: 'Zone Q - Quarantine Bay 01',
      dateQuarantined: new Date().toISOString().split('T')[0],
      status: 'In Quarantine'
    };
    setQuarantineList([newQua, ...quarantineList]);
    toast.error(`QC Inspection Failed. ${qc.qty} units moved to Quarantine Stock!`);
  };

  const handleReleaseQuarantine = (id: string) => {
    setQuarantineList(quarantineList.map(q => q.id === id ? { ...q, status: 'Released' } : q));
    toast.success('Stock released from Quarantine back to available inventory.');
  };

  const handleConfirmPutaway = (id: string) => {
    setPutawayQueue(putawayQueue.map(p => p.id === id ? { ...p, status: 'Confirmed' } : p));
    toast.success('Putaway confirmed! Bin inventory updated.');
  };

  const handleSavePutawayOverride = () => {
    if (!putawayOverrideModal || !overrideBin) return;
    setPutawayQueue(putawayQueue.map(p => p.id === putawayOverrideModal.id ? { ...p, suggestedBin: overrideBin, confidence: 100 } : p));
    toast.success(`Putaway bin location overridden to ${overrideBin}`);
    setPutawayOverrideModal(null);
    setOverrideBin('');
  };

  const handleGenerateGRN = (po: PurchaseOrder) => {
    const grnNo = `GRN-2026-${Math.floor(7700 + Math.random() * 200)}`;
    const newGrn: GRNItem = {
      id: `grn-${Date.now()}`,
      grnNumber: grnNo,
      poNumber: po.poNumber,
      supplier: po.supplierName,
      dateGenerated: new Date().toISOString().split('T')[0],
      totalSkus: po.items.length,
      totalQtyReceived: po.totalReceivedQty,
      status: 'Finalized',
      items: po.items.map(i => ({
        sku: i.sku,
        productName: i.productName,
        orderedQty: i.orderedQty,
        receivedQty: i.receivedQty,
        variance: i.receivedQty - i.orderedQty
      }))
    };
    setGrnList([newGrn, ...grnList]);
    setGrnPreviewModal(newGrn);
    toast.success(`GRN Document ${grnNo} generated!`);
  };

const FEATURE_META: Record<string, { title: string; description: string }> = {
  'po-receiving': { title: 'Purchase Order Receiving', description: 'Receive inventory against purchase orders.' },
  'asn': { title: 'Advance Shipment Notice (ASN)', description: 'Receive expected shipment information before goods arrive.' },
  'inbound-orders': { title: 'Inbound Orders', description: 'Create and manage inbound warehouse orders.' },
  'appointments': { title: 'Dock / Appointment Scheduling', description: 'Schedule inbound vehicle and unloading appointments.' },
  'goods-receipt': { title: 'Goods Receipt Worksheet', description: 'Record actual quantities received and inspect line item conditions.' },
  'barcode-receiving': { title: 'Barcode Receiving', description: 'Scan products during receiving using handheld barcode scanner interface.' },
  'short-excess': { title: 'Short / Excess Receiving', description: 'Record shortages, excess quantities, and supplier discrepancies.' },
  'quality-inspection': { title: 'Quality Inspection', description: 'Place incoming goods into inspection before making them available.' },
  'quarantine': { title: 'Quarantine Stock', description: 'Keep damaged or questionable inventory separated.' },
  'putaway': { title: 'Putaway Queue', description: 'Move received stock into the appropriate warehouse storage locations.' },
  'grn': { title: 'GRN Generation', description: 'Generate official Goods Receipt Note documentation.' },
};

  const currentMeta = FEATURE_META[activeTab] || {
    title: 'Inbound & Receiving Operations',
    description: 'Manage warehouse inbound workflows.'
  };

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title={currentMeta.title}
        description={currentMeta.description}
      />

      {/* ========================================================================= */}
      {/* FEATURE 4.1: PURCHASE ORDER RECEIVING */}
      {/* ========================================================================= */}
      {activeTab === 'po-receiving' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search PO Number, Supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Filter Status:</span>
              <select
                className="text-xs border border-gray-300 rounded-md px-3 py-1.5 bg-white font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2490ef]"
                value={poStatusFilter}
                onChange={(e) => setPoStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Partially Received">Partially Received</option>
                <option value="Fully Received">Fully Received</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Expected Delivery</th>
                  <th className="px-4 py-3">Total SKUs</th>
                  <th className="px-4 py-3">Ordered Qty</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {pos
                  .filter(p => {
                    const matchesQuery = p.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) || p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = poStatusFilter === 'ALL' || p.status === poStatusFilter;
                    return matchesQuery && matchesStatus;
                  })
                  .map(po => (
                    <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#2490ef] whitespace-nowrap">{po.poNumber}</td>
                      <td className="px-4 py-3 font-medium">{po.supplierName}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{po.orderDate}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{po.expectedDeliveryDate}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{po.totalSkus} SKUs</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{po.totalOrderedQty} units</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          po.status === 'Fully Received' ? 'bg-emerald-100 text-emerald-800' :
                          po.status === 'Partially Received' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-xs whitespace-nowrap" onClick={() => setSelectedPoDetail(po)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View Line Items
                          </Button>
                          <Button size="sm" className="h-8 text-xs whitespace-nowrap bg-[#2490ef] hover:bg-blue-600 text-white" onClick={() => { setReceiptPoSelect(po.poNumber); setActiveTab('goods-receipt'); }}>
                            Start Receiving <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO DETAIL DRAWER / DIALOG */}
      {selectedPoDetail && (
        <Dialog open={Boolean(selectedPoDetail)} onOpenChange={() => setSelectedPoDetail(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-base font-bold">
                <span>Purchase Order Details — {selectedPoDetail.poNumber}</span>
                <span className="text-xs font-normal text-gray-500">{selectedPoDetail.supplierName}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Line items breakdown and current receiving status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded-md border text-xs">
                <div><span className="text-gray-500 block">Order Date:</span><span className="font-semibold">{selectedPoDetail.orderDate}</span></div>
                <div><span className="text-gray-500 block">Expected Arrival:</span><span className="font-semibold">{selectedPoDetail.expectedDeliveryDate}</span></div>
                <div><span className="text-gray-500 block">Total Items:</span><span className="font-semibold">{selectedPoDetail.totalSkus} SKUs</span></div>
                <div><span className="text-gray-500 block">Status:</span><span className="font-semibold text-blue-600">{selectedPoDetail.status}</span></div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 border-b font-semibold text-gray-700">
                    <tr>
                      <th className="px-3 py-2">SKU Code</th>
                      <th className="px-3 py-2">Product Name</th>
                      <th className="px-3 py-2">Ordered Qty</th>
                      <th className="px-3 py-2">Received Qty</th>
                      <th className="px-3 py-2">Pending Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-gray-800">
                    {selectedPoDetail.items.map(item => {
                      const pending = item.orderedQty - item.receivedQty;
                      return (
                        <tr key={item.sku}>
                          <td className="px-3 py-2 font-mono font-medium">{item.sku}</td>
                          <td className="px-3 py-2">{item.productName}</td>
                          <td className="px-3 py-2 font-semibold">{item.orderedQty} {item.uom}</td>
                          <td className="px-3 py-2 text-emerald-600 font-semibold">{item.receivedQty} {item.uom}</td>
                          <td className="px-3 py-2 text-amber-600 font-semibold">{pending} {item.uom}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setSelectedPoDetail(null)}>Close</Button>
              <Button className="bg-[#2490ef] hover:bg-blue-600 text-white" onClick={() => {
                setReceiptPoSelect(selectedPoDetail.poNumber);
                setSelectedPoDetail(null);
                setActiveTab('goods-receipt');
              }}>
                <PackageCheck className="h-4 w-4 mr-1.5" /> Start Goods Receipt (4.5)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 4.2: ADVANCE SHIPMENT NOTICE (ASN) */}
      {/* ========================================================================= */}
      {activeTab === 'asn' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Advance Shipment Notices (ASN)</h3>
              <p className="text-xs text-gray-500">Track incoming inbound shipments prior to dock arrival</p>
            </div>
            <Button className="bg-[#2490ef] hover:bg-blue-600 text-white text-xs" onClick={() => setAsnModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add ASN
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">ASN Number</th>
                  <th className="px-4 py-3">Linked PO</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Carrier / Tracking</th>
                  <th className="px-4 py-3">Expected Arrival</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">ETA Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {asns.map(asn => {
                  const eta = getDynamicEtaBadge(asn.expectedArrival);
                  return (
                    <tr key={asn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-[#2490ef]">{asn.asnNumber}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{asn.poNumber}</td>
                      <td className="px-4 py-3 font-medium">{asn.supplier}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{asn.carrier}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{asn.awbTracking}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{asn.expectedArrival}</td>
                      <td className="px-4 py-3 text-gray-600">{asn.cartonsPallets}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${eta.style}`}>
                          <Clock className="h-3 w-3" /> {eta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD ASN MODAL */}
      <Dialog open={asnModalOpen} onOpenChange={setAsnModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Advance Shipment Notice (ASN)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddASN} className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Linked Purchase Order</Label>
              <select
                className="w-full text-xs border rounded-md p-2 mt-1 bg-white"
                value={asnForm.poNumber}
                onChange={e => setAsnForm({ ...asnForm, poNumber: e.target.value })}
              >
                {pos.map(p => (
                  <option key={p.id} value={p.poNumber}>{p.poNumber} — {p.supplierName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Carrier Name</Label>
                <Input className="text-xs mt-1" value={asnForm.carrier} onChange={e => setAsnForm({ ...asnForm, carrier: e.target.value })} placeholder="e.g. DHL Express" required />
              </div>
              <div>
                <Label className="text-xs">Tracking / AWB Number</Label>
                <Input className="text-xs mt-1" value={asnForm.awbTracking} onChange={e => setAsnForm({ ...asnForm, awbTracking: e.target.value })} placeholder="e.g. AWB-991203" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Expected Arrival Date & Time</Label>
                <Input type="datetime-local" className="text-xs mt-1" value={asnForm.expectedArrival} onChange={e => setAsnForm({ ...asnForm, expectedArrival: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Cartons / Pallets Count</Label>
                <Input className="text-xs mt-1" value={asnForm.cartonsPallets} onChange={e => setAsnForm({ ...asnForm, cartonsPallets: e.target.value })} placeholder="e.g. 4 Pallets / 50 Cartons" required />
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes / Special Handling</Label>
              <Textarea className="text-xs mt-1" value={asnForm.notes} onChange={e => setAsnForm({ ...asnForm, notes: e.target.value })} placeholder="Temperature control required..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAsnModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#2490ef] hover:bg-blue-600 text-white">Save ASN</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* FEATURE 4.3: INBOUND ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'inbound-orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inbound Warehouse Orders</h3>
              <p className="text-xs text-gray-500">Govern floor receiving execution independently or linked to PO/ASN</p>
            </div>
            <Button className="bg-[#2490ef] hover:bg-blue-600 text-white text-xs" onClick={() => setIoModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Create Inbound Order
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Inbound Order ID</th>
                  <th className="px-4 py-3">Linked PO / ASN</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Assigned Operator</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {inboundOrders.map(io => (
                  <tr key={io.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#2490ef]">{io.inboundOrderId}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{io.linkedRef}</td>
                    <td className="px-4 py-3 font-medium">{io.warehouse}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">{io.type}</span></td>
                    <td className="px-4 py-3">{io.assignedOperator}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${io.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {io.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{io.createdDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE INBOUND ORDER MODAL */}
      <Dialog open={ioModalOpen} onOpenChange={setIoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Inbound Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInboundOrder} className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Order Type</Label>
              <select className="w-full text-xs border rounded-md p-2 mt-1 bg-white" value={ioForm.type} onChange={e => setIoForm({ ...ioForm, type: e.target.value as any })}>
                <option value="PO-based">PO-based Receiving</option>
                <option value="Return">Customer Return</option>
                <option value="Transfer-In">Inter-warehouse Transfer In</option>
                <option value="Direct">Direct Unplanned Receipt</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Linked Reference (PO / ASN / Return ID)</Label>
              <Input className="text-xs mt-1" value={ioForm.linkedRef} onChange={e => setIoForm({ ...ioForm, linkedRef: e.target.value })} placeholder="e.g. PO-2026-001" required />
            </div>
            <div>
              <Label className="text-xs">Destination Warehouse</Label>
              <select className="w-full text-xs border rounded-md p-2 mt-1 bg-white" value={ioForm.warehouse} onChange={e => setIoForm({ ...ioForm, warehouse: e.target.value })}>
                <option value="Jebel Ali Main Hub">Jebel Ali Main Hub</option>
                <option value="Dubai South Logistics City">Dubai South Logistics City</option>
                <option value="Al Quoz Central Warehouse">Al Quoz Central Warehouse</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Assigned Floor Operator</Label>
                <Input className="text-xs mt-1" value={ioForm.assignedOperator} onChange={e => setIoForm({ ...ioForm, assignedOperator: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Execution Priority</Label>
                <select className="w-full text-xs border rounded-md p-2 mt-1 bg-white" value={ioForm.priority} onChange={e => setIoForm({ ...ioForm, priority: e.target.value as any })}>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIoModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#2490ef] hover:bg-blue-600 text-white">Create Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* FEATURE 4.4: DOCK / APPOINTMENT SCHEDULING */}
      {/* ========================================================================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Dock & Vehicle Appointment Schedule</h3>
              <p className="text-xs text-gray-500">Manage time slots, truck bay assignments, and gate check-ins</p>
            </div>
            <Button className="bg-[#2490ef] hover:bg-blue-600 text-white text-xs" onClick={() => setAptModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Schedule Appointment
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Appointment ID</th>
                  <th className="px-4 py-3">Dock Door Bay</th>
                  <th className="px-4 py-3">Supplier / Carrier</th>
                  <th className="px-4 py-3">Vehicle Number</th>
                  <th className="px-4 py-3">Scheduled Time</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Linked Ref</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#2490ef]">{apt.appointmentId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{apt.dockDoor}</td>
                    <td className="px-4 py-3 font-medium">{apt.supplierCarrier}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{apt.vehicleNumber}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{apt.scheduledTime}</td>
                    <td className="px-4 py-3 text-gray-500">{apt.duration}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{apt.linkedRef}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        apt.status === 'Checked-In' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE APPOINTMENT MODAL */}
      <Dialog open={aptModalOpen} onOpenChange={setAptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Schedule Dock Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleAppointment} className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Dock Door Bay</Label>
              <select className="w-full text-xs border rounded-md p-2 mt-1 bg-white" value={aptForm.dockDoor} onChange={e => setAptForm({ ...aptForm, dockDoor: e.target.value })}>
                <option value="Dock Door #01 (Inbound)">Dock Door #01 (Inbound General)</option>
                <option value="Dock Door #02 (Refrigerated)">Dock Door #02 (Refrigerated Cold Room)</option>
                <option value="Dock Door #03 (Bulk Pallets)">Dock Door #03 (Bulk Heavy Pallets)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" className="text-xs mt-1" value={aptForm.date} onChange={e => setAptForm({ ...aptForm, date: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Time Slot</Label>
                <Input type="time" className="text-xs mt-1" value={aptForm.time} onChange={e => setAptForm({ ...aptForm, time: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Estimated Duration</Label>
                <Input className="text-xs mt-1" value={aptForm.duration} onChange={e => setAptForm({ ...aptForm, duration: e.target.value })} placeholder="e.g. 2 Hours" required />
              </div>
              <div>
                <Label className="text-xs">Vehicle Plate Number</Label>
                <Input className="text-xs mt-1" value={aptForm.vehicleNumber} onChange={e => setAptForm({ ...aptForm, vehicleNumber: e.target.value })} placeholder="e.g. DXB-TRK-9011" required />
              </div>
            </div>
            <div>
              <Label className="text-xs">Supplier / Carrier Name</Label>
              <Input className="text-xs mt-1" value={aptForm.supplierCarrier} onChange={e => setAptForm({ ...aptForm, supplierCarrier: e.target.value })} placeholder="e.g. DHL Express Gulf" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAptModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#2490ef] hover:bg-blue-600 text-white">Confirm Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* FEATURE 4.5: GOODS RECEIPT */}
      {/* ========================================================================= */}
      {activeTab === 'goods-receipt' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Goods Receipt Worksheet</h3>
              <p className="text-xs text-gray-500">Record physical quantities, inspect condition, and finalize receipt</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-600">Selected PO:</span>
              <select className="text-xs border rounded-md px-3 py-1.5 bg-white font-mono font-medium" value={receiptPoSelect} onChange={e => setReceiptPoSelect(e.target.value)}>
                {pos.map(p => (
                  <option key={p.id} value={p.poNumber}>{p.poNumber} — {p.supplierName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SUMMARY KPI BAR */}
          <div className="grid grid-cols-4 gap-3 text-xs">
            <Card className="p-3 bg-blue-50 border-blue-200">
              <span className="text-gray-500 font-medium">Total Line Items</span>
              <div className="text-lg font-bold text-blue-900 mt-0.5">{receiptWorksheet.length} Lines</div>
            </Card>
            <Card className="p-3 bg-emerald-50 border-emerald-200">
              <span className="text-gray-500 font-medium">Fully Received</span>
              <div className="text-lg font-bold text-emerald-900 mt-0.5">1 SKU</div>
            </Card>
            <Card className="p-3 bg-amber-50 border-amber-200">
              <span className="text-gray-500 font-medium">Partially Received</span>
              <div className="text-lg font-bold text-amber-900 mt-0.5">1 SKU</div>
            </Card>
            <Card className="p-3 bg-gray-50 border-gray-200">
              <span className="text-gray-500 font-medium">Not Yet Received</span>
              <div className="text-lg font-bold text-gray-900 mt-0.5">0 SKUs</div>
            </Card>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Ordered Qty</th>
                  <th className="px-4 py-3 w-32">Received Qty (Input)</th>
                  <th className="px-4 py-3">UOM</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Variance Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {receiptWorksheet.map((line, idx) => {
                  const hasVariance = line.receivedQty !== line.orderedQty;
                  return (
                    <tr key={line.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-[#2490ef]">{line.sku}</td>
                      <td className="px-4 py-3 font-medium">{line.productName}</td>
                      <td className="px-4 py-3 font-semibold">{line.orderedQty}</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          className="h-8 text-xs font-bold text-blue-700 border-blue-300"
                          value={line.receivedQty}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setReceiptWorksheet(receiptWorksheet.map((l, i) => i === idx ? { ...l, receivedQty: val } : l));
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono">{line.uom}</td>
                      <td className="px-4 py-3">
                        <select
                          className="text-xs border rounded px-2 py-1 bg-white font-medium"
                          value={line.condition}
                          onChange={e => setReceiptWorksheet(receiptWorksheet.map((l, i) => i === idx ? { ...l, condition: e.target.value as any } : l))}
                        >
                          <option value="Good">Good</option>
                          <option value="Damaged">Damaged</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          className="h-8 text-xs"
                          value={line.notes}
                          onChange={e => setReceiptWorksheet(receiptWorksheet.map((l, i) => i === idx ? { ...l, notes: e.target.value } : l))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {hasVariance ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="h-3 w-3" /> Shortage ({line.receivedQty - line.orderedQty})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Match
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs" onClick={handleCompleteReceipt}>
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Complete Goods Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 4.6: BARCODE RECEIVING */}
      {/* ========================================================================= */}
      {activeTab === 'barcode-receiving' && (
        <div className="space-y-4">
          {/* LARGE BARCODE SCANNER INPUT */}
          <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-lg shadow-md">
            <div className="max-w-xl mx-auto text-center space-y-3">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/10 text-white">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold">Barcode Scanner Handheld Interface</h3>
              <p className="text-xs text-blue-200">Scan product EAN / UPC / GS1 barcodes or manually enter SKU to increment receiving tally</p>
              
              <form onSubmit={handleBarcodeScan} className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="Scan barcode or enter SKU code..."
                  value={scannedBarcode}
                  onChange={e => setScannedBarcode(e.target.value)}
                  className="bg-white text-gray-900 text-sm h-11 shadow-inner font-mono"
                />
                <Button type="submit" className="bg-[#2490ef] hover:bg-blue-600 text-white px-6 h-11">
                  Scan
                </Button>
              </form>
            </div>
          </Card>

          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                Total Scanned: 30 Items
              </div>
              <span className="text-xs text-gray-500">Live barcode receiving stream</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setManualAddModal(true)}>
              + Add Item Without Scan
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Description</th>
                  <th className="px-4 py-3">Scanned Qty</th>
                  <th className="px-4 py-3">Last Scan Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {barcodeScans.map(scan => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{scan.barcode}</td>
                    <td className="px-4 py-3 font-mono text-[#2490ef] font-semibold">{scan.sku}</td>
                    <td className="px-4 py-3 font-medium">{scan.productName}</td>
                    <td className="px-4 py-3"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">{scan.scannedQty} units</span></td>
                    <td className="px-4 py-3 text-gray-500 font-mono">{scan.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANUAL BARCODE MODAL */}
      <Dialog open={manualAddModal} onOpenChange={setManualAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Item Without Barcode Scan</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">SKU Code</Label>
              <Input className="text-xs mt-1" value={manualBarcodeForm.sku} onChange={e => setManualBarcodeForm({ ...manualBarcodeForm, sku: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Product Name</Label>
              <Input className="text-xs mt-1" value={manualBarcodeForm.productName} onChange={e => setManualBarcodeForm({ ...manualBarcodeForm, productName: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Quantity</Label>
              <Input type="number" className="text-xs mt-1" value={manualBarcodeForm.qty} onChange={e => setManualBarcodeForm({ ...manualBarcodeForm, qty: Number(e.target.value) })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setManualAddModal(false)}>Cancel</Button>
              <Button className="bg-[#2490ef] text-white" onClick={() => {
                const newB: BarcodeScanItem = {
                  id: `bs-${Date.now()}`,
                  barcode: 'MANUAL-ENTRY',
                  sku: manualBarcodeForm.sku,
                  productName: manualBarcodeForm.productName,
                  scannedQty: manualBarcodeForm.qty,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setBarcodeScans([newB, ...barcodeScans]);
                setManualAddModal(false);
                toast.success('Manual entry added to scan stream');
              }}>Save Entry</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* FEATURE 4.7: SHORT / EXCESS RECEIVING */}
      {/* ========================================================================= */}
      {activeTab === 'short-excess' && (
        <div className="space-y-4">
          {/* KPI CARDS */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            <Card className="p-4 bg-white border-l-4 border-l-amber-500 shadow-xs">
              <span className="text-gray-500 font-semibold block">Total Discrepancies Logged</span>
              <div className="text-2xl font-bold text-gray-900 mt-1">{discrepancies.length} Issues</div>
            </Card>
            <Card className="p-4 bg-white border-l-4 border-l-red-500 shadow-xs">
              <span className="text-gray-500 font-semibold block">Open Discrepancies</span>
              <div className="text-2xl font-bold text-red-600 mt-1">{discrepancies.filter(d => d.status === 'Open').length} Open</div>
            </Card>
            <Card className="p-4 bg-white border-l-4 border-l-emerald-500 shadow-xs">
              <span className="text-gray-500 font-semibold block">Resolved Discrepancies</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{discrepancies.filter(d => d.status === 'Resolved').length} Resolved</div>
            </Card>
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Shortage & Excess Discrepancy Log</h3>
              <p className="text-xs text-gray-500">Record supplier quantity mismatches and damage variance</p>
            </div>
            <Button className="bg-[#2490ef] hover:bg-blue-600 text-white text-xs" onClick={() => setDiscModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Log Discrepancy
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">PO / Order Ref</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Ordered Qty</th>
                  <th className="px-4 py-3">Received Qty</th>
                  <th className="px-4 py-3">Variance</th>
                  <th className="px-4 py-3">Reason Code</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {discrepancies.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-[#2490ef]">{d.refOrder}</td>
                    <td className="px-4 py-3 font-mono font-medium">{d.sku}</td>
                    <td className="px-4 py-3 font-medium">{d.productName}</td>
                    <td className="px-4 py-3">{d.orderedQty}</td>
                    <td className="px-4 py-3">{d.receivedQty}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        d.variance < 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {d.variance > 0 ? `+${d.variance}` : d.variance}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{d.reasonCode}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        d.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOG DISCREPANCY MODAL */}
      <Dialog open={discModalOpen} onOpenChange={setDiscModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Log Discrepancy Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogDiscrepancy} className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Reference PO / Inbound Order</Label>
              <Input className="text-xs mt-1" value={discForm.refOrder} onChange={e => setDiscForm({ ...discForm, refOrder: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">SKU Code</Label>
              <Input className="text-xs mt-1" value={discForm.sku} onChange={e => setDiscForm({ ...discForm, sku: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Ordered Qty</Label>
                <Input type="number" className="text-xs mt-1" value={discForm.orderedQty} onChange={e => setDiscForm({ ...discForm, orderedQty: Number(e.target.value) })} required />
              </div>
              <div>
                <Label className="text-xs">Received Qty</Label>
                <Input type="number" className="text-xs mt-1" value={discForm.receivedQty} onChange={e => setDiscForm({ ...discForm, receivedQty: Number(e.target.value) })} required />
              </div>
            </div>
            <div>
              <Label className="text-xs">Reason Code</Label>
              <select className="w-full text-xs border rounded-md p-2 mt-1 bg-white" value={discForm.reasonCode} onChange={e => setDiscForm({ ...discForm, reasonCode: e.target.value as any })}>
                <option value="Damaged in Transit">Damaged in Transit</option>
                <option value="Supplier Error">Supplier Shortage / Error</option>
                <option value="Miscount">Floor Miscount</option>
                <option value="Other">Other Discrepancy</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Discrepancy Notes</Label>
              <Textarea className="text-xs mt-1" value={discForm.notes} onChange={e => setDiscForm({ ...discForm, notes: e.target.value })} placeholder="Describe carton damage or missing box counts..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDiscModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#2490ef] text-white">Save Discrepancy</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* FEATURE 4.8: QUALITY INSPECTION */}
      {/* ========================================================================= */}
      {activeTab === 'quality-inspection' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inbound Quality Control & Inspection</h3>
              <p className="text-xs text-gray-500">Hold incoming goods for technical QA approval prior to storage</p>
            </div>
            <Button className="bg-[#2490ef] hover:bg-blue-600 text-white text-xs" onClick={() => setInspectionModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Send to Inspection
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Inspection ID</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Batch / Lot</th>
                  <th className="px-4 py-3">Qty Under Inspection</th>
                  <th className="px-4 py-3">Assigned Inspector</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3 text-right">Pass / Fail Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {inspections.map(qc => (
                  <tr key={qc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#2490ef] whitespace-nowrap">{qc.inspectionId}</td>
                    <td className="px-4 py-3 font-mono font-medium whitespace-nowrap">{qc.sku}</td>
                    <td className="px-4 py-3 font-medium">{qc.productName}</td>
                    <td className="px-4 py-3 font-mono text-gray-600 whitespace-nowrap">{qc.batchLot}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{qc.qty} units</td>
                    <td className="px-4 py-3 text-gray-600">{qc.inspector}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        qc.result === 'Passed' ? 'bg-emerald-100 text-emerald-800' :
                        qc.result === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {qc.result}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {qc.result === 'Pending' && (
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                          <Button size="sm" className="h-8 text-xs whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleInspectionPass(qc.id)}>
                            <Check className="h-3.5 w-3.5 mr-1" /> Pass
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 text-xs whitespace-nowrap" onClick={() => handleInspectionFail(qc)}>
                            <X className="h-3.5 w-3.5 mr-1" /> Fail
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEND TO INSPECTION MODAL */}
      <Dialog open={inspectionModalOpen} onOpenChange={setInspectionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Send Goods to Quality Inspection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendInspection} className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">SKU Code</Label>
              <Input className="text-xs mt-1" value={inspectionForm.sku} onChange={e => setInspectionForm({ ...inspectionForm, sku: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">Product Description</Label>
              <Input className="text-xs mt-1" value={inspectionForm.productName} onChange={e => setInspectionForm({ ...inspectionForm, productName: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Batch / Lot Number</Label>
                <Input className="text-xs mt-1" value={inspectionForm.batchLot} onChange={e => setInspectionForm({ ...inspectionForm, batchLot: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Quantity to Inspect</Label>
                <Input type="number" className="text-xs mt-1" value={inspectionForm.qty} onChange={e => setInspectionForm({ ...inspectionForm, qty: Number(e.target.value) })} required />
              </div>
            </div>
            <div>
              <Label className="text-xs">Assigned Inspector</Label>
              <Input className="text-xs mt-1" value={inspectionForm.inspector} onChange={e => setInspectionForm({ ...inspectionForm, inspector: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">QC Checklist & Inspection Notes</Label>
              <Textarea className="text-xs mt-1" value={inspectionForm.notes} onChange={e => setInspectionForm({ ...inspectionForm, notes: e.target.value })} placeholder="Describe testing criteria..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInspectionModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#2490ef] text-white">Create QC Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* FEATURE 4.9: QUARANTINE STOCK */}
      {/* ========================================================================= */}
      {activeTab === 'quarantine' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Quarantine Stock Management</h3>
              <p className="text-xs text-gray-500">Isolate damaged, expired, or failed QC stock away from pickable inventory</p>
            </div>
            <Button className="bg-[#2490ef] hover:bg-blue-600 text-white text-xs" onClick={() => setQuarantineModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Move to Quarantine
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Batch / Lot</th>
                  <th className="px-4 py-3">Quarantined Qty</th>
                  <th className="px-4 py-3">Quarantine Reason</th>
                  <th className="px-4 py-3">Quarantine Bin Location</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Release Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {quarantineList.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-[#2490ef]">{q.sku}</td>
                    <td className="px-4 py-3 font-medium">{q.productName}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{q.batchLot}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{q.qty} units</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{q.reason}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{q.location}</td>
                    <td className="px-4 py-3 text-gray-500">{q.dateQuarantined}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        q.status === 'Released' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {q.status === 'In Quarantine' ? (
                        <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50" onClick={() => handleReleaseQuarantine(q.id)}>
                          <LockKeyholeOpen className="h-3.5 w-3.5 mr-1" /> Release Stock
                        </Button>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-medium">Released</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MOVE TO QUARANTINE MODAL */}
      <Dialog open={quarantineModalOpen} onOpenChange={setQuarantineModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Move Stock to Quarantine Zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">SKU Code</Label>
              <Input className="text-xs mt-1" value={quarantineForm.sku} onChange={e => setQuarantineForm({ ...quarantineForm, sku: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Product Description</Label>
              <Input className="text-xs mt-1" value={quarantineForm.productName} onChange={e => setQuarantineForm({ ...quarantineForm, productName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Batch / Lot Number</Label>
                <Input className="text-xs mt-1" value={quarantineForm.batchLot} onChange={e => setQuarantineForm({ ...quarantineForm, batchLot: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Quantity</Label>
                <Input type="number" className="text-xs mt-1" value={quarantineForm.qty} onChange={e => setQuarantineForm({ ...quarantineForm, qty: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Quarantine Reason</Label>
              <select className="w-full text-xs border rounded-md p-2 mt-1 bg-white" value={quarantineForm.reason} onChange={e => setQuarantineForm({ ...quarantineForm, reason: e.target.value as any })}>
                <option value="Failed QC">Failed QC Inspection</option>
                <option value="Damaged">Damaged Goods</option>
                <option value="Expired">Expired Stock</option>
                <option value="Under Investigation">Under Investigation</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Destination Quarantine Bay</Label>
              <Input className="text-xs mt-1 font-mono" value={quarantineForm.location} onChange={e => setQuarantineForm({ ...quarantineForm, location: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuarantineModalOpen(false)}>Cancel</Button>
              <Button className="bg-[#2490ef] text-white" onClick={() => {
                const newQ: QuarantineItem = {
                  id: `qua-${Date.now()}`,
                  sku: quarantineForm.sku,
                  productName: quarantineForm.productName,
                  batchLot: quarantineForm.batchLot,
                  qty: quarantineForm.qty,
                  reason: quarantineForm.reason,
                  location: quarantineForm.location,
                  dateQuarantined: new Date().toISOString().split('T')[0],
                  status: 'In Quarantine'
                };
                setQuarantineList([newQ, ...quarantineList]);
                setQuarantineModalOpen(false);
                toast.success(`Moved ${newQ.qty} units of ${newQ.sku} to Quarantine.`);
              }}>Move to Quarantine</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* FEATURE 4.10: PUTAWAY QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'putaway' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inbound Putaway Execution Queue</h3>
              <p className="text-xs text-gray-500">System recommended bin slotting locations based on velocity, zone rules, and capacity</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Zone Filter:</span>
              <select
                className="text-xs border border-gray-300 rounded-md px-3 py-1.5 bg-white font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2490ef]"
                value={putawayZoneFilter}
                onChange={(e) => setPutawayZoneFilter(e.target.value)}
              >
                <option value="ALL">All Zones</option>
                <option value="Zone A">Zone A - High Value</option>
                <option value="Zone C">Zone C - Staging</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Qty to Put Away</th>
                  <th className="px-4 py-3">Suggested Bin Location</th>
                  <th className="px-4 py-3">Warehouse / Zone</th>
                  <th className="px-4 py-3">Match Confidence</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Putaway Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {putawayQueue
                  .filter(p => putawayZoneFilter === 'ALL' || p.zone.toLowerCase().includes(putawayZoneFilter.toLowerCase()))
                  .map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-[#2490ef] whitespace-nowrap">{p.sku}</td>
                      <td className="px-4 py-3 font-medium">{p.productName}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{p.qty} units</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block my-1 whitespace-nowrap">{p.suggestedBin}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.warehouse} ({p.zone})</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                          {p.confidence}% Match
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {p.status === 'Pending' && (
                          <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                            <Button size="sm" variant="outline" className="h-8 text-xs whitespace-nowrap" onClick={() => { setPutawayOverrideModal(p); setOverrideBin(p.suggestedBin); }}>
                              Override Bin
                            </Button>
                            <Button size="sm" className="h-8 text-xs whitespace-nowrap bg-[#2490ef] hover:bg-blue-600 text-white" onClick={() => handleConfirmPutaway(p.id)}>
                              <Check className="h-3.5 w-3.5 mr-1" /> Confirm Putaway
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OVERRIDE BIN MODAL */}
      {putawayOverrideModal && (
        <Dialog open={Boolean(putawayOverrideModal)} onOpenChange={() => setPutawayOverrideModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Override Putaway Bin Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs">
              <p className="text-gray-600">Select an alternate target bin for SKU <span className="font-mono font-bold text-[#2490ef]">{putawayOverrideModal.sku}</span>.</p>
              <div>
                <Label className="text-xs">Target Bin Location Code</Label>
                <Input className="text-xs font-mono mt-1" value={overrideBin} onChange={e => setOverrideBin(e.target.value)} placeholder="e.g. WH1-ZN-A-A02-R01-S3-B02" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPutawayOverrideModal(null)}>Cancel</Button>
                <Button className="bg-[#2490ef] text-white" onClick={handleSavePutawayOverride}>Confirm Override</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 4.11: GRN GENERATION */}
      {/* ========================================================================= */}
      {activeTab === 'grn' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Goods Receipt Note (GRN) Documents</h3>
              <p className="text-xs text-gray-500">Official receiving documentation generated for accounts and supplier matching</p>
            </div>
            <Button className="bg-[#2490ef] hover:bg-blue-600 text-white text-xs" onClick={() => handleGenerateGRN(pos[0])}>
              <FileCheck2 className="h-4 w-4 mr-1" /> Generate GRN Document
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">GRN Number</th>
                  <th className="px-4 py-3">Linked PO</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Date Generated</th>
                  <th className="px-4 py-3">Total SKUs</th>
                  <th className="px-4 py-3">Total Qty Received</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Document Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {grnList.map(grn => (
                  <tr key={grn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#2490ef]">{grn.grnNumber}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{grn.poNumber}</td>
                    <td className="px-4 py-3 font-medium">{grn.supplier}</td>
                    <td className="px-4 py-3 text-gray-500">{grn.dateGenerated}</td>
                    <td className="px-4 py-3 font-medium">{grn.totalSkus} SKUs</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{grn.totalQtyReceived} units</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        {grn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setGrnPreviewModal(grn)}>
                        <Printer className="h-3.5 w-3.5 mr-1" /> View Printable GRN
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE GRN DOCUMENT PREVIEW MODAL */}
      {grnPreviewModal && (
        <Dialog open={Boolean(grnPreviewModal)} onOpenChange={() => setGrnPreviewModal(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-base font-bold border-b pb-2">
                <span>GOODS RECEIPT NOTE (GRN) — OFFICIAL DOCUMENT</span>
                <span className="font-mono text-[#2490ef] text-sm">{grnPreviewModal.grnNumber}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs my-2 p-4 bg-white rounded border border-gray-300 font-sans">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">ORUS WMS LOGISTICS HUBS</h4>
                  <p className="text-gray-500">Jebel Ali Free Zone, Warehouse Bay 04</p>
                  <p className="text-gray-500">Dubai, United Arab Emirates</p>
                </div>
                <div className="text-right">
                  <p><span className="text-gray-500">Date:</span> <span className="font-semibold">{grnPreviewModal.dateGenerated}</span></p>
                  <p><span className="text-gray-500">PO Ref:</span> <span className="font-mono font-semibold">{grnPreviewModal.poNumber}</span></p>
                  <p><span className="text-gray-500">Supplier:</span> <span className="font-semibold">{grnPreviewModal.supplier}</span></p>
                </div>
              </div>

              <div className="border rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 border-b font-semibold">
                    <tr>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Product Description</th>
                      <th className="px-3 py-2">Ordered Qty</th>
                      <th className="px-3 py-2">Received Qty</th>
                      <th className="px-3 py-2">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {grnPreviewModal.items.map(item => (
                      <tr key={item.sku}>
                        <td className="px-3 py-2 font-mono font-medium">{item.sku}</td>
                        <td className="px-3 py-2">{item.productName}</td>
                        <td className="px-3 py-2 font-semibold">{item.orderedQty}</td>
                        <td className="px-3 py-2 font-semibold text-emerald-700">{item.receivedQty}</td>
                        <td className="px-3 py-2 font-semibold text-gray-700">{item.variance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-[11px] text-gray-400">
                  Document generated automatically by Orus WMS Inbound Engine.
                </div>
                <div className="text-right font-bold text-sm text-gray-900">
                  Total Accepted Stock: {grnPreviewModal.totalQtyReceived} units
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setGrnPreviewModal(null)}>Close</Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => toast.success('Downloading GRN PDF document...')}>
                  <Download className="h-4 w-4 mr-1" /> Download PDF
                </Button>
                <Button className="bg-[#2490ef] text-white" onClick={() => toast.success('Sending GRN to thermal/PDF printer...')}>
                  <Printer className="h-4 w-4 mr-1" /> Print GRN
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
