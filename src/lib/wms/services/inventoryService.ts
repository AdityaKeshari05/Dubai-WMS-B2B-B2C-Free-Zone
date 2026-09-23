import { wmsDb } from '../db';
import { nextId } from '../id';
import { logWmsActivity } from '../activityLog';
import type { AllocationStrategy, Batch } from '@/types';

// Physical stock quantity is owned by the real backend
// (GET /inventory/products -> product.stockLevels[].quantity). This service
// only tracks the part that has no backend endpoint yet: how much of that
// real physical quantity is currently reserved against WMS orders, plus the
// lightweight FIFO/FEFO batch records used to decide *which* units to
// reserve. When a real allocation endpoint exists, `reserve`/`release` below
// become the only functions that need to change.
function reservationKey(productId: string, warehouseId: string) {
  return `${productId}:${warehouseId}`;
}

export const inventoryService = {
  getReservedQty(productId: string, warehouseId: string): number {
    return wmsDb.getSnapshot().reservations[reservationKey(productId, warehouseId)] ?? 0;
  },

  getAvailableQty(productId: string, warehouseId: string, physicalQty: number): number {
    return Math.max(0, physicalQty - this.getReservedQty(productId, warehouseId));
  },

  listBatches(productId: string): Batch[] {
    return wmsDb.getSnapshot().batches.filter((b) => b.productId === productId);
  },

  createBatch(params: { productId: string; batchNumber: string; mfgDate: string; expiryDate: string }): Batch {
    const batch: Batch = {
      id: nextId('batch'),
      batchNumber: params.batchNumber,
      productId: params.productId,
      mfgDate: params.mfgDate,
      expiryDate: params.expiryDate,
      status: new Date(params.expiryDate) < new Date() ? 'expired' : 'active',
    };
    wmsDb.mutate((draft) => {
      draft.batches.push(batch);
    });
    return batch;
  },

  // Reserves up to `quantity` units of a product at a warehouse, given the
  // real physical quantity currently on hand. Returns how much was actually
  // reserved (may be less than requested if not enough stock is available).
  reserve(params: {
    productId: string;
    warehouseId: string;
    quantity: number;
    physicalQty: number;
    strategy?: AllocationStrategy;
  }): { reservedQty: number; backorderQty: number; batchIds: string[] } {
    const available = this.getAvailableQty(params.productId, params.warehouseId, params.physicalQty);
    const reservedQty = Math.min(available, params.quantity);
    const backorderQty = params.quantity - reservedQty;

    const batches = this.listBatches(params.productId).filter((b) => b.status !== 'expired');
    const strategy = params.strategy ?? 'FEFO';
    const sorted = [...batches].sort((a, b) =>
      strategy === 'FEFO' ? a.expiryDate.localeCompare(b.expiryDate) : a.mfgDate.localeCompare(b.mfgDate)
    );

    if (reservedQty > 0) {
      wmsDb.mutate((draft) => {
        const key = reservationKey(params.productId, params.warehouseId);
        draft.reservations[key] = (draft.reservations[key] ?? 0) + reservedQty;
      });
    }

    return { reservedQty, backorderQty, batchIds: sorted.slice(0, 1).map((b) => b.id) };
  },

  release(productId: string, warehouseId: string, quantity: number) {
    wmsDb.mutate((draft) => {
      const key = reservationKey(productId, warehouseId);
      draft.reservations[key] = Math.max(0, (draft.reservations[key] ?? 0) - quantity);
    });
  },

  // Called when a pick is confirmed: the units leave the reserved pool and
  // (once a real stock-movement endpoint exists) should also decrement the
  // backend's physical quantity - tracked here as a movement for now so the
  // audit trail / history views have something to show.
  consumeForPick(params: {
    productId: string;
    warehouseId: string;
    locationId: string;
    batchId?: string;
    pickedQty: number;
    expectedQty: number;
    referenceId: string;
    referenceLabel: string;
  }) {
    this.release(params.productId, params.warehouseId, params.expectedQty);
    if (params.pickedQty > 0) {
      wmsDb.mutate((draft) => {
        draft.movements.unshift({
          id: nextId('mv'),
          type: 'pick',
          productId: params.productId,
          fromLocationId: params.locationId,
          quantity: params.pickedQty,
          batchId: params.batchId,
          referenceId: params.referenceId,
          referenceLabel: params.referenceLabel,
          createdAt: new Date().toISOString(),
          createdBy: 'wms',
        });
      });
    }
  },

  recordMovement(params: {
    type: 'return' | 'damage' | 'reconciliation' | 'receipt' | 'adjustment' | 'transfer';
    productId: string;
    fromLocationId?: string;
    toLocationId?: string;
    quantity: number;
    batchId?: string;
    reason?: string;
    referenceLabel?: string;
  }) {
    wmsDb.mutate((draft) => {
      draft.movements.unshift({
        id: nextId('mv'),
        createdAt: new Date().toISOString(),
        createdBy: 'wms',
        ...params,
      });
    });
    logWmsActivity('inventory', params.productId, params.type, params.referenceLabel ?? params.reason ?? params.type);
  },
};
