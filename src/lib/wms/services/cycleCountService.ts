import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import { inventoryService } from './inventoryService';
import { locationService } from './locationService';
import type { CycleCount, CycleCountLine } from '@/types';

// A zone-level WMS cycle count, distinct from the ERP's existing
// /inventory/reconciliations (which reconciles a whole warehouse against the
// backend's ledger). `expectedQtyByProductId` comes from the caller's real
// `/inventory/products` fetch.
// TODO(api): swap bodies for /wms/cycle-counts once the backend exists.
export const cycleCountService = {
  createSession(params: {
    warehouseId: string;
    zone?: string;
    assignedUser: string;
    countDate: string;
    productIds: string[];
    expectedQtyByProductId: Record<string, number>;
  }): CycleCount {
    const state = wmsDb.getSnapshot();
    const defaultBin = locationService.ensureDefaultBin(params.warehouseId);
    const lines: CycleCountLine[] = params.productIds.map((productId) => ({
      id: nextId('ccl'),
      productId,
      locationId: defaultBin.id,
      expectedQty: params.expectedQtyByProductId[productId] ?? 0,
      countedQty: null,
      status: 'pending',
    }));

    const session: CycleCount = {
      id: nextId('cc'),
      countNumber: nextSequence('CC', state.cycleCounts.length + 1),
      warehouseId: params.warehouseId,
      zone: params.zone,
      assignedUser: params.assignedUser,
      countDate: params.countDate,
      status: 'draft',
      lines,
      createdAt: new Date().toISOString(),
    };

    wmsDb.mutate((draft) => {
      draft.cycleCounts.push(session);
    });
    logWmsActivity('cycle_count', session.id, 'create', `Cycle count ${session.countNumber} created with ${lines.length} line(s)`);
    return session;
  },

  enterCount(sessionId: string, lineId: string, countedQty: number) {
    wmsDb.mutate((draft) => {
      const session = draft.cycleCounts.find((c) => c.id === sessionId);
      const line = session?.lines.find((l) => l.id === lineId);
      if (!session || !line) return;
      line.countedQty = countedQty;
      const diff = countedQty - line.expectedQty;
      line.status = diff === 0 ? 'match' : diff > 0 ? 'excess' : 'shortage';
      if (session.status === 'draft') session.status = 'in_progress';
    });
  },

  markCompleted(sessionId: string) {
    wmsDb.mutate((draft) => {
      const session = draft.cycleCounts.find((c) => c.id === sessionId);
      if (session) session.status = 'completed';
    });
  },

  applyReconciliation(sessionId: string) {
    const state = wmsDb.getSnapshot();
    const session = state.cycleCounts.find((c) => c.id === sessionId);
    if (!session) throw new Error('Cycle count not found');

    for (const line of session.lines) {
      if (line.countedQty === null) continue;
      const diff = line.countedQty - line.expectedQty;
      if (diff !== 0) {
        inventoryService.recordMovement({
          type: 'reconciliation',
          productId: line.productId,
          toLocationId: diff > 0 ? line.locationId : undefined,
          fromLocationId: diff < 0 ? line.locationId : undefined,
          quantity: Math.abs(diff),
          referenceLabel: `Cycle count ${session.countNumber}`,
        });
      }
    }

    wmsDb.mutate((draft) => {
      const target = draft.cycleCounts.find((c) => c.id === sessionId);
      if (target) target.status = 'reconciled';
    });
    logWmsActivity('cycle_count', sessionId, 'reconcile', `Cycle count ${session.countNumber} reconciled`);
  },
};
