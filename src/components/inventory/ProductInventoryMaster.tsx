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
  Package,
  Layers,
  Tags,
  Scale,
  Boxes,
  ClipboardList,
  KeyRound,
  CalendarDays,
  SlidersHorizontal,
  Activity,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ArrowRight
} from 'lucide-react';

// --- TYPES ---
export interface SKUItem {
  id: string;
  skuCode: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  brand: string;
  baseUom: string;
  type: 'Product' | 'Service' | 'Raw Material' | 'Inventory';
  costPrice: number;
  salePrice: number;
  taxRate: number;
  minStockLevel: number;
  valuationMethod: 'Moving Average' | 'FIFO' | 'LIFO' | 'Standard Costing';
  reorderLevel: number;
  reorderQty: number;
  status: 'Active' | 'Inactive' | 'Discontinued';
  createdDate: string;
  batchTracking: boolean;
  serialTracking: boolean;
  primaryBarcode: string;
  barcodeType: string;
  alternateBarcodes: string[];
  packHierarchyChain: string;
  length: number;
  width: number;
  height: number;
  cbm: number;
  netWeight: number;
  grossWeight: number;
  countryOfOrigin: string;
  flag: string;
  manufacturer: string;
  hsCode: string;
  hsDescription: string;
  customsCategory: string;
  dutyRate: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  productCount: number;
  subCategories: {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    productCount: number;
  }[];
}

export interface UOMItem {
  id: string;
  code: string;
  name: string;
  type: 'Count' | 'Weight' | 'Volume';
  isBaseUnit: boolean;
  status: 'Active' | 'Inactive';
}

export interface BatchItem {
  id: string;
  skuCode: string;
  productName: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  warehouse: string;
  zone: string;
  status: 'Active' | 'Depleted' | 'Blocked';
}

export interface SerialItem {
  id: string;
  skuCode: string;
  productName: string;
  serialNumber: string;
  status: 'In Stock' | 'Sold' | 'Returned' | 'Under Repair';
  warehouseLocation: string;
  lastUpdated: string;
}

// --- INITIAL SEED DATA ---
const INITIAL_SKUS: SKUItem[] = [
  {
    id: 'sku-1',
    skuCode: 'SKU-ELC-001',
    name: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
    description: 'Flagship smartphone with A17 Pro chip and Titanium chassis',
    category: 'Electronics',
    subCategory: 'Smartphones',
    brand: 'Apple',
    baseUom: 'EA',
    type: 'Product',
    costPrice: 4200,
    salePrice: 4899,
    taxRate: 5,
    minStockLevel: 10,
    valuationMethod: 'Moving Average',
    reorderLevel: 15,
    reorderQty: 50,
    status: 'Active',
    createdDate: '2026-01-15',
    batchTracking: true,
    serialTracking: true,
    primaryBarcode: '194253091001',
    barcodeType: 'UPC',
    alternateBarcodes: ['EAN-690123456789', 'QR-APL-IP15P-256', 'CODE128-IP15-NAT'],
    packHierarchyChain: '1 Pallet = 40 Cartons = 480 Pieces',
    length: 16.0,
    width: 7.7,
    height: 0.83,
    cbm: 0.000102,
    netWeight: 0.221,
    grossWeight: 0.450,
    countryOfOrigin: 'China',
    flag: '🇨🇳',
    manufacturer: 'Foxconn Technology Group / Apple Inc.',
    hsCode: '8517.13',
    hsDescription: 'Smartphones for cellular networks or for other wireless networks',
    customsCategory: 'Duty Free (UAE Free Zone)',
    dutyRate: 0.0
  },
  {
    id: 'sku-2',
    skuCode: 'SKU-ELC-002',
    name: 'Sony Bravia XR 65 Inch 4K OLED TV',
    description: 'Cognitive Processor XR with Acoustic Surface Audio+',
    category: 'Electronics',
    subCategory: 'Televisions',
    brand: 'Sony',
    baseUom: 'EA',
    type: 'Product',
    costPrice: 6500,
    salePrice: 7999,
    taxRate: 5,
    minStockLevel: 5,
    valuationMethod: 'Moving Average',
    reorderLevel: 8,
    reorderQty: 20,
    status: 'Active',
    createdDate: '2026-02-10',
    batchTracking: false,
    serialTracking: true,
    primaryBarcode: '4548736123456',
    barcodeType: 'EAN-13',
    alternateBarcodes: ['QR-SONY-65XR-OLED', 'CODE128-SNY-TV-02'],
    packHierarchyChain: '1 Pallet = 10 Cartons = 10 Units',
    length: 144.0,
    width: 83.0,
    height: 18.0,
    cbm: 0.215136,
    netWeight: 22.5,
    grossWeight: 29.0,
    countryOfOrigin: 'Japan',
    flag: '🇯🇵',
    manufacturer: 'Sony Corporation Tokyo',
    hsCode: '8528.72',
    hsDescription: 'Reception apparatus for television, color, OLED display',
    customsCategory: 'Standard Commercial',
    dutyRate: 5.0
  },
  {
    id: 'sku-3',
    skuCode: 'SKU-FRG-101',
    name: 'Oud Royal Luxury Eau de Parfum 100ml',
    description: 'Handcrafted luxury Arabian fragrance infused with Cambodian Oud oil',
    category: 'Perfumes & Cosmetics',
    subCategory: 'Fragrances',
    brand: 'Arabian Oud',
    baseUom: 'BOT',
    type: 'Product',
    costPrice: 280,
    salePrice: 450,
    taxRate: 5,
    minStockLevel: 25,
    valuationMethod: 'FIFO',
    reorderLevel: 40,
    reorderQty: 100,
    status: 'Active',
    createdDate: '2026-03-01',
    batchTracking: true,
    serialTracking: false,
    primaryBarcode: '629101234567',
    barcodeType: 'EAN-13',
    alternateBarcodes: ['QR-OUD-ROYAL-100', 'EAN-629109876543'],
    packHierarchyChain: '1 Pallet = 50 Cartons = 600 Bottles',
    length: 12.0,
    width: 8.0,
    height: 15.0,
    cbm: 0.001440,
    netWeight: 0.350,
    grossWeight: 0.580,
    countryOfOrigin: 'United Arab Emirates',
    flag: '🇦🇪',
    manufacturer: 'Arabian Oud Perfumes Factory LLC Dubai',
    hsCode: '3303.00',
    hsDescription: 'Perfumes and toilet waters',
    customsCategory: 'Standard Customs Bonded',
    dutyRate: 5.0
  },
  {
    id: 'sku-4',
    skuCode: 'SKU-FMC-201',
    name: 'Organic Medjool Dates 1kg Premium Box',
    description: 'Fresh Grade-A Medjool Dates packed in Dubai South Free Zone',
    category: 'FMCG & Food',
    subCategory: 'Confectionery',
    brand: 'Al Foah',
    baseUom: 'BOX',
    type: 'Product',
    costPrice: 25,
    salePrice: 45,
    taxRate: 0,
    minStockLevel: 100,
    valuationMethod: 'FIFO',
    reorderLevel: 200,
    reorderQty: 500,
    status: 'Active',
    createdDate: '2026-03-05',
    batchTracking: true,
    serialTracking: false,
    primaryBarcode: '629400112233',
    barcodeType: 'EAN-13',
    alternateBarcodes: ['BAR-DATES-1KG-BOX', 'QR-ALFOAH-MEDJOOL'],
    packHierarchyChain: '1 Pallet = 30 Master Cases = 300 Boxes',
    length: 25.0,
    width: 18.0,
    height: 10.0,
    cbm: 0.004500,
    netWeight: 1.000,
    grossWeight: 1.150,
    countryOfOrigin: 'United Arab Emirates',
    flag: '🇦🇪',
    manufacturer: 'Al Foah Date Processing Plant Al Ain',
    hsCode: '0804.10',
    hsDescription: 'Dates, fresh or dried',
    customsCategory: 'Agricultural Exempt',
    dutyRate: 0.0
  },
  {
    id: 'sku-5',
    skuCode: 'SKU-AUT-301',
    name: 'Michelin Pilot Sport 4S 245/40 R19',
    description: 'Ultra-high performance sports tire with dual-compound technology',
    category: 'Automotive',
    subCategory: 'Tires & Wheels',
    brand: 'Michelin',
    baseUom: 'EA',
    type: 'Product',
    costPrice: 650,
    salePrice: 950,
    taxRate: 5,
    minStockLevel: 20,
    valuationMethod: 'Moving Average',
    reorderLevel: 30,
    reorderQty: 80,
    status: 'Active',
    createdDate: '2026-03-12',
    batchTracking: true,
    serialTracking: false,
    primaryBarcode: '352870123456',
    barcodeType: 'Code128',
    alternateBarcodes: ['QR-MCH-PS4S-19'],
    packHierarchyChain: '1 Pallet = 20 Tires',
    length: 67.0,
    width: 67.0,
    height: 24.5,
    cbm: 0.109980,
    netWeight: 10.80,
    grossWeight: 11.20,
    countryOfOrigin: 'France',
    flag: '🇫🇷',
    manufacturer: 'Manufacture Française des Pneumatiques Michelin',
    hsCode: '4011.10',
    hsDescription: 'New pneumatic tyres of rubber, of a kind used on motor cars',
    customsCategory: 'Standard Commercial',
    dutyRate: 5.0
  },
  {
    id: 'sku-6',
    skuCode: 'SKU-APL-401',
    name: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Laser reveals microscopic dust; HEPA filtration system',
    category: 'Home Appliances',
    subCategory: 'Vacuum Cleaners',
    brand: 'Dyson',
    baseUom: 'EA',
    type: 'Product',
    costPrice: 1800,
    salePrice: 2499,
    taxRate: 5,
    minStockLevel: 5,
    valuationMethod: 'Moving Average',
    reorderLevel: 10,
    reorderQty: 25,
    status: 'Discontinued',
    createdDate: '2025-11-20',
    batchTracking: false,
    serialTracking: true,
    primaryBarcode: '5025155012345',
    barcodeType: 'EAN-13',
    alternateBarcodes: ['QR-DYS-V15-DET'],
    packHierarchyChain: '1 Pallet = 16 Cartons = 16 Units',
    length: 126.0,
    width: 25.0,
    height: 26.0,
    cbm: 0.081900,
    netWeight: 3.10,
    grossWeight: 5.40,
    countryOfOrigin: 'United Kingdom',
    flag: '🇬🇧',
    manufacturer: 'Dyson Operations Limited Malmesbury',
    hsCode: '8508.11',
    hsDescription: 'Vacuum cleaners with self-contained electric motor',
    customsCategory: 'Standard Commercial',
    dutyRate: 5.0
  }
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Consumer gadgets, smartphones, TVs, audio & accessories',
    status: 'Active',
    productCount: 128,
    subCategories: [
      { id: 'sub-11', name: 'Smartphones', description: 'Mobile phones & phablets', status: 'Active', productCount: 42 },
      { id: 'sub-12', name: 'Televisions', description: 'Smart 4K/8K TVs & displays', status: 'Active', productCount: 28 },
      { id: 'sub-13', name: 'Laptops & PCs', description: 'Laptops, notebooks & desktop PCs', status: 'Active', productCount: 35 },
      { id: 'sub-14', name: 'Audio Systems', description: 'Speakers, headphones & soundbars', status: 'Active', productCount: 23 }
    ]
  },
  {
    id: 'cat-2',
    name: 'Perfumes & Cosmetics',
    description: 'Luxury oriental perfumes, Oud, cosmetics & personal care',
    status: 'Active',
    productCount: 94,
    subCategories: [
      { id: 'sub-21', name: 'Fragrances', description: 'Perfumes, EDP, EDT & Oud oils', status: 'Active', productCount: 50 },
      { id: 'sub-22', name: 'Skincare', description: 'Moisturizers, serums & lotions', status: 'Active', productCount: 24 },
      { id: 'sub-23', name: 'Essential Oils', description: 'Concentrated perfume oils & bakhoor', status: 'Active', productCount: 20 }
    ]
  },
  {
    id: 'cat-3',
    name: 'FMCG & Food',
    description: 'Fast-moving consumer goods, dry foods, dates & beverages',
    status: 'Active',
    productCount: 210,
    subCategories: [
      { id: 'sub-31', name: 'Confectionery', description: 'Chocolates, dates & sweets', status: 'Active', productCount: 80 },
      { id: 'sub-32', name: 'Beverages', description: 'Juices, water & soft drinks', status: 'Active', productCount: 70 },
      { id: 'sub-33', name: 'Dry Foods', description: 'Rice, spices & packaged grains', status: 'Active', productCount: 60 }
    ]
  },
  {
    id: 'cat-4',
    name: 'Automotive',
    description: 'Car spare parts, tires, motor oils & vehicle accessories',
    status: 'Active',
    productCount: 65,
    subCategories: [
      { id: 'sub-41', name: 'Tires & Wheels', description: 'Passenger & commercial vehicle tires', status: 'Active', productCount: 30 },
      { id: 'sub-42', name: 'Engine Oils', description: 'Synthetic lubricants & fluids', status: 'Active', productCount: 20 },
      { id: 'sub-43', name: 'Spare Parts', description: 'Brake pads, filters & spark plugs', status: 'Active', productCount: 15 }
    ]
  },
  {
    id: 'cat-5',
    name: 'Home Appliances',
    description: 'Kitchen appliances, vacuum cleaners & climate control',
    status: 'Active',
    productCount: 45,
    subCategories: [
      { id: 'sub-51', name: 'Vacuum Cleaners', description: 'Cordless, robot & canister vacuums', status: 'Active', productCount: 15 },
      { id: 'sub-52', name: 'Air Purifiers', description: 'HEPA air purifiers & humidifiers', status: 'Active', productCount: 18 },
      { id: 'sub-53', name: 'Coffee Machines', description: 'Espresso & capsule coffee makers', status: 'Active', productCount: 12 }
    ]
  }
];

