import type {
  B2BOrder,
  B2COrder,
  Allocation,
  PickingTask,
  PackageUnit,
  Pallet,
  Shipment,
  ReturnRequest,
  Wave,
  CycleCount,
  ASN,
  WmsActivityLog,
  WarehouseLocation,
  CustomerSkuMapping,
  CustomerPricing,
  WmsInventoryItem,
  Batch,
  PackingStation,
} from '@/types';
import { DEMO_WAREHOUSES, DEMO_PRODUCTS } from './demoData';

// Frontend-only demo seed for the WMS mock store, so a presentation without
// a live backend still has a believable, internally-consistent story to
// walk through: orders sitting at every stage of the pipeline, plus a few
// deliberately left early (draft / confirmed / allocated / new) so the
// presenter can drive Confirm -> Allocate -> Pick -> Pack -> Ship live.
// Every id/quantity here is cross-referenced by hand - see docs/wms-integration.md.

const WH1 = DEMO_WAREHOUSES[0].id; // Chicago Distribution Center
const WH2 = DEMO_WAREHOUSES[1].id; // Dallas Fulfillment Hub

const P_IPHONE = DEMO_PRODUCTS[0].id;
const P_GALAXY = DEMO_PRODUCTS[1].id;
const P_XPS = DEMO_PRODUCTS[2].id;
const P_SONY = DEMO_PRODUCTS[3].id;
const P_ANKER = DEMO_PRODUCTS[4].id;
const P_INSTANTPOT = DEMO_PRODUCTS[5].id;
const P_DYSON = DEMO_PRODUCTS[6].id;
const P_NIKE = DEMO_PRODUCTS[7].id;

export const DEMO_LOCATIONS: WarehouseLocation[] = [
  { id: 'demo-loc-1', code: 'A-01-01', warehouseId: WH1, zone: 'A', type: 'bin' },
  { id: 'demo-loc-2', code: 'A-01-01', warehouseId: WH2, zone: 'A', type: 'bin' },
  { id: "loc-2", code: "A-01-02", warehouseId: WH1, zone: "A", type: "bin" },
  { id: "loc-3", code: "B-02-01", warehouseId: WH1, zone: "B", type: "bin" },
  { id: "loc-4", code: "B-02-02", warehouseId: WH1, zone: "B", type: "bin" },
  { id: "loc-5", code: "C-03-04", warehouseId: WH1, zone: "C", type: "bin" },
  { id: "loc-6", code: "STG-01", warehouseId: WH1, zone: "STAGING", type: "staging" },
  { id: "loc-7", code: "DMG-01", warehouseId: WH1, zone: "DAMAGED", type: "damaged" },
  { id: "loc-8", code: "DOCK-01", warehouseId: WH1, zone: "DOCK", type: "dock" },
  { id: "loc-9", code: "RTN-01", warehouseId: WH1, zone: "RETURNS", type: "returns" },
  { id: "loc-11", code: "B-01-01", warehouseId: WH2, zone: "B", type: "bin" },
];

export const DEMO_BATCHES: Batch[] = [
  { id: 'b-1', batchNumber: 'BATCH-2025-01', productId: P_IPHONE, mfgDate: '2025-01-01', expiryDate: '2027-01-01', status: 'active' },
  { id: 'b-2', batchNumber: 'BATCH-2025-02', productId: P_IPHONE, mfgDate: '2025-02-01', expiryDate: '2027-02-01', status: 'active' },
  { id: 'b-3', batchNumber: 'BATCH-2025-03', productId: P_GALAXY, mfgDate: '2025-03-01', expiryDate: '2027-03-01', status: 'active' },
  { id: 'b-4', batchNumber: 'BATCH-2025-04', productId: P_INSTANTPOT, mfgDate: '2025-04-01', expiryDate: '2030-04-01', status: 'active' },
  { id: 'b-5', batchNumber: 'BATCH-2025-05', productId: P_INSTANTPOT, mfgDate: '2025-05-01', expiryDate: '2030-05-01', status: 'active' },
  { id: 'b-6', batchNumber: 'BATCH-2025-06', productId: P_DYSON, mfgDate: '2025-06-01', expiryDate: '2030-06-01', status: 'active' },
  { id: 'b-7', batchNumber: 'BATCH-2025-07', productId: P_XPS, mfgDate: '2025-07-01', expiryDate: '2028-07-01', status: 'active' }
];

