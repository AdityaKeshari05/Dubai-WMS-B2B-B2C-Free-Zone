import { wmsDb } from '../db';
import { nextId } from '../id';
import type { WarehouseLocation } from '@/types';

// Bins are WMS-only (the real Warehouse record has no bin/zone concept yet),
// so they're created on demand against a real warehouseId the first time
// something needs to be put away there, instead of requiring a seed step.
export const locationService = {
  listForWarehouse(warehouseId: string): WarehouseLocation[] {
    return wmsDb.getSnapshot().locations.filter((l) => l.warehouseId === warehouseId);
  },

  ensureDefaultBin(warehouseId: string): WarehouseLocation {
    const existing = wmsDb
      .getSnapshot()
      .locations.find((l) => l.warehouseId === warehouseId && l.code === 'MAIN');
    if (existing) return existing;

    const location: WarehouseLocation = {
      id: nextId('loc'),
      code: 'MAIN',
      warehouseId,
      zone: 'A',
      type: 'bin',
    };
    wmsDb.mutate((draft) => {
      draft.locations.push(location);
    });
    return location;
  },

  createBin(warehouseId: string, code: string, zone: string, type: WarehouseLocation['type'] = 'bin'): WarehouseLocation {
    const location: WarehouseLocation = { id: nextId('loc'), code, warehouseId, zone, type };
    wmsDb.mutate((draft) => {
      draft.locations.push(location);
    });
    return location;
  },
};