const INITIAL_UOMS: UOMItem[] = [
  { id: 'uom-1', code: 'EA', name: 'Each', type: 'Count', isBaseUnit: true, status: 'Active' },
  { id: 'uom-2', code: 'PC', name: 'Piece', type: 'Count', isBaseUnit: true, status: 'Active' },
  { id: 'uom-3', code: 'BOX', name: 'Box', type: 'Count', isBaseUnit: false, status: 'Active' },
  { id: 'uom-4', code: 'CTN', name: 'Carton', type: 'Count', isBaseUnit: false, status: 'Active' },
  { id: 'uom-5', code: 'PLT', name: 'Pallet', type: 'Count', isBaseUnit: false, status: 'Active' },
  { id: 'uom-6', code: 'KG', name: 'Kilogram', type: 'Weight', isBaseUnit: true, status: 'Active' },
  { id: 'uom-7', code: 'L', name: 'Liter', type: 'Volume', isBaseUnit: true, status: 'Active' },
  { id: 'uom-8', code: 'BOT', name: 'Bottle', type: 'Count', isBaseUnit: false, status: 'Active' }
];

const INITIAL_BATCHES: BatchItem[] = [
  {
    id: 'bat-1',
    skuCode: 'SKU-FRG-101',
    productName: 'Oud Royal Luxury Eau de Parfum 100ml',
    batchNumber: 'B2026-0819',
    mfgDate: '2026-01-10',
    expiryDate: '2028-01-10',
    quantity: 450,
    warehouse: 'Jebel Ali Main Hub',
    zone: 'Zone B - Cold Storage',
    status: 'Active'
  },
  {
    id: 'bat-2',
    skuCode: 'SKU-FRG-101',
    productName: 'Oud Royal Luxury Eau de Parfum 100ml',
    batchNumber: 'B2024-0512',
    mfgDate: '2024-05-12',
    expiryDate: '2026-09-10',
    quantity: 12,
    warehouse: 'Jebel Ali Main Hub',
    zone: 'Zone B - Cold Storage',
    status: 'Active'
  },
  {
    id: 'bat-3',
    skuCode: 'SKU-FMC-201',
    productName: 'Organic Medjool Dates 1kg Premium Box',
    batchNumber: 'B2026-0205',
    mfgDate: '2026-02-05',
    expiryDate: '2026-10-15',
    quantity: 1200,
    warehouse: 'Dubai South Logistics City',
    zone: 'Zone C - Staging',
    status: 'Active'
  },
  {
    id: 'bat-4',
    skuCode: 'SKU-AUT-301',
    productName: 'Michelin Pilot Sport 4S 245/40 R19',
    batchNumber: 'B2025-0914',
    mfgDate: '2025-09-14',
    expiryDate: '2030-09-14',
    quantity: 150,
    warehouse: 'Al Quoz Central',
    zone: 'Zone D - Bulk Storage',
    status: 'Blocked'
  }
];

const INITIAL_SERIALS: SerialItem[] = [
  {
    id: 'ser-1',
    skuCode: 'SKU-ELC-001',
    productName: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
    serialNumber: 'SN-IP15P-8839001',
    status: 'In Stock',
    warehouseLocation: 'Jebel Ali - Zone A - Aisle 01 - Bin A01-04',
    lastUpdated: '2026-09-20'
  },
  {
    id: 'ser-2',
    skuCode: 'SKU-ELC-001',
    productName: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
    serialNumber: 'SN-IP15P-8839002',
    status: 'In Stock',
    warehouseLocation: 'Jebel Ali - Zone A - Aisle 01 - Bin A01-05',
    lastUpdated: '2026-09-20'
  },
  {
    id: 'ser-3',
    skuCode: 'SKU-ELC-001',
    productName: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
    serialNumber: 'SN-IP15P-8839003',
    status: 'Sold',
    warehouseLocation: 'Dispatched (Sales Order SO-9921)',
    lastUpdated: '2026-09-18'
  },
  {
    id: 'ser-4',
    skuCode: 'SKU-ELC-002',
    productName: 'Sony Bravia XR 65 Inch 4K OLED TV',
    serialNumber: 'SN-SONY-65XR-011',
    status: 'Under Repair',
    warehouseLocation: 'Jebel Ali - Quarantine Zone',
    lastUpdated: '2026-09-15'
  }
];

interface ProductInventoryMasterProps {
  defaultTab?: string;
}