export const DEMO_INVENTORY_ITEMS: WmsInventoryItem[] = [
  { id: "inv-1", productId: P_IPHONE, warehouseId: WH1, locationId: "demo-loc-1", batchId: "b-1", physicalQty: 60, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-2", productId: P_IPHONE, warehouseId: WH1, locationId: "loc-2", batchId: "b-2", physicalQty: 40, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-3", productId: P_GALAXY, warehouseId: WH1, locationId: "loc-3", batchId: "b-3", physicalQty: 60, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-4", productId: P_XPS, warehouseId: WH1, locationId: "loc-4", batchId: "b-7", physicalQty: 10, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-5", productId: P_XPS, warehouseId: WH2, locationId: "demo-loc-2", batchId: "b-7", physicalQty: 15, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-6", productId: P_SONY, warehouseId: WH1, locationId: "loc-5", physicalQty: 150, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-7", productId: P_ANKER, warehouseId: WH1, locationId: "loc-3", physicalQty: 40, reservedQty: 0, damagedQty: 3, updatedAt: "2026-09-22" },
  { id: "inv-8", productId: P_INSTANTPOT, warehouseId: WH1, locationId: "loc-5", batchId: "b-4", physicalQty: 300, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-9", productId: P_INSTANTPOT, warehouseId: WH1, locationId: "loc-5", batchId: "b-5", physicalQty: 500, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-10", productId: P_DYSON, warehouseId: WH1, locationId: "demo-loc-1", batchId: "b-6", physicalQty: 5, reservedQty: 0, damagedQty: 2, updatedAt: "2026-09-22" },
  { id: "inv-11", productId: P_NIKE, warehouseId: WH1, locationId: "loc-2", physicalQty: 0, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
  { id: "inv-12", productId: P_GALAXY, warehouseId: WH2, locationId: "loc-11", batchId: "b-3", physicalQty: 20, reservedQty: 0, damagedQty: 0, updatedAt: "2026-09-22" },
];

export const DEMO_CUSTOMER_SKU_MAPPINGS: CustomerSkuMapping[] = [
  { id: 'demo-csm-1', customerId: 'demo-cust-1', productId: P_IPHONE, customerSku: 'SRG-IPH15PRO' },
  { id: 'demo-csm-2', customerId: 'demo-cust-2', productId: P_XPS, customerSku: 'PWP-DXPS15' },
  { id: 'demo-csm-3', customerId: 'demo-cust-3', productId: P_GALAXY, customerSku: 'HZE-SGS24' },
];

export const DEMO_CUSTOMER_PRICING: CustomerPricing[] = [
  { id: 'demo-cp-1', customerId: 'demo-cust-1', productId: P_IPHONE, price: 1150 },
  { id: 'demo-cp-2', customerId: 'demo-cust-2', productId: P_XPS, price: 1799 },
  { id: 'demo-cp-3', customerId: 'demo-cust-3', productId: P_GALAXY, price: 950 },
];

export const DEMO_B2B_ORDERS: B2BOrder[] = [
  {
    id: 'demo-b2b-1',
    orderNumber: 'SO-00001',
    customerId: 'demo-cust-1',
    customerPO: 'PO-SRG-8841',
    orderDate: '2026-09-15',
    expectedDelivery: '2026-09-20',
    priority: 'normal',
    deliveryAddress: '900 W Fulton Market, Chicago, IL',
    warehouseId: WH1,
    status: 'delivered',
    currency: 'USD',
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-19T15:30:00.000Z',
    deliveryScheduledAt: '2026-09-19',
    pod: { deliveredDate: '2026-09-19', receivedBy: 'Warehouse Manager', notes: 'Received in good condition, all units accounted for.' },
    items: [
      { id: 'demo-b2bi-1', productId: P_IPHONE, customerSku: 'SRG-IPH15PRO', quantity: 10, unitPrice: 1150, discount: 0, allocatedQty: 10, backorderQty: 0, pickedQty: 10, packedQty: 10, dispatchedQty: 10 },
    ],
  },
  {
    id: 'demo-b2b-2',
    orderNumber: 'SO-00002',
    customerId: 'demo-cust-2',
    customerPO: 'PO-PWP-2210',
    orderDate: '2026-09-17',
    expectedDelivery: '2026-09-23',
    priority: 'high',
    deliveryAddress: '2200 Irving Blvd, Dallas, TX',
    warehouseId: WH2,
    status: 'dispatched',
    currency: 'USD',
    createdAt: '2026-09-17T10:15:00.000Z',
    updatedAt: '2026-09-21T11:00:00.000Z',
    items: [
      { id: 'demo-b2bi-2', productId: P_XPS, customerSku: 'PWP-DXPS15', quantity: 5, unitPrice: 1799, discount: 0, allocatedQty: 5, backorderQty: 0, pickedQty: 5, packedQty: 5, dispatchedQty: 5 },
    ],
  },
  {
    id: 'demo-b2b-3',
    orderNumber: 'SO-00003',
    customerId: 'demo-cust-3',
    customerPO: 'PO-HZE-5502',
    orderDate: '2026-09-19',
    expectedDelivery: '2026-09-26',
    priority: 'normal',
    deliveryAddress: '3400 Peachtree Rd NE, Atlanta, GA',
    warehouseId: WH1,
    status: 'picking',
    currency: 'USD',
    createdAt: '2026-09-19T13:45:00.000Z',
    updatedAt: '2026-09-21T09:00:00.000Z',
    items: [
      { id: 'demo-b2bi-3', productId: P_GALAXY, customerSku: 'HZE-SGS24', quantity: 8, unitPrice: 950, discount: 0, allocatedQty: 8, backorderQty: 0, pickedQty: 0, packedQty: 0, dispatchedQty: 0 },
    ],
  },
  {
    id: 'demo-b2b-4',
    orderNumber: 'SO-00004',
    customerId: 'demo-cust-4',
    customerPO: 'PO-MTC-1190',
    orderDate: '2026-09-21',
    expectedDelivery: '2026-09-28',
    priority: 'low',
    deliveryAddress: '55 Water St, New York, NY',
    warehouseId: WH1,
    status: 'confirmed',
    currency: 'USD',
    createdAt: '2026-09-21T14:00:00.000Z',
    updatedAt: '2026-09-21T14:05:00.000Z',
    items: [
      { id: 'demo-b2bi-4', productId: P_SONY, quantity: 20, unitPrice: 380, discount: 5, allocatedQty: 0, backorderQty: 0, pickedQty: 0, packedQty: 0, dispatchedQty: 0 },
    ],
  },
  {
    id: 'demo-b2b-5',
    orderNumber: 'SO-00005',
    customerId: 'demo-cust-1',
    customerPO: 'PO-SRG-9012',
    orderDate: '2026-09-22',
    expectedDelivery: '2026-09-29',
    priority: 'normal',
    deliveryAddress: '900 W Fulton Market, Chicago, IL',
    warehouseId: WH1,
    status: 'draft',
    currency: 'USD',
    createdAt: '2026-09-22T08:30:00.000Z',
    updatedAt: '2026-09-22T08:30:00.000Z',
    items: [
      { id: 'demo-b2bi-5', productId: P_ANKER, quantity: 100, unitPrice: 45, discount: 0, allocatedQty: 0, backorderQty: 0, pickedQty: 0, packedQty: 0, dispatchedQty: 0 },
    ],
  },
];

export const DEMO_B2C_ORDERS: B2COrder[] = [
  {
    id: 'demo-b2c-1',
    orderNumber: 'ECM-00001',
    channel: 'website',
    customerName: 'Michael Johnson',
    customerPhone: '+1 773 555 0111',
    customerAddress: '118 N Racine Ave, Apt 3B, Chicago, IL',
    warehouseId: WH1,
    amount: 1199,
    currency: 'USD',
    paymentMethod: 'prepaid',
    fulfillmentStatus: 'delivered',
    trackingNumber: 'USPS9400111899223344556677',
    carrier: 'USPS',
    orderDate: '2026-09-16',
    createdAt: '2026-09-16T11:00:00.000Z',
    updatedAt: '2026-09-19T16:00:00.000Z',
    items: [{ id: 'demo-b2ci-1', productId: P_IPHONE, quantity: 1, unitPrice: 1199, allocatedQty: 1, backorderQty: 0, pickedQty: 1, packedQty: 1 }],
  },
  {
    id: 'demo-b2c-2',
    orderNumber: 'ECM-00002',
    channel: 'amazon',
    customerName: 'Emily Davis',
    customerPhone: '+1 469 555 0122',
    customerAddress: '4521 Live Oak St, Dallas, TX',
    warehouseId: WH2,
    amount: 198,
    currency: 'USD',
    paymentMethod: 'cod',
    codAmount: 198,
    codStatus: 'collected',
    fulfillmentStatus: 'shipped',
    trackingNumber: 'FDX784512369870',
    carrier: 'FedEx',
    orderDate: '2026-09-18',
    createdAt: '2026-09-18T09:30:00.000Z',
    updatedAt: '2026-09-21T10:00:00.000Z',
    items: [{ id: 'demo-b2ci-2', productId: P_INSTANTPOT, quantity: 2, unitPrice: 99, allocatedQty: 2, backorderQty: 0, pickedQty: 2, packedQty: 2 }],
  },
  {
    id: 'demo-b2c-3',
    orderNumber: 'ECM-00003',
    channel: 'marketplace',
    customerName: 'Christopher Martinez',
    customerPhone: '+1 470 555 0133',
    customerAddress: '2810 Piedmont Rd NE, Atlanta, GA',
    warehouseId: WH1,
    amount: 749,
    currency: 'USD',
    paymentMethod: 'prepaid',
    fulfillmentStatus: 'packed',
    orderDate: '2026-09-19',
    createdAt: '2026-09-19T15:00:00.000Z',
    updatedAt: '2026-09-21T12:00:00.000Z',
    items: [{ id: 'demo-b2ci-3', productId: P_DYSON, quantity: 1, unitPrice: 749, allocatedQty: 1, backorderQty: 0, pickedQty: 1, packedQty: 1 }],
  },
  {
    id: 'demo-b2c-4',
    orderNumber: 'ECM-00004',
    channel: 'amazon',
    customerName: 'Ashley Thompson',
    customerPhone: '+1 646 555 0144',
    customerAddress: '210 E 23rd St, Apt 9, New York, NY',
    warehouseId: WH1,
    amount: 300,
    currency: 'USD',
    paymentMethod: 'cod',
    codAmount: 300,
    codStatus: 'pending',
    fulfillmentStatus: 'rto',
    rtoReason: 'Customer unavailable',
    trackingNumber: 'FDX998877665544',
    carrier: 'FedEx',
    orderDate: '2026-09-14',
    createdAt: '2026-09-14T10:00:00.000Z',
    updatedAt: '2026-09-20T09:00:00.000Z',
    items: [{ id: 'demo-b2ci-4', productId: P_NIKE, quantity: 2, unitPrice: 150, allocatedQty: 2, backorderQty: 0, pickedQty: 2, packedQty: 2 }],
  },
  {
    id: 'demo-b2c-5',
    orderNumber: 'ECM-00005',
    channel: 'website',
    customerName: 'Michael Johnson',
    customerPhone: '+1 773 555 0111',
    customerAddress: '118 N Racine Ave, Apt 3B, Chicago, IL',
    warehouseId: WH1,
    amount: 399,
    currency: 'USD',
    paymentMethod: 'prepaid',
    fulfillmentStatus: 'allocated',
    orderDate: '2026-09-21',
    createdAt: '2026-09-21T16:00:00.000Z',
    updatedAt: '2026-09-21T16:10:00.000Z',
    items: [{ id: 'demo-b2ci-5', productId: P_SONY, quantity: 1, unitPrice: 399, allocatedQty: 1, backorderQty: 0, pickedQty: 0, packedQty: 0 }],
  },
  {
    id: 'demo-b2c-6',
    orderNumber: 'ECM-00006',
    channel: 'amazon',
    customerName: 'Emily Davis',
    customerPhone: '+1 469 555 0122',
    customerAddress: '4521 Live Oak St, Dallas, TX',
    warehouseId: WH2,
    amount: 147,
    currency: 'USD',
    paymentMethod: 'cod',
    codAmount: 147,
    codStatus: 'pending',
    fulfillmentStatus: 'new',
    orderDate: '2026-09-22',
    createdAt: '2026-09-22T09:00:00.000Z',
    updatedAt: '2026-09-22T09:00:00.000Z',
    items: [{ id: 'demo-b2ci-6', productId: P_ANKER, quantity: 3, unitPrice: 49, allocatedQty: 0, backorderQty: 0, pickedQty: 0, packedQty: 0 }],
  },
];

export const DEMO_ALLOCATIONS: Allocation[] = [
  { id: 'demo-alloc-1', orderId: 'demo-b2b-1', orderType: 'b2b', productId: P_IPHONE, requestedQty: 10, allocatedQty: 10, backorderQty: 0, strategy: 'FEFO', batchAllocations: [{ locationId: 'demo-loc-1', qty: 10 }], createdAt: '2026-09-15T09:30:00.000Z' },
  { id: 'demo-alloc-2', orderId: 'demo-b2b-2', orderType: 'b2b', productId: P_XPS, requestedQty: 5, allocatedQty: 5, backorderQty: 0, strategy: 'FEFO', batchAllocations: [{ locationId: 'demo-loc-2', qty: 5 }], createdAt: '2026-09-17T10:30:00.000Z' },
  { id: 'demo-alloc-3', orderId: 'demo-b2b-3', orderType: 'b2b', productId: P_GALAXY, requestedQty: 8, allocatedQty: 8, backorderQty: 0, strategy: 'FEFO', batchAllocations: [{ locationId: 'demo-loc-1', qty: 8 }], createdAt: '2026-09-19T14:00:00.000Z' },
  { id: 'demo-alloc-4', orderId: 'demo-b2c-1', orderType: 'b2c', productId: P_IPHONE, requestedQty: 1, allocatedQty: 1, backorderQty: 0, strategy: 'FEFO', batchAllocations: [{ locationId: 'demo-loc-1', qty: 1 }], createdAt: '2026-09-16T11:15:00.000Z' },
  { id: 'demo-alloc-5', orderId: 'demo-b2c-2', orderType: 'b2c', productId: P_INSTANTPOT, requestedQty: 2, allocatedQty: 2, backorderQty: 0, strategy: 'FEFO', batchAllocations: [{ locationId: 'demo-loc-2', qty: 2 }], createdAt: '2026-09-18T09:45:00.000Z' },
  { id: 'demo-alloc-6', orderId: 'demo-b2c-3', orderType: 'b2c', productId: P_DYSON, requestedQty: 1, allocatedQty: 1, backorderQty: 0, strategy: 'FEFO', batchAllocations: [{ locationId: 'demo-loc-1', qty: 1 }], createdAt: '2026-09-19T15:15:00.000Z' },
  { id: 'demo-alloc-7', orderId: 'demo-b2c-4', orderType: 'b2c', productId: P_NIKE, requestedQty: 2, allocatedQty: 2, backorderQty: 0, strategy: 'FEFO', batchAllocations: [{ locationId: 'demo-loc-1', qty: 2 }], createdAt: '2026-09-14T10:15:00.000Z' },
  { id: 'demo-alloc-8', orderId: 'demo-b2c-5', orderType: 'b2c', productId: P_SONY, requestedQty: 1, allocatedQty: 1, backorderQty: 0, strategy: 'FEFO', batchAllocations: [{ locationId: 'demo-loc-1', qty: 1 }], createdAt: '2026-09-21T16:10:00.000Z' },
];

export const DEMO_PICKING_TASKS: PickingTask[] = [
  { id: 'demo-pt-1', taskNumber: 'PT-00001', orderId: 'demo-b2b-1', orderType: 'b2b', orderNumber: 'SO-00001', type: 'single', warehouseId: WH1, picker: 'Robert Chen', priority: 'normal', status: 'completed', items: [{ id: 'demo-pki-1', productId: P_IPHONE, locationId: 'demo-loc-1', expectedQty: 10, pickedQty: 10, status: 'picked' }], createdAt: '2026-09-16T08:00:00.000Z', updatedAt: '2026-09-16T09:00:00.000Z' },
  { id: 'demo-pt-2', taskNumber: 'PT-00002', orderId: 'demo-b2b-2', orderType: 'b2b', orderNumber: 'SO-00002', type: 'single', warehouseId: WH2, picker: 'Maria Gonzalez', priority: 'high', status: 'completed', items: [{ id: 'demo-pki-2', productId: P_XPS, locationId: 'demo-loc-2', expectedQty: 5, pickedQty: 5, status: 'picked' }], createdAt: '2026-09-18T08:00:00.000Z', updatedAt: '2026-09-18T09:00:00.000Z' },
  { id: 'demo-pt-3', taskNumber: 'PT-00003', orderId: 'demo-b2b-3', orderType: 'b2b', orderNumber: 'SO-00003', type: 'single', warehouseId: WH1, picker: 'James Wilson', priority: 'normal', status: 'in_progress', items: [{ id: 'demo-pki-3', productId: P_GALAXY, locationId: 'demo-loc-1', expectedQty: 8, pickedQty: 0, status: 'pending' }], createdAt: '2026-09-21T09:00:00.000Z', updatedAt: '2026-09-21T09:05:00.000Z' },
  { id: 'demo-pt-4', taskNumber: 'PT-00004', orderId: 'demo-b2c-1', orderType: 'b2c', orderNumber: 'ECM-00001', type: 'single', warehouseId: WH1, picker: 'Robert Chen', priority: 'normal', status: 'completed', items: [{ id: 'demo-pki-4', productId: P_IPHONE, locationId: 'demo-loc-1', expectedQty: 1, pickedQty: 1, status: 'picked' }], createdAt: '2026-09-17T08:00:00.000Z', updatedAt: '2026-09-17T08:30:00.000Z' },
  { id: 'demo-pt-5', taskNumber: 'PT-00005', orderId: 'demo-b2c-2', orderType: 'b2c', orderNumber: 'ECM-00002', type: 'single', warehouseId: WH2, picker: 'Maria Gonzalez', priority: 'normal', status: 'completed', items: [{ id: 'demo-pki-5', productId: P_INSTANTPOT, locationId: 'demo-loc-2', expectedQty: 2, pickedQty: 2, status: 'picked' }], createdAt: '2026-09-19T08:00:00.000Z', updatedAt: '2026-09-19T08:20:00.000Z' },
  { id: 'demo-pt-6', taskNumber: 'PT-00006', orderId: 'demo-b2c-3', orderType: 'b2c', orderNumber: 'ECM-00003', type: 'single', warehouseId: WH1, picker: 'James Wilson', priority: 'normal', status: 'completed', items: [{ id: 'demo-pki-6', productId: P_DYSON, locationId: 'demo-loc-1', expectedQty: 1, pickedQty: 1, status: 'picked' }], createdAt: '2026-09-20T08:00:00.000Z', updatedAt: '2026-09-20T08:20:00.000Z' },
  { id: 'demo-pt-7', taskNumber: 'PT-00007', orderId: 'demo-b2c-4', orderType: 'b2c', orderNumber: 'ECM-00004', type: 'single', warehouseId: WH1, picker: 'James Wilson', priority: 'normal', status: 'completed', items: [{ id: 'demo-pki-7', productId: P_NIKE, locationId: 'demo-loc-1', expectedQty: 2, pickedQty: 2, status: 'picked' }], createdAt: '2026-09-14T11:00:00.000Z', updatedAt: '2026-09-14T11:20:00.000Z' },
];

export const DEMO_PACKAGES: PackageUnit[] = [
  { id: 'demo-pkg-1', packageNumber: 'PKG-00001', orderId: 'demo-b2b-1', orderType: 'b2b', boxType: 'large_box', weightKg: 8.5, dimensions: { l: 60, w: 45, h: 40 }, items: [{ productId: P_IPHONE, qty: 10 }], status: 'ready_to_ship', verification: { skuVerified: true, quantityVerified: true, packageSelected: true, labelGenerated: true }, shippingLabel: { trackingNumber: 'UPS1Z999AA10123456784', carrier: 'UPS', generatedAt: '2026-09-16T10:00:00.000Z' }, palletId: 'demo-plt-1', createdAt: '2026-09-16T09:30:00.000Z', updatedAt: '2026-09-16T10:00:00.000Z' },
  { id: 'demo-pkg-2', packageNumber: 'PKG-00002', orderId: 'demo-b2b-2', orderType: 'b2b', boxType: 'medium_box', weightKg: 12, dimensions: { l: 45, w: 35, h: 25 }, items: [{ productId: P_XPS, qty: 5 }], status: 'ready_to_ship', verification: { skuVerified: true, quantityVerified: true, packageSelected: true, labelGenerated: true }, shippingLabel: { trackingNumber: 'FDX612345789034', carrier: 'FedEx', generatedAt: '2026-09-18T10:00:00.000Z' }, createdAt: '2026-09-18T09:30:00.000Z', updatedAt: '2026-09-18T10:00:00.000Z' },
  { id: 'demo-pkg-3', packageNumber: 'PKG-00003', orderId: 'demo-b2c-1', orderType: 'b2c', boxType: 'small_box', weightKg: 0.5, dimensions: { l: 30, w: 20, h: 15 }, items: [{ productId: P_IPHONE, qty: 1 }], status: 'ready_to_ship', verification: { skuVerified: true, quantityVerified: true, packageSelected: true, labelGenerated: true }, shippingLabel: { trackingNumber: 'USPS9400111899223344556677', carrier: 'USPS', generatedAt: '2026-09-17T09:00:00.000Z' }, createdAt: '2026-09-17T08:40:00.000Z', updatedAt: '2026-09-17T09:00:00.000Z' },
  { id: 'demo-pkg-4', packageNumber: 'PKG-00004', orderId: 'demo-b2c-2', orderType: 'b2c', boxType: 'medium_box', weightKg: 3, dimensions: { l: 45, w: 35, h: 25 }, items: [{ productId: P_INSTANTPOT, qty: 2 }], status: 'ready_to_ship', verification: { skuVerified: true, quantityVerified: true, packageSelected: true, labelGenerated: true }, shippingLabel: { trackingNumber: 'FDX784512369870', carrier: 'FedEx', generatedAt: '2026-09-19T09:00:00.000Z' }, createdAt: '2026-09-19T08:30:00.000Z', updatedAt: '2026-09-19T09:00:00.000Z' },
  { id: 'demo-pkg-5', packageNumber: 'PKG-00005', orderId: 'demo-b2c-3', orderType: 'b2c', boxType: 'large_box', weightKg: 4, dimensions: { l: 60, w: 45, h: 40 }, items: [{ productId: P_DYSON, qty: 1 }], status: 'packed', verification: { skuVerified: true, quantityVerified: true, packageSelected: true, labelGenerated: true }, shippingLabel: { trackingNumber: 'UPS1Z999AA10987654321', carrier: 'UPS', generatedAt: '2026-09-21T11:30:00.000Z' }, stationId: 'demo-stn-1', createdAt: '2026-09-21T11:00:00.000Z', updatedAt: '2026-09-21T12:00:00.000Z' },
  { id: 'demo-pkg-6', packageNumber: 'PKG-00006', orderId: 'demo-b2c-4', orderType: 'b2c', boxType: 'medium_box', weightKg: 1.5, dimensions: { l: 45, w: 35, h: 25 }, items: [{ productId: P_NIKE, qty: 2 }], status: 'ready_to_ship', verification: { skuVerified: true, quantityVerified: true, packageSelected: true, labelGenerated: true }, shippingLabel: { trackingNumber: 'FDX998877665544', carrier: 'FedEx', generatedAt: '2026-09-14T12:00:00.000Z' }, createdAt: '2026-09-14T11:30:00.000Z', updatedAt: '2026-09-14T12:00:00.000Z' },
];

export const DEMO_PALLETS: Pallet[] = [
  { id: 'demo-plt-1', palletNumber: 'PLT-00001', orderId: 'demo-b2b-1', cartonIds: ['demo-pkg-1'], createdAt: '2026-09-16T10:05:00.000Z' },
];

export const DEMO_SHIPMENTS: Shipment[] = [
  { id: 'demo-shp-1', shipmentNumber: 'SHP-00001', orderId: 'demo-b2b-1', orderType: 'b2b', packageIds: ['demo-pkg-1'], carrier: 'UPS', trackingNumber: 'UPS1Z999AA10123456784', status: 'delivered', dispatchedAt: '2026-09-17T08:00:00.000Z', deliveredAt: '2026-09-19T15:30:00.000Z', createdAt: '2026-09-16T10:10:00.000Z' },
  { id: 'demo-shp-2', shipmentNumber: 'SHP-00002', orderId: 'demo-b2b-2', orderType: 'b2b', packageIds: ['demo-pkg-2'], carrier: 'FedEx', trackingNumber: 'FDX612345789034', status: 'in_transit', dispatchedAt: '2026-09-21T11:00:00.000Z', createdAt: '2026-09-18T10:10:00.000Z' },
  { id: 'demo-shp-3', shipmentNumber: 'SHP-00003', orderId: 'demo-b2c-1', orderType: 'b2c', packageIds: ['demo-pkg-3'], carrier: 'USPS', trackingNumber: 'USPS9400111899223344556677', status: 'delivered', dispatchedAt: '2026-09-17T12:00:00.000Z', deliveredAt: '2026-09-19T16:00:00.000Z', createdAt: '2026-09-17T09:05:00.000Z' },
  { id: 'demo-shp-4', shipmentNumber: 'SHP-00004', orderId: 'demo-b2c-2', orderType: 'b2c', packageIds: ['demo-pkg-4'], carrier: 'FedEx', trackingNumber: 'FDX784512369870', status: 'in_transit', dispatchedAt: '2026-09-21T10:00:00.000Z', createdAt: '2026-09-19T09:05:00.000Z' },
  { id: 'demo-shp-5', shipmentNumber: 'SHP-00005', orderId: 'demo-b2c-4', orderType: 'b2c', packageIds: ['demo-pkg-6'], carrier: 'FedEx', trackingNumber: 'FDX998877665544', status: 'rto', dispatchedAt: '2026-09-15T09:00:00.000Z', createdAt: '2026-09-14T12:05:00.000Z' },
];

export const DEMO_RETURNS: ReturnRequest[] = [
  { id: 'demo-ret-1', returnNumber: 'RET-00001', orderId: 'demo-b2c-4', orderType: 'b2c', customerName: 'Ashley Thompson', items: [{ productId: P_NIKE, quantity: 2, reason: 'Customer unavailable', condition: 'good' }], status: 'received', createdAt: '2026-09-20T09:30:00.000Z', updatedAt: '2026-09-21T10:00:00.000Z' },
];

export const DEMO_WAVES: Wave[] = [
  { id: 'demo-wave-1', waveNumber: 'WAVE-00001', name: 'Morning Wave — Sep 17', warehouseId: WH1, priority: 'normal', cutoffTime: '2026-09-17T12:00:00.000Z', orderIds: ['demo-b2c-1'], status: 'completed', createdAt: '2026-09-17T07:00:00.000Z' },
];

export const DEMO_CYCLE_COUNTS: CycleCount[] = [
  {
    id: 'demo-cc-1',
    countNumber: 'CC-00001',
    countType: 'cycle',
    warehouseId: WH1,
    zone: 'A',
    assignedUser: 'Robert Chen',
    countDate: '2026-09-20',
    status: 'in_progress',
    lines: [
      { id: 'demo-ccl-1', productId: P_IPHONE, locationId: 'demo-loc-1', expectedQty: 120, countedQty: 118, status: 'shortage' },
      { id: 'demo-ccl-2', productId: P_GALAXY, locationId: 'demo-loc-1', expectedQty: 85, countedQty: null, status: 'pending' },
    ],
    createdAt: '2026-09-20T08:00:00.000Z',
  },
];

export const DEMO_ASNS: ASN[] = [
  { id: 'demo-asn-1', asnNumber: 'ASN-00001', orderId: 'demo-b2b-2', customerId: 'demo-cust-2', items: [{ productId: P_XPS, quantity: 5 }], expectedDispatch: '2026-09-21', expectedDelivery: '2026-09-23', status: 'issued', createdAt: '2026-09-18T10:30:00.000Z' },
];

export const DEMO_ACTIVITY_LOGS: WmsActivityLog[] = [
  { id: 'demo-log-1', entityType: 'b2b_order', entityId: 'demo-b2b-1', action: 'pod', description: 'Proof of delivery recorded, received by Warehouse Manager', actor: 'Robert Chen', timestamp: '2026-09-19T15:30:00.000Z' },
  { id: 'demo-log-2', entityType: 'shipment', entityId: 'demo-shp-1', action: 'dispatch', description: 'Shipment dispatched', actor: 'Robert Chen', timestamp: '2026-09-17T08:00:00.000Z' },
  { id: 'demo-log-3', entityType: 'b2b_order', entityId: 'demo-b2b-2', action: 'dispatch', description: 'Shipment dispatched', actor: 'Maria Gonzalez', timestamp: '2026-09-21T11:00:00.000Z' },
  { id: 'demo-log-4', entityType: 'picking_task', entityId: 'demo-pt-3', action: 'assign', description: 'Assigned to James Wilson', actor: 'James Wilson', timestamp: '2026-09-21T09:00:00.000Z' },
  { id: 'demo-log-5', entityType: 'b2c_order', entityId: 'demo-b2c-4', action: 'rto', description: 'Marked RTO: Customer unavailable', actor: 'Maria Gonzalez', timestamp: '2026-09-20T09:00:00.000Z' },
  { id: 'demo-log-6', entityType: 'return', entityId: 'demo-ret-1', action: 'status', description: 'Return moved to received', actor: 'Maria Gonzalez', timestamp: '2026-09-21T10:00:00.000Z' },
  { id: 'demo-log-7', entityType: 'b2c_order', entityId: 'demo-b2c-5', action: 'allocate', description: 'Inventory allocated using FEFO strategy', actor: 'Robert Chen', timestamp: '2026-09-21T16:10:00.000Z' },
  { id: 'demo-log-8', entityType: 'asn', entityId: 'demo-asn-1', action: 'create', description: 'ASN ASN-00001 issued for order SO-00002', actor: 'Maria Gonzalez', timestamp: '2026-09-18T10:30:00.000Z' },
];

// Reserved-but-not-yet-picked quantities, kept in sync by hand with the
// orders above: SO-00003 (8x Galaxy S24, allocated/not picked) and
// ECM-00005 (1x Sony headphones, allocated/not picked).
export const DEMO_RESERVATIONS: Record<string, number> = {
  [`${P_GALAXY}:${WH1}`]: 8,
  [`${P_SONY}:${WH1}`]: 1,
};

export const DEMO_PACKING_STATIONS: PackingStation[] = [
  { id: 'demo-stn-1', stationNumber: 'STN-01', operator: 'Robert Chen', currentPackageId: 'demo-pkg-5' },
  { id: 'demo-stn-2', stationNumber: 'STN-02', operator: 'Maria Gonzalez' },
  { id: 'demo-stn-3', stationNumber: 'STN-03' },
];
