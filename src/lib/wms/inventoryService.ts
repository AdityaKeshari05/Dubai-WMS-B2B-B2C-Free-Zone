import { wmsDb as db } from "./db";
import type { WmsInventoryItem, Batch, AllocationStrategy } from "@/types";

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

function logActivity(module: string, entityId: string, action: string, description: string) {
  db.mutate((draft) => {
    draft.activityLogs.unshift({
      id: nextId("log"),
      entityType: module,
      entityId,
      action,
      description,
      actor: "System",
      timestamp: new Date().toISOString(),
    });
  });
}

export function availableQty(item: WmsInventoryItem): number {
  return Math.max(0, item.physicalQty - item.reservedQty - item.damagedQty);
}

function sortForAllocation(
  items: WmsInventoryItem[],
  batches: Batch[],
  strategy: AllocationStrategy
): WmsInventoryItem[] {
  const batchMap = new Map(batches.map((b) => [b.id, b]));
  return [...items].sort((a, b) => {
    const ba = a.batchId ? batchMap.get(a.batchId) : undefined;
    const bb = b.batchId ? batchMap.get(b.batchId) : undefined;
    if (!ba && !bb) return a.updatedAt.localeCompare(b.updatedAt);
    if (!ba) return -1;
    if (!bb) return 1;
    const key = strategy === "FEFO" ? "expiryDate" : "mfgDate";
    return ba[key].localeCompare(bb[key]);
  });
}

function findOrCreateItem(
  draft: ReturnType<typeof db.getSnapshot>,
  params: { productId: string; warehouseId: string; locationId: string; batchId?: string }
): WmsInventoryItem {
  let item = draft.inventoryItems.find(
    (i) =>
      i.productId === params.productId &&
      i.warehouseId === params.warehouseId &&
      i.locationId === params.locationId &&
      i.batchId === params.batchId
  );
  if (!item) {
    item = {
      id: nextId("inv"),
      productId: params.productId,
      warehouseId: params.warehouseId,
      locationId: params.locationId,
      batchId: params.batchId,
      physicalQty: 0,
      reservedQty: 0,
      damagedQty: 0,
      updatedAt: new Date().toISOString(),
    };
    draft.inventoryItems.push(item);
  }
  return item;
}

