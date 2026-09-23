'use client';

import { useMemo } from "react";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import { useWmsLookups } from "@/lib/wms/useLookups";
import type { WmsInventoryItem, Product, WarehouseLocation, Batch, Warehouse } from "@/types";

export interface InventoryRow {
  item: WmsInventoryItem;
  product: Product;
  warehouse: Warehouse;
  location: WarehouseLocation;
  batch?: Batch;
  availableQty: number;
  stockState: "in_stock" | "low_stock" | "out_of_stock" | "damaged";
}

export const LOW_STOCK_THRESHOLD = 10;

export function availableQty(item: WmsInventoryItem): number {
  return Math.max(0, item.physicalQty - item.reservedQty - item.damagedQty);
}

export function useInventoryRows() {
  const items = useWmsDbSelector((s) => s.inventoryItems);
  const locations = useWmsDbSelector((s) => s.locations);
  const batches = useWmsDbSelector((s) => s.batches);
  const { products, warehouses } = useWmsLookups();
  
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const warehouseMap = useMemo(() => new Map(warehouses.map(w => [w.id, w])), [warehouses]);
  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);
  const batchMap = useMemo(() => new Map(batches.map(b => [b.id, b])), [batches]);

  return useMemo<InventoryRow[]>(() => {
    const rows: InventoryRow[] = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      const warehouse = warehouseMap.get(item.warehouseId);
      const location = locationMap.get(item.locationId);
      if (!product || !warehouse || !location) continue;
      const batch = item.batchId ? batchMap.get(item.batchId) : undefined;
      const available = availableQty(item);
      const stockState: InventoryRow["stockState"] =
        item.damagedQty > 0 && item.physicalQty - item.damagedQty <= 0
          ? "damaged"
          : available <= 0
            ? "out_of_stock"
            : available < LOW_STOCK_THRESHOLD
              ? "low_stock"
              : "in_stock";
      rows.push({ item, product, warehouse, location, batch, availableQty: available, stockState });
    }
    return rows.sort((a, b) => a.product.name.localeCompare(b.product.name));
  }, [items, productMap, warehouseMap, locationMap, batchMap]);
}

export function useInventoryStats() {
  const rows = useInventoryRows();
  return useMemo(() => {
    const totalSkus = new Set(rows.map((r) => r.product.id)).size;
    const totalUnits = rows.reduce((sum, r) => sum + r.item.physicalQty, 0);
    const available = rows.reduce((sum, r) => sum + r.availableQty, 0);
    const reserved = rows.reduce((sum, r) => sum + r.item.reservedQty, 0);
    const damaged = rows.reduce((sum, r) => sum + r.item.damagedQty, 0);
    const lowStock = rows.filter((r) => r.stockState === "low_stock" || r.stockState === "out_of_stock").length;
    return { totalSkus, totalUnits, available, reserved, damaged, lowStock };
  }, [rows]);
}
