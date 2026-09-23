import type {
  WarehouseLocation,
  Batch,
  CustomerSkuMapping,
  CustomerPricing,
  B2BOrder,
  B2COrder,
  PickingTask,
  Wave,
  PackageUnit,
  Pallet,
  Shipment,
  ReturnRequest,
  WmsInventoryMovement,
  WmsStockAdjustment,
  CycleCount,
  ASN,
  WmsActivityLog,
  Allocation,
  WmsInventoryItem,
  PackingStation,
} from '@/types';
import {
  DEMO_B2B_ORDERS,
  DEMO_B2C_ORDERS,
  DEMO_ALLOCATIONS,
  DEMO_PICKING_TASKS,
  DEMO_PACKAGES,
  DEMO_PALLETS,
  DEMO_SHIPMENTS,
  DEMO_RETURNS,
  DEMO_WAVES,
  DEMO_CYCLE_COUNTS,
  DEMO_ASNS,
  DEMO_ACTIVITY_LOGS,
  DEMO_LOCATIONS,
  DEMO_CUSTOMER_SKU_MAPPINGS,
  DEMO_CUSTOMER_PRICING,
  DEMO_RESERVATIONS,
  DEMO_INVENTORY_ITEMS,
  DEMO_BATCHES,
  DEMO_PACKING_STATIONS,
} from './demoSeed';

export interface WmsDatabase {
  locations: WarehouseLocation[];
  batches: Batch[];
  customerSkuMappings: CustomerSkuMapping[];
  customerPricing: CustomerPricing[];
  b2bOrders: B2BOrder[];
  b2cOrders: B2COrder[];
  pickingTasks: PickingTask[];
  waves: Wave[];
  packages: PackageUnit[];
  pallets: Pallet[];
  shipments: Shipment[];
  returns: ReturnRequest[];
  movements: WmsInventoryMovement[];
  adjustments: WmsStockAdjustment[];
  cycleCounts: CycleCount[];
  asns: ASN[];
  activityLogs: WmsActivityLog[];
  allocations: Allocation[];
  // "Reserved" quantities live here instead of on the real StockLevel record
  // (which the backend owns) - keyed by `${productId}:${warehouseId}`.
  reservations: Record<string, number>;
  inventoryItems: WmsInventoryItem[];
  packingStations: PackingStation[];
  meta: { lastSync: string | null };
}

function freshDatabase(): WmsDatabase {
  return {
    locations: structuredClone(DEMO_LOCATIONS),
    batches: structuredClone(DEMO_BATCHES),
    customerSkuMappings: structuredClone(DEMO_CUSTOMER_SKU_MAPPINGS),
    customerPricing: structuredClone(DEMO_CUSTOMER_PRICING),
    b2bOrders: structuredClone(DEMO_B2B_ORDERS),
    b2cOrders: structuredClone(DEMO_B2C_ORDERS),
    pickingTasks: structuredClone(DEMO_PICKING_TASKS),
    waves: structuredClone(DEMO_WAVES),
    packages: structuredClone(DEMO_PACKAGES),
    pallets: structuredClone(DEMO_PALLETS),
    shipments: structuredClone(DEMO_SHIPMENTS),
    returns: structuredClone(DEMO_RETURNS),
    movements: [],
    adjustments: [],
    cycleCounts: structuredClone(DEMO_CYCLE_COUNTS),
    asns: structuredClone(DEMO_ASNS),
    activityLogs: structuredClone(DEMO_ACTIVITY_LOGS),
    allocations: structuredClone(DEMO_ALLOCATIONS),
    reservations: structuredClone(DEMO_RESERVATIONS),
    inventoryItems: structuredClone(DEMO_INVENTORY_ITEMS),
    packingStations: structuredClone(DEMO_PACKING_STATIONS),
    meta: { lastSync: null },
  };
}

// v5: bumped to include packing stations in the seed
const STORAGE_KEY = 'orus-wms-mock-db-v5';
type Listener = () => void;

class WmsDatabaseStore {
  private data: WmsDatabase = freshDatabase();
  private listeners = new Set<Listener>();
  private hydrated = false;

  getSnapshot = (): WmsDatabase => this.data;

  hydrateFromStorage() {
    if (this.hydrated || typeof window === 'undefined') return;
    this.hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WmsDatabase>;
        this.data = { ...freshDatabase(), ...parsed };
        this.emit();
      }
    } catch {
      // ignore corrupt storage
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // storage full/unavailable - continue in-memory only
    }
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // Clones before mutating so every nested array/object gets a fresh
  // reference on every change - React selectors keyed on entity arrays
  // rely on reference identity to detect updates.
  mutate(fn: (draft: WmsDatabase) => void) {
    const draft = structuredClone(this.data);
    fn(draft);
    this.data = draft;
    this.persist();
    this.emit();
  }

  resetDemoData() {
    this.data = freshDatabase();
    this.persist();
    this.emit();
  }
}

export const wmsDb = new WmsDatabaseStore();