export const inventoryService = {
  list() {
    return db.getSnapshot().inventoryItems;
  },

  getByProduct(productId: string, warehouseId?: string) {
    return db
      .getSnapshot()
      .inventoryItems.filter(
        (i) => i.productId === productId && (!warehouseId || i.warehouseId === warehouseId)
      );
  },

  availableForProduct(productId: string, warehouseId?: string) {
    return this.getByProduct(productId, warehouseId).reduce(
      (sum, i) => sum + availableQty(i),
      0
    );
  },

  previewAllocationBatches(productId: string, warehouseId: string, quantity: number, strategy: AllocationStrategy) {
    const state = db.getSnapshot();
    const items = sortForAllocation(
      state.inventoryItems.filter(
        (i) => i.productId === productId && i.warehouseId === warehouseId && availableQty(i) > 0
      ),
      state.batches,
      strategy
    );
    let remaining = quantity;
    const plan: { item: WmsInventoryItem; batch?: Batch; take: number }[] = [];
    for (const item of items) {
      if (remaining <= 0) break;
      const take = Math.min(availableQty(item), remaining);
      if (take <= 0) continue;
      plan.push({
        item,
        batch: item.batchId ? state.batches.find((b) => b.id === item.batchId) : undefined,
        take,
      });
      remaining -= take;
    }
    return { plan, unallocated: remaining };
  },

  reserveStock(params: {
    productId: string;
    warehouseId: string;
    quantity: number;
    strategy?: AllocationStrategy;
  }) {
    const { productId, warehouseId, quantity, strategy = "FEFO" } = params;
    let remaining = quantity;
    const batchAllocations: { batchId?: string; locationId: string; qty: number }[] = [];

    db.mutate((draft) => {
      const items = sortForAllocation(
        draft.inventoryItems.filter(
          (i) => i.productId === productId && i.warehouseId === warehouseId && availableQty(i) > 0
        ),
        draft.batches,
        strategy
      );
      for (const sorted of items) {
        if (remaining <= 0) break;
        const item = draft.inventoryItems.find((i) => i.id === sorted.id)!;
        const take = Math.min(availableQty(item), remaining);
        if (take <= 0) continue;
        item.reservedQty += take;
        item.updatedAt = new Date().toISOString();
        remaining -= take;
        batchAllocations.push({ batchId: item.batchId, locationId: item.locationId, qty: take });
      }
    });

    return {
      allocatedQty: quantity - remaining,
      backorderQty: remaining,
      batchAllocations,
    };
  },

  releaseStock(params: { productId: string; warehouseId: string; quantity: number }) {
    let remaining = params.quantity;
    db.mutate((draft) => {
      const items = draft.inventoryItems.filter(
        (i) => i.productId === params.productId && i.warehouseId === params.warehouseId && i.reservedQty > 0
      );
      for (const item of items) {
        if (remaining <= 0) break;
        const take = Math.min(item.reservedQty, remaining);
        item.reservedQty -= take;
        item.updatedAt = new Date().toISOString();
        remaining -= take;
      }
    });
  },

  consumeForPick(params: {
    productId: string;
    locationId: string;
    batchId?: string;
    pickedQty: number;
    expectedQty: number;
    referenceId: string;
    referenceLabel: string;
  }) {
    db.mutate((draft) => {
      const item = draft.inventoryItems.find(
        (i) =>
          i.productId === params.productId &&
          i.locationId === params.locationId &&
          i.batchId === params.batchId
      );
      if (!item) return;
      item.physicalQty = Math.max(0, item.physicalQty - params.pickedQty);
      item.reservedQty = Math.max(0, item.reservedQty - params.expectedQty);
      item.updatedAt = new Date().toISOString();
      if (params.pickedQty > 0) {
        draft.movements.unshift({
          id: nextId("mv"),
          type: "pick",
          productId: params.productId,
          fromLocationId: params.locationId,
          quantity: params.pickedQty,
          batchId: params.batchId,
          referenceId: params.referenceId,
          referenceLabel: params.referenceLabel,
          createdAt: new Date().toISOString(),
          createdBy: "System",
        });
      }
    });
  },

  transferStock(params: {
    productId: string;
    fromWarehouseId: string;
    fromLocationId: string;
    toWarehouseId: string;
    toLocationId: string;
    batchId?: string;
    quantity: number;
    reason: string;
  }) {
    const state = db.getSnapshot();
    const source = state.inventoryItems.find(
      (i) =>
        i.productId === params.productId &&
        i.warehouseId === params.fromWarehouseId &&
        i.locationId === params.fromLocationId &&
        i.batchId === params.batchId
    );
    if (!source || availableQty(source) < params.quantity) {
      throw new Error("Not enough available stock at the source location for this transfer.");
    }

    db.mutate((draft) => {
      const src = draft.inventoryItems.find((i) => i.id === source.id)!;
      src.physicalQty -= params.quantity;
      src.updatedAt = new Date().toISOString();

      const dest = findOrCreateItem(draft, {
        productId: params.productId,
        warehouseId: params.toWarehouseId,
        locationId: params.toLocationId,
        batchId: params.batchId,
      });
      dest.physicalQty += params.quantity;
      dest.updatedAt = new Date().toISOString();

      draft.movements.unshift({
        id: nextId("mv"),
        type: "transfer",
        productId: params.productId,
        fromLocationId: params.fromLocationId,
        toLocationId: params.toLocationId,
        quantity: params.quantity,
        batchId: params.batchId,
        reason: params.reason,
        createdAt: new Date().toISOString(),
        createdBy: "System",
      });
    });

    logActivity("inventory", params.productId, "transfer", `Transferred ${params.quantity} units`);
  },

  adjustStock(params: {
    productId: string;
    warehouseId: string;
    locationId: string;
    batchId?: string;
    type: "increase" | "decrease";
    quantity: number;
    reason: string;
    notes?: string;
  }) {
    if (params.type === "decrease") {
      const item = db
        .getSnapshot()
        .inventoryItems.find(
          (i) =>
            i.productId === params.productId &&
            i.warehouseId === params.warehouseId &&
            i.locationId === params.locationId &&
            i.batchId === params.batchId
        );
      if (!item || item.physicalQty < params.quantity) {
        throw new Error("Cannot decrease below zero physical stock.");
      }
    }

    db.mutate((draft) => {
      const item = findOrCreateItem(draft, params);
      item.physicalQty +=
        params.type === "increase" ? params.quantity : -params.quantity;
      item.updatedAt = new Date().toISOString();

      draft.adjustments.unshift({
        id: nextId("adj"),
        productId: params.productId,
        warehouseId: params.warehouseId,
        locationId: params.locationId,
        batchId: params.batchId,
        type: params.type,
        quantity: params.quantity,
        reason: params.reason,
        notes: params.notes,
        createdAt: new Date().toISOString(),
        createdBy: "System",
      });

      draft.movements.unshift({
        id: nextId("mv"),
        type: "adjustment",
        productId: params.productId,
        toLocationId: params.type === "increase" ? params.locationId : undefined,
        fromLocationId: params.type === "decrease" ? params.locationId : undefined,
        quantity: params.quantity,
        batchId: params.batchId,
        reason: params.reason,
        createdAt: new Date().toISOString(),
        createdBy: "System",
      });
    });

    logActivity("inventory", params.productId, "adjust", `Stock ${params.type}d by ${params.quantity}`);
  },

  markDamaged(params: {
    productId: string;
    warehouseId: string;
    locationId: string;
    batchId?: string;
    quantity: number;
    reason: string;
  }) {
    const item = db
      .getSnapshot()
      .inventoryItems.find(
        (i) =>
          i.productId === params.productId &&
          i.warehouseId === params.warehouseId &&
          i.locationId === params.locationId &&
          i.batchId === params.batchId
      );
    if (!item || item.physicalQty - item.damagedQty < params.quantity) {
      throw new Error("Not enough good stock at this location to mark as damaged.");
    }

    db.mutate((draft) => {
      const target = draft.inventoryItems.find((i) => i.id === item.id)!;
      target.damagedQty += params.quantity;
      target.updatedAt = new Date().toISOString();

      draft.movements.unshift({
        id: nextId("mv"),
        type: "damage",
        productId: params.productId,
        fromLocationId: params.locationId,
        quantity: params.quantity,
        batchId: params.batchId,
        reason: params.reason,
        createdAt: new Date().toISOString(),
        createdBy: "System",
      });
    });

    logActivity("inventory", params.productId, "damage", `Marked ${params.quantity} units damaged`);
  },

  restock(params: {
    productId: string;
    warehouseId: string;
    locationId: string;
    batchId?: string;
    quantity: number;
    referenceLabel: string;
  }) {
    db.mutate((draft) => {
      const item = findOrCreateItem(draft, params);
      item.physicalQty += params.quantity;
      item.updatedAt = new Date().toISOString();

      draft.movements.unshift({
        id: nextId("mv"),
        type: "return",
        productId: params.productId,
        toLocationId: params.locationId,
        quantity: params.quantity,
        batchId: params.batchId,
        referenceLabel: params.referenceLabel,
        createdAt: new Date().toISOString(),
        createdBy: "System",
      });
    });
  },

  applyCycleCountLine(cycleCountId: string, lineId: string) {
    db.mutate((draft) => {
      const count = draft.cycleCounts.find((c) => c.id === cycleCountId);
      const line = count?.lines.find((l) => l.id === lineId);
      if (!count || !line || line.countedQty === null) return;

      const item = findOrCreateItem(draft, {
        productId: line.productId,
        warehouseId: count.warehouseId,
        locationId: line.locationId,
        batchId: line.batchId,
      });
      const diff = line.countedQty - line.expectedQty;
      item.physicalQty = line.countedQty;
      item.updatedAt = new Date().toISOString();

      if (diff !== 0) {
        draft.movements.unshift({
          id: nextId("mv"),
          type: "reconciliation",
          productId: line.productId,
          toLocationId: diff > 0 ? line.locationId : undefined,
          fromLocationId: diff < 0 ? line.locationId : undefined,
          quantity: Math.abs(diff),
          batchId: line.batchId,
          referenceId: count.id,
          referenceLabel: `Cycle count ${count.countNumber}`,
          createdAt: new Date().toISOString(),
          createdBy: "System",
        });
      }
    });
  },
};