export default function ProductInventoryMaster({ defaultTab = 'sku-master' }: ProductInventoryMasterProps) {
  const router = useRouter();
  const activeTab = defaultTab;

  // Datasets
  const [skus, setSkus] = useState<SKUItem[]>(INITIAL_SKUS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [uoms, setUoms] = useState<UOMItem[]>(INITIAL_UOMS);
  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);
  const [serials, setSerials] = useState<SerialItem[]>(INITIAL_SERIALS);

  // Drawer & Inline state
  const [selectedSkuDetail, setSelectedSkuDetail] = useState<SKUItem | null>(null);
  const [skuDetailTab, setSkuDetailTab] = useState<'overview' | 'barcodes' | 'pack' | 'tracking' | 'expiry' | 'dimensions' | 'origin' | 'hs'>('overview');
  const [expandedBarcodeId, setExpandedBarcodeId] = useState<string | null>(null);

  // Modals state using Radix Dialog
  const [addSkuModal, setAddSkuModal] = useState(false);
  const [addCatModal, setAddCatModal] = useState(false);
  const [addSubCatModal, setAddSubCatModal] = useState(false);
  const [addBarcodeModal, setAddBarcodeModal] = useState(false);
  const [addUomModal, setAddUomModal] = useState(false);
  const [configurePackModal, setConfigurePackModal] = useState(false);
  const [addBatchModal, setAddBatchModal] = useState(false);
  const [addSerialModal, setAddSerialModal] = useState(false);
  const [addDimensionsModal, setAddDimensionsModal] = useState(false);
  const [addOriginModal, setAddOriginModal] = useState(false);
  const [addHsModal, setAddHsModal] = useState(false);

  // Edit target state IDs
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [editingUomId, setEditingUomId] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Filter States
  const [skuSearch, setSkuSearch] = useState('');
  const [skuCategoryFilter, setSkuCategoryFilter] = useState('All');
  const [skuStatusFilter, setSkuStatusFilter] = useState('All');
  const [skuBrandFilter, setSkuBrandFilter] = useState('All');

  const [selectedCategoryTree, setSelectedCategoryTree] = useState<string>(INITIAL_CATEGORIES[0].id);
  const [serialSearch, setSerialSearch] = useState('');
  const [expiryFilter, setExpiryFilter] = useState<'All' | 'Expiring in 30 Days' | 'Expired'>('All');
  const [originCountryFilter, setOriginCountryFilter] = useState('All');

  // New Product Form State matching Image 1 exact fields
  const [skuForm, setSkuForm] = useState({
    autoCode: false,
    skuCode: '',
    name: '',
    description: '',
    category: 'Uncategorized',
    subCategory: 'General',
    unit: 'None',
    type: 'Product' as SKUItem['type'],
    costPrice: 0,
    salePrice: 0,
    taxRate: 0,
    minStockLevel: 0,
    valuationMethod: 'Moving Average' as SKUItem['valuationMethod'],
    reorderLevel: 0,
    reorderQty: 0,
    brand: '',
    manufacturer: '',
    status: 'Active' as SKUItem['status'],
    batchTracking: false,
    serialTracking: false
  });

  const [catForm, setCatForm] = useState({ name: '', description: '', status: 'Active' as 'Active' | 'Inactive' });
  const [subCatForm, setSubCatForm] = useState({ parentId: 'cat-1', name: '', description: '', status: 'Active' as 'Active' | 'Inactive' });

  const [barcodeForm, setBarcodeForm] = useState({
    skuCode: 'SKU-ELC-001',
    barcodeValue: '',
    barcodeType: 'EAN-13',
    isPrimary: true
  });

  const [uomForm, setUomForm] = useState({
    name: '',
    code: '',
    type: 'Count' as UOMItem['type'],
    isBaseUnit: false,
    status: 'Active' as UOMItem['status']
  });

  const [packConfigSku, setPackConfigSku] = useState('SKU-ELC-001');
  const [packLevels, setPackLevels] = useState<{ ratio: number; fromUom: string; toUom: string }[]>([
    { ratio: 12, fromUom: 'Carton', toUom: 'Piece' },
    { ratio: 40, fromUom: 'Pallet', toUom: 'Carton' }
  ]);

  const [batchForm, setBatchForm] = useState({
    skuCode: 'SKU-FRG-101',
    batchNumber: '',
    mfgDate: '',
    expiryDate: '',
    quantity: 100,
    warehouse: 'Jebel Ali Main Hub',
    zone: 'Zone B - Cold Storage'
  });

  const [serialForm, setSerialForm] = useState({
    skuCode: 'SKU-ELC-001',
    serialText: '',
    warehouseLocation: 'Jebel Ali - Zone A - Aisle 01'
  });

  const [dimForm, setDimForm] = useState({
    skuCode: 'SKU-ELC-001',
    length: 10,
    width: 10,
    height: 10,
    netWeight: 0.5,
    grossWeight: 0.6
  });

  const [originForm, setOriginForm] = useState({
    skuCode: 'SKU-ELC-001',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    manufacturer: 'Dubai South Manufacturing LLC'
  });

  const [hsForm, setHsForm] = useState({
    skuCode: 'SKU-ELC-001',
    hsCode: '8517.13',
    hsDescription: 'Smartphones for cellular networks',
    customsCategory: 'Duty Free (UAE Free Zone)',
    dutyRate: 0.0
  });

  // Unique Brands & Categories
  const uniqueBrands = useMemo(() => Array.from(new Set(skus.map((s) => s.brand).filter(Boolean))), [skus]);
  const uniqueCategories = useMemo(() => categories.map((c) => c.name), [categories]);

  // Filtered SKUs for 3.1 Table
  const filteredSkus = useMemo(() => {
    return skus.filter((item) => {
      const matchesSearch =
        item.skuCode.toLowerCase().includes(skuSearch.toLowerCase()) ||
        item.name.toLowerCase().includes(skuSearch.toLowerCase()) ||
        item.brand.toLowerCase().includes(skuSearch.toLowerCase());
      const matchesCategory = skuCategoryFilter === 'All' || item.category === skuCategoryFilter;
      const matchesStatus = skuStatusFilter === 'All' || item.status === skuStatusFilter;
      const matchesBrand = skuBrandFilter === 'All' || item.brand === skuBrandFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesBrand;
    });
  }, [skus, skuSearch, skuCategoryFilter, skuStatusFilter, skuBrandFilter]);

  // Live CBM calculation
  const calculatedCbm = useMemo(() => {
    return Number(((dimForm.length * dimForm.width * dimForm.height) / 1000000).toFixed(6));
  }, [dimForm.length, dimForm.width, dimForm.height]);

  // Live Pack Ratio Summary
  const calculatedPackSummary = useMemo(() => {
    let total = 1;
    packLevels.forEach((lvl) => {
      total = total * (lvl.ratio || 1);
    });
    const topLevel = packLevels[packLevels.length - 1]?.fromUom || 'Pallet';
    const baseLevel = packLevels[0]?.toUom || 'Pieces';
    return `1 ${topLevel} = ${total} ${baseLevel} total`;
  }, [packLevels]);

  // Expiry filtered items (3.8)
  const expiryItems = useMemo(() => {
    const list = [
      {
        id: 'exp-1',
        skuCode: 'SKU-FMC-201',
        productName: 'Organic Medjool Dates 1kg Premium Box',
        batchNumber: 'B2026-0205',
        expiryDate: '2026-10-15',
        daysRemaining: 22,
        status: 'Near Expiry' as const
      },
      {
        id: 'exp-2',
        skuCode: 'SKU-FRG-101',
        productName: 'Oud Royal Luxury Eau de Parfum 100ml',
        batchNumber: 'B2024-0512',
        expiryDate: '2026-09-10',
        daysRemaining: -13,
        status: 'Expired' as const
      },
      {
        id: 'exp-3',
        skuCode: 'SKU-FMC-201',
        productName: 'Organic Medjool Dates 1kg Premium Box',
        batchNumber: 'B2026-0610',
        expiryDate: '2027-06-10',
        daysRemaining: 260,
        status: 'Fresh' as const
      }
    ];

    if (expiryFilter === 'Expiring in 30 Days') {
      return list.filter((item) => item.daysRemaining > 0 && item.daysRemaining <= 30);
    }
    if (expiryFilter === 'Expired') {
      return list.filter((item) => item.daysRemaining <= 0);
    }
    return list;
  }, [expiryFilter]);

  // Handle Save SKU (3.1) - matching Image 1 exact fields
  const handleSaveSku = () => {
    if (!skuForm.skuCode && !skuForm.autoCode) {
      toast.error('Please enter SKU code or check Auto-Generate.');
      return;
    }
    if (!skuForm.name) {
      toast.error('Please enter Product Name.');
      return;
    }
    const newCode = skuForm.autoCode
      ? `PROD-${Math.floor(100 + Math.random() * 900)}`
      : skuForm.skuCode;

    if (editingSkuId) {
      setSkus(
        skus.map((s) =>
          s.id === editingSkuId
            ? {
                ...s,
                skuCode: newCode,
                name: skuForm.name,
                description: skuForm.description,
                category: skuForm.category,
                subCategory: skuForm.subCategory,
                brand: skuForm.brand || s.brand,
                baseUom: skuForm.unit !== 'None' ? skuForm.unit : s.baseUom,
                type: skuForm.type,
                costPrice: skuForm.costPrice,
                salePrice: skuForm.salePrice,
                taxRate: skuForm.taxRate,
                minStockLevel: skuForm.minStockLevel,
                valuationMethod: skuForm.valuationMethod,
                reorderLevel: skuForm.reorderLevel,
                reorderQty: skuForm.reorderQty,
                manufacturer: skuForm.manufacturer || s.manufacturer,
                status: skuForm.status,
                batchTracking: skuForm.batchTracking,
                serialTracking: skuForm.serialTracking
              }
            : s
        )
      );
      toast.success(`Product "${skuForm.name}" updated successfully!`);
      setEditingSkuId(null);
    } else {
      const newItem: SKUItem = {
        id: `sku-${Date.now()}`,
        skuCode: newCode,
        name: skuForm.name,
        description: skuForm.description || 'Item specification, grade, or material notes',
        category: skuForm.category,
        subCategory: skuForm.subCategory || 'General',
        brand: skuForm.brand || 'Generic',
        baseUom: skuForm.unit !== 'None' ? skuForm.unit : 'EA',
        type: skuForm.type,
        costPrice: skuForm.costPrice,
        salePrice: skuForm.salePrice,
        taxRate: skuForm.taxRate,
        minStockLevel: skuForm.minStockLevel,
        valuationMethod: skuForm.valuationMethod,
        reorderLevel: skuForm.reorderLevel,
        reorderQty: skuForm.reorderQty,
        status: skuForm.status,
        createdDate: new Date().toISOString().split('T')[0],
        batchTracking: skuForm.batchTracking,
        serialTracking: skuForm.serialTracking,
        primaryBarcode: '629' + Math.floor(100000000 + Math.random() * 900000000),
        barcodeType: 'EAN-13',
        alternateBarcodes: [],
        packHierarchyChain: `1 Carton = 12 ${skuForm.unit !== 'None' ? skuForm.unit : 'EA'}`,
        length: 10,
        width: 10,
        height: 10,
        cbm: 0.001,
        netWeight: 0.5,
        grossWeight: 0.6,
        countryOfOrigin: 'United Arab Emirates',
        flag: '🇦🇪',
        manufacturer: skuForm.manufacturer || 'Local Manufacturer',
        hsCode: '8500.00',
        hsDescription: 'General Manufactured Inventory',
        customsCategory: 'Standard Commercial',
        dutyRate: 5.0
      };
      setSkus([newItem, ...skus]);
      toast.success(`Product "${newItem.name}" (${newItem.skuCode}) created successfully!`);
    }
    setAddSkuModal(false);
  };

  const handleToggleSkuStatus = (id: string) => {
    setSkus(
      skus.map((s) => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s))
    );
    toast.success('Product status updated');
  };

  // Handle Save Category (3.2)
  const handleSaveCategory = () => {
    if (!catForm.name) {
      toast.error('Please enter category name');
      return;
    }
    if (editingCatId) {
      setCategories(
        categories.map((c) =>
          c.id === editingCatId
            ? { ...c, name: catForm.name, description: catForm.description, status: catForm.status }
            : c
        )
      );
      toast.success(`Category "${catForm.name}" updated!`);
      setEditingCatId(null);
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: catForm.name,
        description: catForm.description || 'New main category',
        status: catForm.status,
        productCount: 0,
        subCategories: []
      };
      setCategories([...categories, newCat]);
      toast.success(`Category "${newCat.name}" added successfully!`);
    }
    setCatForm({ name: '', description: '', status: 'Active' });
    setAddCatModal(false);
  };

  const handleToggleCategoryStatus = (id: string) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
    );
    toast.success('Category status updated');
  };

  const handleToggleSubCategoryStatus = (catId: string, subId: string) => {
    setCategories(
      categories.map((c) =>
        c.id === catId
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s.id === subId ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s
              )
            }
          : c
      )
    );
    toast.success('Sub-category status updated');
  };

  // Handle Save Sub-Category (3.2)
  const handleSaveSubCategory = () => {
    if (!subCatForm.name) {
      toast.error('Please enter sub-category name');
      return;
    }
    const newSub = {
      id: `sub-${Date.now()}`,
      name: subCatForm.name,
      description: subCatForm.description || 'New sub-category',
      status: subCatForm.status,
      productCount: 0
    };
    setCategories(
      categories.map((c) =>
        c.id === subCatForm.parentId ? { ...c, subCategories: [...c.subCategories, newSub] } : c
      )
    );
    toast.success(`Sub-Category "${newSub.name}" added!`);
    setSubCatForm({ parentId: 'cat-1', name: '', description: '', status: 'Active' });
    setAddSubCatModal(false);
  };

  // Handle Save UOM (3.4)
  const handleSaveUom = () => {
    if (!uomForm.code || !uomForm.name) {
      toast.error('Please enter UOM code and name');
      return;
    }
    if (editingUomId) {
      setUoms(
        uoms.map((u) =>
          u.id === editingUomId
            ? {
                ...u,
                code: uomForm.code,
                name: uomForm.name,
                type: uomForm.type,
                isBaseUnit: uomForm.isBaseUnit,
                status: uomForm.status
              }
            : u
        )
      );
      toast.success(`UOM ${uomForm.code} updated!`);
      setEditingUomId(null);
    } else {
      setUoms([
        ...uoms,
        {
          id: `uom-${Date.now()}`,
          code: uomForm.code,
          name: uomForm.name,
          type: uomForm.type,
          isBaseUnit: uomForm.isBaseUnit,
          status: uomForm.status
        }
      ]);
      toast.success(`UOM ${uomForm.code} added!`);
    }
    setUomForm({ name: '', code: '', type: 'Count', isBaseUnit: false, status: 'Active' });
    setAddUomModal(false);
  };

  const handleToggleUomStatus = (id: string) => {
    setUoms(
      uoms.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    );
    toast.success('UOM status updated');
  };

  const handleToggleUomBase = (id: string) => {
    setUoms(
      uoms.map((u) => (u.id === id ? { ...u, isBaseUnit: !u.isBaseUnit } : u))
    );
    toast.success('Base unit status updated');
  };

  const handleDeleteUom = (id: string) => {
    setUoms(uoms.filter((u) => u.id !== id));
    toast.success('UOM removed');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 3.0 OVERVIEW PAGE */}
      {/* ========================================================================= */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          <PageHeader
            title="Product & Inventory Master"
            description="Central product catalog, multi-tier categories, barcodes, UOM conversions, serials, batches, expiry & customs tariff data"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-[#2563eb] shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b]">Total Catalog SKUs</p>
                  <h3 className="text-2xl font-bold text-[#1e293b] mt-1">{skus.length}</h3>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active master items
                  </p>
                </div>
                <div className="p-3 bg-[#eff6ff] text-[#2563eb] rounded-lg">
                  <Package className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#0284c7] shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b]">Product Categories</p>
                  <h3 className="text-2xl font-bold text-[#1e293b] mt-1">{categories.length}</h3>
                  <p className="text-[11px] text-[#0284c7] font-medium mt-1">Multi-tier tree setup</p>
                </div>
                <div className="p-3 bg-[#e0f2fe] text-[#0284c7] rounded-lg">
                  <Layers className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#d97706] shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b]">Batch Lots Tracked</p>
                  <h3 className="text-2xl font-bold text-[#1e293b] mt-1">{batches.length}</h3>
                  <p className="text-[11px] text-[#d97706] font-medium mt-1">FEFO expiry rules active</p>
                </div>
                <div className="p-3 bg-[#fef3c7] text-[#d97706] rounded-lg">
                  <ClipboardList className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#7c3aed] shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b]">Serialized Assets</p>
                  <h3 className="text-2xl font-bold text-[#1e293b] mt-1">{serials.length}</h3>
                  <p className="text-[11px] text-[#7c3aed] font-medium mt-1">Unique barcodes active</p>
                </div>
                <div className="p-3 bg-[#f3e8ff] text-[#7c3aed] rounded-lg">
                  <KeyRound className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'sku-master', title: '3.1 SKU Master', desc: 'Central catalog managing SKU codes, descriptions, brands, UOM, and complete profiles.', icon: Package, href: '/product-master/sku-master' },
              { id: 'categories', title: '3.2 Product Categories', desc: '2-level category & subcategory tree hierarchy with live SKU count badges.', icon: Layers, href: '/product-master/categories' },
              { id: 'barcodes', title: '3.3 Barcode Management', desc: 'Store primary and multiple alternate barcodes (EAN-13, UPC, Code128, QR) per SKU.', icon: Tags, href: '/product-master/barcodes' },
              { id: 'uom', title: '3.4 UOM Management', desc: 'Master units of measure for count, weight, and volume (Piece, Box, Carton, Pallet, KG).', icon: Scale, href: '/product-master/uom' },
              { id: 'pack-config', title: '3.5 Pack Configuration', desc: 'Multi-level packaging conversion chains (1 Pallet = 40 Cartons = 480 Pieces).', icon: Boxes, href: '/product-master/pack-config' },
              { id: 'batches', title: '3.6 Batch Management', desc: 'Track lot numbers, mfg dates, stock quantities, and status (Active/Depleted/Blocked).', icon: ClipboardList, href: '/product-master/batches' },
              { id: 'serials', title: '3.7 Serial Number Management', desc: 'Track serialized items with location history, statuses, and instant barcode search.', icon: KeyRound, href: '/product-master/serials' },
              { id: 'expiry', title: '3.8 Expiry Management', desc: 'Monitor fresh, near-expiry, and expired inventory with color-coded FEFO badges.', icon: CalendarDays, href: '/product-master/expiry' },
              { id: 'dimensions', title: '3.9 Dimensions & Weight', desc: 'Store Length × Width × Height (cm), net/gross weight, and auto-calculated CBM volume.', icon: SlidersHorizontal, href: '/product-master/dimensions' },
              { id: 'origin', title: '3.10 Country of Origin', desc: 'Maintain origin country flags, manufacturer details, and customs compliance certificates.', icon: Activity, href: '/product-master/origin' },
              { id: 'hs-code', title: '3.11 HS Customs Code', desc: 'Maintain 6-10 digit HS tariff codes, customs categories, and UAE duty rates (%).', icon: ShieldCheck, href: '/product-master/hs-code' }
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => router.push(card.href)}
                  className="p-4 bg-white border border-[#e2e8f0] rounded-lg shadow-sm hover:border-[#2563eb] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-[#eff6ff] text-[#2563eb] rounded-md group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#2563eb] font-medium">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.1 SKU MASTER PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'sku-master' && (
        <div className="space-y-4">
          <PageHeader
            title="3.1 SKU Master Catalog"
            description="Create and manage all product SKUs — central catalog profile definitions"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <Input
                  placeholder="Search by SKU Code, Name, or Brand..."
                  value={skuSearch}
                  onChange={(e) => setSkuSearch(e.target.value)}
                  className="pl-9 text-xs border-[#cbd5e1]"
                />
              </div>

              <select
                value={skuCategoryFilter}
                onChange={(e) => setSkuCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-md text-[#334155] focus:outline-none"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={skuBrandFilter}
                onChange={(e) => setSkuBrandFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-md text-[#334155] focus:outline-none"
              >
                <option value="All">All Brands</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <select
                value={skuStatusFilter}
                onChange={(e) => setSkuStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-md text-[#334155] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>

            <Button
              onClick={() => {
                setEditingSkuId(null);
                setSkuForm({
                  autoCode: false,
                  skuCode: '',
                  name: '',
                  description: '',
                  category: 'Uncategorized',
                  subCategory: 'General',
                  unit: 'None',
                  type: 'Product',
                  costPrice: 0,
                  salePrice: 0,
                  taxRate: 0,
                  minStockLevel: 0,
                  valuationMethod: 'Moving Average',
                  reorderLevel: 0,
                  reorderQty: 0,
                  brand: '',
                  manufacturer: '',
                  status: 'Active',
                  batchTracking: false,
                  serialTracking: false
                });
                setAddSkuModal(true);
              }}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium px-4 py-2"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              + Add Product
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Product Name & Description</th>
                    <th className="px-4 py-3">SKU Code</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Unit (UOM)</th>
                    <th className="px-4 py-3">Tracking</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredSkus.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedSkuDetail(item)}
                      className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-[#1e293b] text-xs">{item.name}</p>
                          <p className="text-[11px] text-[#64748b] mt-0.5 line-clamp-1">{item.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{item.skuCode}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                          {item.category} / {item.subCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#334155]">{item.brand}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#1e293b]">{item.baseUom}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1 text-[10px]">
                          {item.batchTracking && (
                            <span className="px-2 py-0.5 rounded bg-[#fef3c7] text-[#d97706] font-semibold border border-[#fde68a]">
                              Batch
                            </span>
                          )}
                          {item.serialTracking && (
                            <span className="px-2 py-0.5 rounded bg-[#f3e8ff] text-[#7c3aed] font-semibold border border-[#e9d5ff]">
                              Serial
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#15803d]" />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#64748b] font-mono">{item.createdDate}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingSkuId(item.id);
                            setSkuForm({
                              autoCode: false,
                              skuCode: item.skuCode,
                              name: item.name,
                              description: item.description,
                              category: item.category,
                              subCategory: item.subCategory,
                              unit: item.baseUom,
                              type: item.type,
                              costPrice: item.costPrice,
                              salePrice: item.salePrice,
                              taxRate: item.taxRate,
                              minStockLevel: item.minStockLevel,
                              valuationMethod: item.valuationMethod,
                              reorderLevel: item.reorderLevel,
                              reorderQty: item.reorderQty,
                              brand: item.brand,
                              manufacturer: item.manufacturer,
                              status: item.status,
                              batchTracking: item.batchTracking,
                              serialTracking: item.serialTracking
                            });
                            setAddSkuModal(true);
                          }}
                          className="px-3 py-1 text-xs font-medium border border-[#cbd5e1] text-[#334155] hover:bg-[#f1f5f9] rounded-md transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.2 PRODUCT CATEGORIES PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <PageHeader
            title="3.2 Product Categories"
            description="Group products by category and subcategory hierarchy with live product count badges"
          />

          <div className="flex items-center justify-between bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#2563eb]" />
              <span className="text-xs font-semibold text-[#1e293b]">Category Tree Hierarchy</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setAddCatModal(true)} size="sm" className="bg-[#2563eb] text-white">
                <Plus className="w-3.5 h-3.5 mr-1" /> + Add Category
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
              <div className="p-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Parent Categories</span>
                <span className="text-xs font-mono text-[#64748b]">{categories.length} total</span>
              </div>
              <div className="divide-y divide-[#e2e8f0] max-h-[500px] overflow-y-auto">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryTree === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategoryTree(cat.id)}
                      className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#eff6ff] border-l-4 border-[#2563eb] text-[#2563eb] font-semibold'
                          : 'hover:bg-[#f8fafc] text-[#1e293b]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold">{cat.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#dbeafe] text-[#1e40af]">
                            {cat.productCount} SKUs
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-0.5 line-clamp-1">{cat.description}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-7 bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
              {(() => {
                const currentCat = categories.find((c) => c.id === selectedCategoryTree) || categories[0];
                return (
                  <div>
                    <div className="p-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                          Sub-Categories of {currentCat?.name}
                        </span>
                        <p className="text-[11px] text-[#64748b]">{currentCat?.description}</p>
                      </div>
                      <Button onClick={() => { setSubCatForm({ ...subCatForm, parentId: currentCat.id }); setAddSubCatModal(true); }} size="sm" variant="outline">
                        <Plus className="w-3.5 h-3.5 mr-1" /> + Add Sub-Category
                      </Button>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentCat?.subCategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3.5 border border-[#e2e8f0] rounded-lg bg-white hover:border-[#2563eb] transition-all flex flex-col justify-between shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-[#1e293b]">{sub.name}</h5>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]">
                                  {sub.productCount} SKUs
                                </span>
                              </div>
                              <p className="text-[11px] text-[#64748b] mt-1">{sub.description}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px]">
                              <span className="text-[#15803d] font-semibold">Status: {sub.status}</span>
                              <span className="text-[#94a3b8] font-mono">ID: {sub.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.3 BARCODE MANAGEMENT PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'barcodes' && (
        <div className="space-y-4">
          <PageHeader
            title="3.3 Barcode Management"
            description="Store and manage primary SKU barcodes and alternate barcode aliases"
          />

          <div className="flex items-center justify-between bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Tags className="w-4 h-4 text-[#2563eb]" />
              <span className="text-xs font-semibold text-[#1e293b]">SKU Barcode Register</span>
            </div>
            <Button onClick={() => setAddBarcodeModal(true)} size="sm" className="bg-[#2563eb] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> + Add Barcode
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Primary Barcode</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Alternate Barcodes</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {skus.map((sku) => {
                  const isExpanded = expandedBarcodeId === sku.id;
                  const alternates = sku.alternateBarcodes || [];
                  return (
                    <React.Fragment key={sku.id}>
                      <tr
                        onClick={() => setExpandedBarcodeId(isExpanded ? null : sku.id)}
                        className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{sku.skuCode}</td>
                        <td className="px-4 py-3 font-medium text-[#1e293b]">{sku.name}</td>
                        <td className="px-4 py-3 font-mono font-bold text-[#1e293b]">
                          <span className="bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#cbd5e1]">
                            {sku.primaryBarcode}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#64748b]">{sku.barcodeType}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]">
                            {alternates.length} Alternates
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#15803d]" />
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setBarcodeForm({ ...barcodeForm, skuCode: sku.skuCode }); setAddBarcodeModal(true); }}
                            className="px-3 py-1 text-xs font-medium border border-[#cbd5e1] text-[#334155] hover:bg-[#f1f5f9] rounded-md transition-colors"
                          >
                            + Add Alternate
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-[#f8fafc]">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="bg-white p-3.5 border border-[#e2e8f0] rounded-lg space-y-2 shadow-inner">
                              <span className="text-xs font-bold text-[#1e293b]">All Alternate Barcodes for {sku.skuCode}:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                {alternates.map((alt, idx) => (
                                  <div key={idx} className="p-2 border border-[#e2e8f0] bg-white rounded flex items-center justify-between">
                                    <span className="font-mono text-xs font-medium text-[#1e293b]">{alt}</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                                      CODE128/QR
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.4 UOM MANAGEMENT PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'uom' && (
        <div className="space-y-4">
          <PageHeader
            title="3.4 UOM Management"
            description="Support measurement units such as piece, box, carton, pallet, and kilogram"
          />

          <div className="p-3.5 bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] rounded-lg text-xs flex items-start space-x-2.5">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#2563eb]" />
            <div>
              <p className="font-semibold">Unit of Measure (UOM) Notice</p>
              <p className="mt-0.5 leading-relaxed text-[11px]">
                Note: UOM conversion ratios are configured per-product under Pack Configuration (3.5) to keep this screen focused only on maintaining master unit definitions.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-[#1e293b]">Standard Master Units</span>
            <Button
              onClick={() => {
                setEditingUomId(null);
                setUomForm({ name: '', code: '', type: 'Count', isBaseUnit: false, status: 'Active' });
                setAddUomModal(true);
              }}
              size="sm"
              className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> + Add UOM
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">UOM Code</th>
                  <th className="px-4 py-3">UOM Name</th>
                  <th className="px-4 py-3">Measurement Type</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {uoms.map((uom) => (
                  <tr key={uom.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{uom.code}</td>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{uom.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 text-[11px] font-medium rounded bg-[#f1f5f9] text-[#334155]">
                        {uom.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingUomId(uom.id);
                          setUomForm({
                            name: uom.name,
                            code: uom.code,
                            type: uom.type,
                            isBaseUnit: uom.isBaseUnit,
                            status: uom.status
                          });
                          setAddUomModal(true);
                        }}
                        className="px-3 py-1 text-xs font-medium border border-[#cbd5e1] text-[#334155] hover:bg-[#f1f5f9] rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.5 PACK CONFIGURATION PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'pack-config' && (
        <div className="space-y-4">
          <PageHeader
            title="3.5 Pack Configuration"
            description="Define packaging ratios and multi-level container conversion chains"
          />

          <div className="flex items-center justify-between bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-[#1e293b]">Packaging Hierarchy Chains</span>
            <Button onClick={() => setConfigurePackModal(true)} size="sm" className="bg-[#2563eb] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> + Configure Pack
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Base UOM</th>
                  <th className="px-4 py-3">Pack Hierarchy Conversion Chain</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {skus.map((sku) => (
                  <tr key={sku.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{sku.skuCode}</td>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{sku.name}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{sku.baseUom}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center px-2.5 py-1 rounded bg-[#f1f5f9] border border-[#cbd5e1] text-[#1e293b] font-mono text-[11px]">
                        {sku.packHierarchyChain}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setPackConfigSku(sku.skuCode); setConfigurePackModal(true); }}
                        className="px-3 py-1 text-xs font-medium border border-[#cbd5e1] text-[#334155] hover:bg-[#f1f5f9] rounded-md transition-colors"
                      >
                        Edit Pack
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.6 BATCH MANAGEMENT PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <PageHeader
            title="3.6 Batch Management"
            description="Track stock by batch/lot number, manufacturing date, and batch status"
          />

          <div className="flex items-center justify-between bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-[#1e293b]">Lot & Batch Tracking Register</span>
            <Button onClick={() => setAddBatchModal(true)} size="sm" className="bg-[#2563eb] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> + Add Batch
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Batch/Lot No.</th>
                  <th className="px-4 py-3">Mfg Date</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Warehouse / Zone</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {batches.map((bat) => (
                  <tr key={bat.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{bat.skuCode}</td>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{bat.productName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1e293b]">
                      <span className="bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#cbd5e1]">{bat.batchNumber}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#64748b]">{bat.mfgDate}</td>
                    <td className="px-4 py-3 font-mono text-[#64748b]">{bat.expiryDate}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1e293b]">{bat.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#64748b]">{bat.warehouse} ({bat.zone})</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${
                          bat.status === 'Active'
                            ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
                            : bat.status === 'Depleted'
                            ? 'bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]'
                            : 'bg-[#ffe4e6] text-[#e11d48] border border-[#fecdd3]'
                        }`}
                      >
                        {bat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.7 SERIAL NUMBER MANAGEMENT PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'serials' && (
        <div className="space-y-4">
          <PageHeader
            title="3.7 Serial Number Management"
            description="Track individually serialized products with location history and status tracking"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <Input
                placeholder="Lookup specific serial number (e.g. SN-IP15P-8839001)..."
                value={serialSearch}
                onChange={(e) => setSerialSearch(e.target.value)}
                className="pl-9 text-xs border-[#cbd5e1]"
              />
            </div>

            <Button onClick={() => setAddSerialModal(true)} size="sm" className="bg-[#2563eb] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> + Add Serial Numbers
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Serial Number</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Location / Tag</th>
                  <th className="px-4 py-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {serials
                  .filter(
                    (s) =>
                      s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase()) ||
                      s.productName.toLowerCase().includes(serialSearch.toLowerCase()) ||
                      s.skuCode.toLowerCase().includes(serialSearch.toLowerCase())
                  )
                  .map((ser) => (
                    <tr key={ser.id} className="hover:bg-[#f8fafc]">
                      <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{ser.skuCode}</td>
                      <td className="px-4 py-3 font-medium text-[#1e293b]">{ser.productName}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#1e293b]">
                        <span className="bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#cbd5e1]">{ser.serialNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${
                            ser.status === 'In Stock'
                              ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
                              : ser.status === 'Sold'
                              ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
                              : 'bg-[#fef3c7] text-[#d97706] border border-[#fde68a]'
                          }`}
                        >
                          {ser.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#64748b]">{ser.warehouseLocation}</td>
                      <td className="px-4 py-3 text-[#64748b] font-mono">{ser.lastUpdated}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.8 EXPIRY MANAGEMENT PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'expiry' && (
        <div className="space-y-4">
          <PageHeader
            title="3.8 Expiry Management"
            description="Track expiry dates for perishable products with FEFO picking rules"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-[#2563eb] shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#64748b] font-medium">Total Trackable SKUs</p>
                  <h3 className="text-2xl font-bold text-[#1e293b] mt-1">48</h3>
                  <p className="text-[11px] text-[#64748b] mt-0.5">Expiry date control active</p>
                </div>
                <div className="p-3 bg-[#eff6ff] text-[#2563eb] rounded-lg">
                  <CalendarDays className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#d97706] shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#64748b] font-medium">Near-Expiry Count</p>
                  <h3 className="text-2xl font-bold text-[#d97706] mt-1">5</h3>
                  <p className="text-[11px] text-[#d97706] font-medium">Expiring in &lt; 30 Days</p>
                </div>
                <div className="p-3 bg-[#fef3c7] text-[#d97706] rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#e11d48] shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#64748b] font-medium">Expired Count</p>
                  <h3 className="text-2xl font-bold text-[#e11d48] mt-1">2</h3>
                  <p className="text-[11px] text-[#e11d48] font-medium">Requires Quarantine</p>
                </div>
                <div className="p-3 bg-[#ffe4e6] text-[#e11d48] rounded-lg">
                  <XCircle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center space-x-2 bg-white p-3 border border-[#e2e8f0] rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-[#64748b] mr-2">Filter Status:</span>
            {(['All', 'Expiring in 30 Days', 'Expired'] as const).map((chip) => (
              <button
                key={chip}
                onClick={() => setExpiryFilter(chip)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  expiryFilter === chip
                    ? 'bg-[#2563eb] text-white font-semibold'
                    : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] border border-[#cbd5e1]'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Days Remaining</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {expiryItems.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{exp.skuCode}</td>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{exp.productName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1e293b]">
                      <span className="bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#cbd5e1]">{exp.batchNumber}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#1e293b] font-semibold">{exp.expiryDate}</td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {exp.daysRemaining > 0 ? (
                        <span className={exp.daysRemaining <= 30 ? 'text-[#d97706]' : 'text-[#15803d]'}>
                          {exp.daysRemaining} days remaining
                        </span>
                      ) : (
                        <span className="text-[#e11d48]">Expired {Math.abs(exp.daysRemaining)} days ago</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                          exp.status === 'Fresh'
                            ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
                            : exp.status === 'Near Expiry'
                            ? 'bg-[#fef3c7] text-[#d97706] border border-[#fde68a]'
                            : 'bg-[#ffe4e6] text-[#e11d48] border border-[#fecdd3]'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.9 PRODUCT DIMENSIONS PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'dimensions' && (
        <div className="space-y-4">
          <PageHeader
            title="3.9 Product Dimensions & Weight"
            description="Store dimensions (L×W×H cm) and weight matrix for shipping and slotting"
          />

          <div className="flex items-center justify-between bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-[#1e293b]">Physical Specifications Matrix</span>
            <Button onClick={() => setAddDimensionsModal(true)} size="sm" className="bg-[#2563eb] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> + Add / Edit Dimensions
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Dimensions (L × W × H cm)</th>
                  <th className="px-4 py-3">Volume (CBM)</th>
                  <th className="px-4 py-3">Net Weight (kg)</th>
                  <th className="px-4 py-3">Gross Weight (kg)</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {skus.map((sku) => (
                  <tr key={sku.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{sku.skuCode}</td>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{sku.name}</td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {sku.length} × {sku.width} × {sku.height} cm
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#2563eb]">
                      <span className="bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                        {sku.cbm} CBM
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#64748b]">{sku.netWeight} kg</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1e293b]">{sku.grossWeight} kg</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setDimForm({ skuCode: sku.skuCode, length: sku.length, width: sku.width, height: sku.height, netWeight: sku.netWeight, grossWeight: sku.grossWeight }); setAddDimensionsModal(true); }}
                        className="px-3 py-1 text-xs font-medium border border-[#cbd5e1] text-[#334155] hover:bg-[#f1f5f9] rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.10 COUNTRY OF ORIGIN PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'origin' && (
        <div className="space-y-4">
          <PageHeader
            title="3.10 Country of Origin"
            description="Maintain origin country declarations, flags, and manufacturer registry"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <select
              value={originCountryFilter}
              onChange={(e) => setOriginCountryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-md text-[#334155]"
            >
              <option value="All">All Countries</option>
              <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
              <option value="China">🇨🇳 China</option>
              <option value="Japan">🇯🇵 Japan</option>
              <option value="France">🇫🇷 France</option>
              <option value="United Kingdom">🇬🇧 United Kingdom</option>
            </select>

            <Button onClick={() => setAddOriginModal(true)} size="sm" className="bg-[#2563eb] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> + Add / Edit Origin
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Country of Origin</th>
                  <th className="px-4 py-3">Manufacturer / Supplier Name</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {skus
                  .filter((s) => originCountryFilter === 'All' || s.countryOfOrigin === originCountryFilter)
                  .map((sku) => (
                    <tr key={sku.id} className="hover:bg-[#f8fafc]">
                      <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{sku.skuCode}</td>
                      <td className="px-4 py-3 font-medium text-[#1e293b]">{sku.name}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className="text-base mr-1.5">{sku.flag}</span>
                        <span className="text-[#1e293b]">{sku.countryOfOrigin}</span>
                      </td>
                      <td className="px-4 py-3 text-[#64748b] font-medium">{sku.manufacturer}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.11 HS CODE & CUSTOMS PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'hs-code' && (
        <div className="space-y-4">
          <PageHeader
            title="3.11 HS Code & Customs Classification"
            description="Maintain customs tariff codes, descriptions, and UAE duty rates (%)"
          />

          <div className="flex items-center justify-between bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-[#1e293b]">Customs Tariff Register</span>
            <Button onClick={() => setAddHsModal(true)} size="sm" className="bg-[#2563eb] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> + Add / Edit HS Code
            </Button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">HS Tariff Code</th>
                  <th className="px-4 py-3">HS Official Description</th>
                  <th className="px-4 py-3">Customs Category</th>
                  <th className="px-4 py-3">Duty Rate (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {skus.map((sku) => (
                  <tr key={sku.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-mono font-bold text-[#2563eb] text-xs">{sku.skuCode}</td>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{sku.name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1e293b]">
                      <span className="bg-[#f1f5f9] px-2.5 py-1 rounded border border-[#cbd5e1]">{sku.hsCode}</span>
                    </td>
                    <td className="px-4 py-3 text-[#64748b] max-w-xs truncate">{sku.hsDescription}</td>
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{sku.customsCategory}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#15803d]">
                      {sku.dutyRate?.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT DETAIL SLIDE-OVER DRAWER (3.1) */}
      {/* ========================================================================= */}
      {selectedSkuDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-[#e2e8f0] flex flex-col justify-between overflow-hidden text-[#1e293b]">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1e293b]">{selectedSkuDetail.name}</h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="font-mono text-xs font-bold text-[#2563eb]">{selectedSkuDetail.skuCode}</span>
                  <span className="text-[#94a3b8] text-xs">•</span>
                  <span className="text-xs text-[#64748b]">{selectedSkuDetail.brand}</span>
                </div>
              </div>
              <button onClick={() => setSelectedSkuDetail(null)} className="p-1 text-[#64748b] hover:text-[#1e293b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-1 border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'barcodes', label: 'Barcodes' },
                { key: 'pack', label: 'Pack Config' },
                { key: 'tracking', label: 'Tracking Rules' },
                { key: 'expiry', label: 'Expiry & FEFO' },
                { key: 'dimensions', label: 'Dimensions' },
                { key: 'origin', label: 'Origin' },
                { key: 'hs', label: 'HS Code' }
              ].map((tb) => (
                <button
                  key={tb.key}
                  onClick={() => setSkuDetailTab(tb.key as any)}
                  className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                    skuDetailTab === tb.key ? 'bg-[#2563eb] text-white font-semibold' : 'text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
              {skuDetailTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-[#f8fafc] p-3.5 rounded-lg border border-[#e2e8f0]">
                    <div>
                      <span className="text-[#64748b]">Category:</span>
                      <p className="font-semibold text-[#1e293b]">{selectedSkuDetail.category}</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Sub-Category:</span>
                      <p className="font-semibold text-[#1e293b]">{selectedSkuDetail.subCategory}</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Base Unit of Measure:</span>
                      <p className="font-mono font-bold text-[#2563eb]">{selectedSkuDetail.baseUom}</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Type:</span>
                      <p className="font-bold text-[#334155]">{selectedSkuDetail.type}</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Cost Price:</span>
                      <p className="font-mono font-bold text-[#1e293b]">AED {selectedSkuDetail.costPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Sale Price:</span>
                      <p className="font-mono font-bold text-[#15803d]">AED {selectedSkuDetail.salePrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Tax Rate:</span>
                      <p className="font-mono font-semibold text-[#1e293b]">{selectedSkuDetail.taxRate}% VAT</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Valuation Method:</span>
                      <p className="font-medium text-[#334155]">{selectedSkuDetail.valuationMethod}</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Min Stock Level:</span>
                      <p className="font-mono font-bold text-[#1e293b]">{selectedSkuDetail.minStockLevel}</p>
                    </div>
                    <div>
                      <span className="text-[#64748b]">Reorder Point:</span>
                      <p className="font-mono font-bold text-[#2563eb]">{selectedSkuDetail.reorderLevel} (Qty: {selectedSkuDetail.reorderQty})</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#1e293b] mb-1">Product Description</h4>
                    <p className="text-[#64748b] leading-relaxed">{selectedSkuDetail.description}</p>
                  </div>
                </div>
              )}

              {skuDetailTab === 'barcodes' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg">
                    <span className="text-[10px] text-[#2563eb] font-bold uppercase">Primary Barcode</span>
                    <p className="font-mono text-sm font-bold text-[#1e293b] mt-0.5">
                      {selectedSkuDetail.primaryBarcode} ({selectedSkuDetail.barcodeType})
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1e293b] mb-1">Alternate Barcodes</h4>
                    <div className="space-y-1">
                      {selectedSkuDetail.alternateBarcodes.map((alt, i) => (
                        <div key={i} className="p-2 border border-[#e2e8f0] rounded font-mono bg-[#f8fafc]">
                          {alt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {skuDetailTab === 'pack' && (
                <div className="space-y-3">
                  <span className="text-[#64748b]">Configured Pack Hierarchy:</span>
                  <div className="p-3 bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg font-mono font-bold text-[#1e293b]">
                    {selectedSkuDetail.packHierarchyChain}
                  </div>
                </div>
              )}

              {skuDetailTab === 'tracking' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <div>
                      <h4 className="font-bold text-[#1e293b]">Batch / Lot Tracking Enabled</h4>
                      <p className="text-[11px] text-[#64748b]">Requires batch numbers on putaway & picking</p>
                    </div>
                    <span className={`px-2.5 py-1 font-bold rounded text-[10px] ${selectedSkuDetail.batchTracking ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#f1f5f9] text-[#475569]'}`}>
                      {selectedSkuDetail.batchTracking ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <div>
                      <h4 className="font-bold text-[#1e293b]">Serial Number Tracking Enabled</h4>
                      <p className="text-[11px] text-[#64748b]">Tracks individual serialized units in inventory</p>
                    </div>
                    <span className={`px-2.5 py-1 font-bold rounded text-[10px] ${selectedSkuDetail.serialTracking ? 'bg-[#f3e8ff] text-[#7c3aed]' : 'bg-[#f1f5f9] text-[#475569]'}`}>
                      {selectedSkuDetail.serialTracking ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              )}

              {skuDetailTab === 'dimensions' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">Dimensions (L×W×H):</span>
                    <p className="font-mono font-bold text-[#1e293b] mt-0.5">
                      {selectedSkuDetail.length} × {selectedSkuDetail.width} × {selectedSkuDetail.height} cm
                    </p>
                  </div>
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">Calculated Volume:</span>
                    <p className="font-mono font-bold text-[#2563eb] mt-0.5">{selectedSkuDetail.cbm} CBM</p>
                  </div>
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">Net Weight:</span>
                    <p className="font-mono font-bold text-[#1e293b] mt-0.5">{selectedSkuDetail.netWeight} kg</p>
                  </div>
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">Gross Weight:</span>
                    <p className="font-mono font-bold text-[#1e293b] mt-0.5">{selectedSkuDetail.grossWeight} kg</p>
                  </div>
                </div>
              )}

              {skuDetailTab === 'origin' && (
                <div className="space-y-3">
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">Country of Origin:</span>
                    <p className="font-bold text-[#1e293b] text-sm mt-0.5">
                      {selectedSkuDetail.flag} {selectedSkuDetail.countryOfOrigin}
                    </p>
                  </div>
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">Manufacturer Name:</span>
                    <p className="font-semibold text-[#1e293b] mt-0.5">{selectedSkuDetail.manufacturer}</p>
                  </div>
                </div>
              )}

              {skuDetailTab === 'hs' && (
                <div className="space-y-3">
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">HS Tariff Code:</span>
                    <p className="font-mono font-bold text-[#2563eb] text-sm mt-0.5">{selectedSkuDetail.hsCode}</p>
                  </div>
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">Official Description:</span>
                    <p className="font-medium text-[#1e293b] mt-0.5">{selectedSkuDetail.hsDescription}</p>
                  </div>
                  <div className="p-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
                    <span className="text-[#64748b]">Duty Rate:</span>
                    <p className="font-mono font-bold text-[#15803d] mt-0.5">
                      {selectedSkuDetail.dutyRate}% ({selectedSkuDetail.customsCategory})
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-[#64748b] font-mono">Product ID: {selectedSkuDetail.id}</span>
              <Button onClick={() => setSelectedSkuDetail(null)} variant="outline" size="sm">
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.1 NEW / EDIT PRODUCT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={addSkuModal} onOpenChange={setAddSkuModal}>
        <DialogContent className="max-w-xl bg-white text-[#1e293b] p-6 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-3">
              {editingSkuId ? 'Edit Product' : 'New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            {/* Row 1: SKU * | Name * */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-semibold text-[#334155]">SKU *</Label>
                  <label className="text-[10px] text-[#2563eb] cursor-pointer flex items-center gap-1 font-medium">
                    <input
                      type="checkbox"
                      checked={skuForm.autoCode}
                      onChange={(e) => setSkuForm({ ...skuForm, autoCode: e.target.checked })}
                      className="w-3 h-3 text-[#2563eb] rounded"
                    />
                    Auto-Generate
                  </label>
                </div>
                <Input
                  placeholder="e.g. PROD-001"
                  value={skuForm.skuCode}
                  disabled={skuForm.autoCode}
                  onChange={(e) => setSkuForm({ ...skuForm, skuCode: e.target.value })}
                  className="text-xs font-mono border-[#cbd5e1] focus:border-[#2563eb]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#334155] mb-1 block">Name *</Label>
                <Input
                  placeholder="e.g. Industrial Steel Bolt"
                  value={skuForm.name}
                  onChange={(e) => setSkuForm({ ...skuForm, name: e.target.value })}
                  className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
                />
              </div>
            </div>

            {/* Row 2: Description */}
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Description</Label>
              <Textarea
                rows={3}
                placeholder="Item specification, grade, or material notes"
                value={skuForm.description}
                onChange={(e) => setSkuForm({ ...skuForm, description: e.target.value })}
                className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>

            {/* Row 3: Category | Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-[#334155] mb-1 block">Category</Label>
                <select
                  value={skuForm.category}
                  onChange={(e) => setSkuForm({ ...skuForm, category: e.target.value })}
                  className="w-full p-2 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#334155] focus:border-[#2563eb] outline-none"
                >
                  <option value="Uncategorized">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#334155] mb-1 block">Brand</Label>
                <Input
                  placeholder="e.g. Apple, Sony, Al Foah"
                  value={skuForm.brand}
                  onChange={(e) => setSkuForm({ ...skuForm, brand: e.target.value })}
                  className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
                />
              </div>
            </div>

            {/* Row 4: Unit (UOM) | Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-[#334155] mb-1 block">Unit (UOM)</Label>
                <select
                  value={skuForm.unit}
                  onChange={(e) => setSkuForm({ ...skuForm, unit: e.target.value })}
                  className="w-full p-2 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#334155] focus:border-[#2563eb] outline-none"
                >
                  <option value="None">None</option>
                  {uoms.map((u) => (
                    <option key={u.id} value={u.code}>{u.code} - {u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#334155] mb-1 block">Status</Label>
                <select
                  value={skuForm.status}
                  onChange={(e) => setSkuForm({ ...skuForm, status: e.target.value as any })}
                  className="w-full p-2 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#334155] focus:border-[#2563eb] outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            {/* Row 5: WMS Tracking Parameters */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center space-x-2 border border-[#e2e8f0] p-2.5 rounded-md cursor-pointer hover:bg-[#f8fafc]">
                <input
                  type="checkbox"
                  checked={skuForm.batchTracking}
                  onChange={(e) => setSkuForm({ ...skuForm, batchTracking: e.target.checked })}
                  className="rounded text-[#2563eb] w-4 h-4"
                />
                <span className="font-medium text-[#334155]">Batch / Lot Tracking</span>
              </label>

              <label className="flex items-center space-x-2 border border-[#e2e8f0] p-2.5 rounded-md cursor-pointer hover:bg-[#f8fafc]">
                <input
                  type="checkbox"
                  checked={skuForm.serialTracking}
                  onChange={(e) => setSkuForm({ ...skuForm, serialTracking: e.target.checked })}
                  className="rounded text-[#2563eb] w-4 h-4"
                />
                <span className="font-medium text-[#334155]">Serial Number Tracking</span>
              </label>
            </div>
          </div>

          <DialogFooter className="border-t border-[#e2e8f0] pt-4 mt-2">
            <Button variant="outline" onClick={() => setAddSkuModal(false)} className="text-[#334155]">Cancel</Button>
            <Button onClick={handleSaveSku} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5">
              {editingSkuId ? 'Update Product' : 'Save Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.2 ADD CATEGORY MODAL */}
      <Dialog open={addCatModal} onOpenChange={setAddCatModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b] p-6 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-3">
              New Category
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Category Name *</Label>
              <Input
                placeholder="e.g. Pharmaceuticals & Medical Supplies"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Description</Label>
              <Input
                placeholder="Brief category summary..."
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-[#e2e8f0] pt-4 mt-2">
            <Button variant="outline" onClick={() => setAddCatModal(false)} className="text-[#334155]">Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.2 ADD SUB-CATEGORY MODAL */}
      <Dialog open={addSubCatModal} onOpenChange={setAddSubCatModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b] p-6 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-3">
              New Sub-Category
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Parent Category</Label>
              <select
                value={subCatForm.parentId}
                onChange={(e) => setSubCatForm({ ...subCatForm, parentId: e.target.value })}
                className="w-full p-2 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#334155] focus:border-[#2563eb] outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Sub-Category Name *</Label>
              <Input
                placeholder="e.g. Antibiotics & Vaccines"
                value={subCatForm.name}
                onChange={(e) => setSubCatForm({ ...subCatForm, name: e.target.value })}
                className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Description</Label>
              <Input
                placeholder="Sub-category description..."
                value={subCatForm.description}
                onChange={(e) => setSubCatForm({ ...subCatForm, description: e.target.value })}
                className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-[#e2e8f0] pt-4 mt-2">
            <Button variant="outline" onClick={() => setAddSubCatModal(false)} className="text-[#334155]">Cancel</Button>
            <Button onClick={handleSaveSubCategory} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">Save Sub-Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.3 ADD BARCODE MODAL */}
      <Dialog open={addBarcodeModal} onOpenChange={setAddBarcodeModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b] p-6 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-3">
              New Barcode
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Select SKU</Label>
              <select
                value={barcodeForm.skuCode}
                onChange={(e) => setBarcodeForm({ ...barcodeForm, skuCode: e.target.value })}
                className="w-full p-2 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#334155] focus:border-[#2563eb] outline-none"
              >
                {skus.map((s) => (
                  <option key={s.id} value={s.skuCode}>
                    {s.skuCode} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Barcode Value *</Label>
              <Input
                placeholder="e.g. 629109876543"
                value={barcodeForm.barcodeValue}
                onChange={(e) => setBarcodeForm({ ...barcodeForm, barcodeValue: e.target.value })}
                className="text-xs font-mono border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-[#334155] mb-1 block">Barcode Type</Label>
                <select
                  value={barcodeForm.barcodeType}
                  onChange={(e) => setBarcodeForm({ ...barcodeForm, barcodeType: e.target.value })}
                  className="w-full p-2 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#334155] focus:border-[#2563eb] outline-none"
                >
                  <option value="EAN-13">EAN-13</option>
                  <option value="UPC">UPC</option>
                  <option value="Code128">Code128</option>
                  <option value="QR">QR Code</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 pt-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={barcodeForm.isPrimary}
                  onChange={(e) => setBarcodeForm({ ...barcodeForm, isPrimary: e.target.checked })}
                  className="rounded text-[#2563eb] w-4 h-4"
                />
                <span className="font-medium text-[#334155]">Mark as Primary</span>
              </label>
            </div>
          </div>

          <DialogFooter className="border-t border-[#e2e8f0] pt-4 mt-2">
            <Button variant="outline" onClick={() => setAddBarcodeModal(false)} className="text-[#334155]">Cancel</Button>
            <Button
              onClick={() => {
                if (!barcodeForm.barcodeValue) {
                  toast.error('Please enter barcode value');
                  return;
                }
                setSkus(
                  skus.map((s) =>
                    s.skuCode === barcodeForm.skuCode
                      ? {
                          ...s,
                          alternateBarcodes: [...s.alternateBarcodes, barcodeForm.barcodeValue]
                        }
                      : s
                  )
                );
                toast.success(`Barcode "${barcodeForm.barcodeValue}" linked to ${barcodeForm.skuCode}!`);
                setAddBarcodeModal(false);
              }}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
            >
              Save Barcode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.4 ADD/EDIT UOM MODAL */}
      <Dialog open={addUomModal} onOpenChange={setAddUomModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b] p-6 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-3">
              {editingUomId ? 'Edit Unit of Measure (UOM)' : 'New Unit of Measure (UOM)'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">UOM Name *</Label>
              <Input
                placeholder="e.g. Master Carton"
                value={uomForm.name}
                onChange={(e) => setUomForm({ ...uomForm, name: e.target.value })}
                className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Short Code *</Label>
              <Input
                placeholder="e.g. MCTN"
                value={uomForm.code}
                onChange={(e) => setUomForm({ ...uomForm, code: e.target.value.toUpperCase() })}
                className="text-xs font-mono border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Measurement Type</Label>
              <select
                value={uomForm.type}
                onChange={(e) => setUomForm({ ...uomForm, type: e.target.value as any })}
                className="w-full p-2 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#334155] focus:border-[#2563eb] outline-none"
              >
                <option value="Count">Count</option>
                <option value="Weight">Weight</option>
                <option value="Volume">Volume</option>
              </select>
            </div>
          </div>

          <DialogFooter className="border-t border-[#e2e8f0] pt-4 mt-2">
            <Button variant="outline" onClick={() => setAddUomModal(false)} className="text-[#334155]">Cancel</Button>
            <Button onClick={handleSaveUom} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">Save UOM</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.5 CONFIGURE PACK MODAL */}
      <Dialog open={configurePackModal} onOpenChange={setConfigurePackModal}>
        <DialogContent className="max-w-lg bg-white text-[#1e293b] p-6 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-3">
              Configure Pack Hierarchy ({packConfigSku})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="space-y-2">
              {packLevels.map((lvl, index) => (
                <div key={index} className="flex items-center space-x-2 bg-[#f8fafc] p-2.5 rounded-md border border-[#e2e8f0]">
                  <span className="font-mono font-bold text-[#2563eb]">1</span>
                  <select
                    value={lvl.fromUom}
                    onChange={(e) => {
                      const copy = [...packLevels];
                      copy[index].fromUom = e.target.value;
                      setPackLevels(copy);
                    }}
                    className="p-1.5 bg-white border border-[#cbd5e1] rounded text-xs text-[#334155]"
                  >
                    <option value="Carton">Carton</option>
                    <option value="Master Case">Master Case</option>
                    <option value="Pallet">Pallet</option>
                    <option value="Container">Container</option>
                  </select>
                  <span className="font-bold text-[#1e293b]">=</span>
                  <input
                    type="number"
                    value={lvl.ratio}
                    onChange={(e) => {
                      const copy = [...packLevels];
                      copy[index].ratio = Number(e.target.value);
                      setPackLevels(copy);
                    }}
                    className="w-16 p-1.5 bg-white border border-[#cbd5e1] rounded text-xs font-mono font-bold text-[#334155]"
                  />
                  <select
                    value={lvl.toUom}
                    onChange={(e) => {
                      const copy = [...packLevels];
                      copy[index].toUom = e.target.value;
                      setPackLevels(copy);
                    }}
                    className="p-1.5 bg-white border border-[#cbd5e1] rounded text-xs text-[#334155]"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Box">Box</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Carton">Carton</option>
                  </select>

                  <button
                    onClick={() => setPackLevels(packLevels.filter((_, i) => i !== index))}
                    className="p-1 text-[#e11d48] hover:text-rose-600 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setPackLevels([...packLevels, { ratio: 10, fromUom: 'Pallet', toUom: 'Carton' }])}
              size="sm"
              variant="outline"
              className="text-[#334155]"
            >
              <Plus className="w-3 h-3 mr-1" /> + Add Conversion Level
            </Button>

            <div className="p-3 bg-[#f1f5f9] border border-[#cbd5e1] rounded-md text-center">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Live Calculation</span>
              <span className="font-mono text-xs font-bold text-[#2563eb]">{calculatedPackSummary}</span>
            </div>
          </div>

          <DialogFooter className="border-t border-[#e2e8f0] pt-4 mt-2">
            <Button variant="outline" onClick={() => setConfigurePackModal(false)} className="text-[#334155]">Cancel</Button>
            <Button
              onClick={() => {
                setSkus(
                  skus.map((s) => (s.skuCode === packConfigSku ? { ...s, packHierarchyChain: calculatedPackSummary } : s))
                );
                toast.success(`Pack hierarchy saved for ${packConfigSku}!`);
                setConfigurePackModal(false);
              }}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
            >
              Save Hierarchy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.6 ADD BATCH MODAL */}
      <Dialog open={addBatchModal} onOpenChange={setAddBatchModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b] p-6 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-3">
              New Batch / Lot Record
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Select SKU</Label>
              <select
                value={batchForm.skuCode}
                onChange={(e) => setBatchForm({ ...batchForm, skuCode: e.target.value })}
                className="w-full p-2 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#334155] focus:border-[#2563eb] outline-none"
              >
                {skus.map((s) => (
                  <option key={s.id} value={s.skuCode}>{s.skuCode} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Batch Number *</Label>
              <Input
                placeholder="e.g. B2026-0901"
                value={batchForm.batchNumber}
                onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                className="text-xs font-mono font-bold border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-[#334155] mb-1 block">Manufacturing Date</Label>
                <Input
                  type="date"
                  value={batchForm.mfgDate}
                  onChange={(e) => setBatchForm({ ...batchForm, mfgDate: e.target.value })}
                  className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#334155] mb-1 block">Expiry Date</Label>
                <Input
                  type="date"
                  value={batchForm.expiryDate}
                  onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                  className="text-xs border-[#cbd5e1] focus:border-[#2563eb]"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#334155] mb-1 block">Quantity</Label>
              <Input
                type="number"
                value={batchForm.quantity}
                onChange={(e) => setBatchForm({ ...batchForm, quantity: Number(e.target.value) })}
                className="text-xs font-mono font-bold border-[#cbd5e1] focus:border-[#2563eb]"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-[#e2e8f0] pt-4 mt-2">
            <Button variant="outline" onClick={() => setAddBatchModal(false)} className="text-[#334155]">Cancel</Button>
            <Button
              onClick={() => {
                if (!batchForm.batchNumber) {
                  toast.error('Please enter batch number');
                  return;
                }
                const targetSku = skus.find((s) => s.skuCode === batchForm.skuCode);
                setBatches([
                  {
                    id: `bat-${Date.now()}`,
                    skuCode: batchForm.skuCode,
                    productName: targetSku?.name || 'Product Item',
                    batchNumber: batchForm.batchNumber,
                    mfgDate: batchForm.mfgDate || '2026-03-01',
                    expiryDate: batchForm.expiryDate || '2028-03-01',
                    quantity: batchForm.quantity,
                    warehouse: batchForm.warehouse,
                    zone: batchForm.zone,
                    status: 'Active'
                  },
                  ...batches
                ]);
                toast.success(`Batch ${batchForm.batchNumber} added!`);
                setAddBatchModal(false);
              }}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
            >
              Save Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.7 ADD SERIAL MODAL */}
      <Dialog open={addSerialModal} onOpenChange={setAddSerialModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#2563eb]" />
              <span>+ Add Serial Numbers</span>
            </DialogTitle>
            <DialogDescription>Single or bulk-paste line-by-line serial inputs</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div>
              <Label className="text-xs">Select SKU</Label>
              <select
                value={serialForm.skuCode}
                onChange={(e) => setSerialForm({ ...serialForm, skuCode: e.target.value })}
                className="w-full p-2 bg-white border border-input rounded text-xs"
              >
                {skus.map((s) => (
                  <option key={s.id} value={s.skuCode}>{s.skuCode} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Serial Numbers (One per line)</Label>
              <textarea
                rows={4}
                placeholder="SN-IP15P-99001&#10;SN-IP15P-99002&#10;SN-IP15P-99003"
                value={serialForm.serialText}
                onChange={(e) => setSerialForm({ ...serialForm, serialText: e.target.value })}
                className="w-full p-2 bg-white border border-input rounded text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSerialModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const lines = serialForm.serialText.split('\n').map((l) => l.trim()).filter(Boolean);
                if (lines.length === 0) {
                  toast.error('Please enter at least one serial number');
                  return;
                }
                const targetSku = skus.find((s) => s.skuCode === serialForm.skuCode);
                const newEntries: SerialItem[] = lines.map((sNum, idx) => ({
                  id: `ser-${Date.now()}-${idx}`,
                  skuCode: serialForm.skuCode,
                  productName: targetSku?.name || 'Serialized Product',
                  serialNumber: sNum,
                  status: 'In Stock',
                  warehouseLocation: serialForm.warehouseLocation,
                  lastUpdated: new Date().toISOString().split('T')[0]
                }));
                setSerials([...newEntries, ...serials]);
                toast.success(`${lines.length} serial number(s) registered!`);
                setAddSerialModal(false);
              }}
              className="bg-[#2563eb] text-white"
            >
              Save Serials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.9 ADD DIMENSIONS MODAL */}
      <Dialog open={addDimensionsModal} onOpenChange={setAddDimensionsModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#2563eb]" />
              <span>Add / Edit Dimensions for {dimForm.skuCode}</span>
            </DialogTitle>
            <DialogDescription>Input dimensions and weights for volume calculation</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Length (cm)</Label>
                <Input
                  type="number"
                  value={dimForm.length}
                  onChange={(e) => setDimForm({ ...dimForm, length: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs">Width (cm)</Label>
                <Input
                  type="number"
                  value={dimForm.width}
                  onChange={(e) => setDimForm({ ...dimForm, width: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs">Height (cm)</Label>
                <Input
                  type="number"
                  value={dimForm.height}
                  onChange={(e) => setDimForm({ ...dimForm, height: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#2563eb] font-bold uppercase block">Auto-Calculated Volume</span>
                <span className="text-[11px] font-mono text-[#64748b]">
                  ({dimForm.length} × {dimForm.width} × {dimForm.height}) / 1,000,000
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-[#2563eb]">{calculatedCbm} CBM</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Net Weight (kg)</Label>
                <Input
                  type="number"
                  value={dimForm.netWeight}
                  onChange={(e) => setDimForm({ ...dimForm, netWeight: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs">Gross Weight (kg)</Label>
                <Input
                  type="number"
                  value={dimForm.grossWeight}
                  onChange={(e) => setDimForm({ ...dimForm, grossWeight: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDimensionsModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setSkus(
                  skus.map((s) =>
                    s.skuCode === dimForm.skuCode
                      ? {
                          ...s,
                          length: dimForm.length,
                          width: dimForm.width,
                          height: dimForm.height,
                          cbm: calculatedCbm,
                          netWeight: dimForm.netWeight,
                          grossWeight: dimForm.grossWeight
                        }
                      : s
                  )
                );
                toast.success(`Dimensions updated for ${dimForm.skuCode}!`);
                setAddDimensionsModal(false);
              }}
              className="bg-[#2563eb] text-white"
            >
              Save Dimensions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.10 ADD ORIGIN MODAL */}
      <Dialog open={addOriginModal} onOpenChange={setAddOriginModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2563eb]" />
              <span>+ Add / Edit Country of Origin</span>
            </DialogTitle>
            <DialogDescription>Maintain origin country and manufacturer declarations</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div>
              <Label className="text-xs">Select SKU</Label>
              <select
                value={originForm.skuCode}
                onChange={(e) => setOriginForm({ ...originForm, skuCode: e.target.value })}
                className="w-full p-2 bg-white border border-input rounded text-xs"
              >
                {skus.map((s) => (
                  <option key={s.id} value={s.skuCode}>{s.skuCode} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Country of Origin</Label>
              <select
                value={originForm.country}
                onChange={(e) => {
                  const country = e.target.value;
                  const flags: Record<string, string> = {
                    'United Arab Emirates': '🇦🇪',
                    China: '🇨🇳',
                    Japan: '🇯🇵',
                    France: '🇫🇷',
                    'United Kingdom': '🇬🇧',
                    'United States': '🇺🇸',
                    Germany: '🇩🇪',
                    India: '🇮🇳'
                  };
                  setOriginForm({ ...originForm, country, flag: flags[country] || '🌐' });
                }}
                className="w-full p-2 bg-white border border-input rounded text-xs"
              >
                <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                <option value="China">🇨🇳 China</option>
                <option value="Japan">🇯🇵 Japan</option>
                <option value="France">🇫🇷 France</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="United States">🇺🇸 United States</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="India">🇮🇳 India</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Manufacturer / Supplier Name</Label>
              <Input
                placeholder="e.g. Dubai South Manufacturing LLC"
                value={originForm.manufacturer}
                onChange={(e) => setOriginForm({ ...originForm, manufacturer: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOriginModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setSkus(
                  skus.map((s) =>
                    s.skuCode === originForm.skuCode
                      ? {
                          ...s,
                          countryOfOrigin: originForm.country,
                          flag: originForm.flag,
                          manufacturer: originForm.manufacturer
                        }
                      : s
                  )
                );
                toast.success(`Country of origin updated for ${originForm.skuCode}!`);
                setAddOriginModal(false);
              }}
              className="bg-[#2563eb] text-white"
            >
              Save Origin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3.11 ADD HS CODE MODAL */}
      <Dialog open={addHsModal} onOpenChange={setAddHsModal}>
        <DialogContent className="max-w-md bg-white text-[#1e293b]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
              <span>+ Add / Edit HS Customs Code</span>
            </DialogTitle>
            <DialogDescription>Maintain customs tariff classification & UAE duty rates</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div>
              <Label className="text-xs">Select SKU</Label>
              <select
                value={hsForm.skuCode}
                onChange={(e) => setHsForm({ ...hsForm, skuCode: e.target.value })}
                className="w-full p-2 bg-white border border-input rounded text-xs"
              >
                {skus.map((s) => (
                  <option key={s.id} value={s.skuCode}>{s.skuCode} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">HS Code</Label>
              <Input
                placeholder="e.g. 8471.30"
                value={hsForm.hsCode}
                onChange={(e) => setHsForm({ ...hsForm, hsCode: e.target.value })}
                className="text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-[#64748b] mt-1">
                Format: XXXX.XX (6–10 digits per customs authority).
              </p>
            </div>
            <div>
              <Label className="text-xs">Official Customs Description</Label>
              <Input
                placeholder="Enter official tariff description..."
                value={hsForm.hsDescription}
                onChange={(e) => setHsForm({ ...hsForm, hsDescription: e.target.value })}
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Customs Category</Label>
                <select
                  value={hsForm.customsCategory}
                  onChange={(e) => setHsForm({ ...hsForm, customsCategory: e.target.value })}
                  className="w-full p-2 bg-white border border-input rounded text-xs"
                >
                  <option value="Duty Free (UAE Free Zone)">Duty Free (Free Zone)</option>
                  <option value="Standard Commercial">Standard Commercial</option>
                  <option value="Agricultural Exempt">Agricultural Exempt</option>
                  <option value="Bonded Transit">Bonded Transit</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Duty Rate (%)</Label>
                <Input
                  type="number"
                  value={hsForm.dutyRate}
                  onChange={(e) => setHsForm({ ...hsForm, dutyRate: Number(e.target.value) })}
                  className="text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddHsModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setSkus(
                  skus.map((s) =>
                    s.skuCode === hsForm.skuCode
                      ? {
                          ...s,
                          hsCode: hsForm.hsCode,
                          hsDescription: hsForm.hsDescription,
                          customsCategory: hsForm.customsCategory,
                          dutyRate: hsForm.dutyRate
                        }
                      : s
                  )
                );
                toast.success(`HS Code updated for ${hsForm.skuCode}!`);
                setAddHsModal(false);
              }}
              className="bg-[#2563eb] text-white"
            >
              Save Tariff Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
