import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import { inventoryService } from './inventoryService';
import type { ReturnItem, ReturnRequest } from '@/types';
import type { OrderType } from './allocationService';

// TODO(api): swap bodies for /wms/returns once the backend exists.
export const returnService = {
  createReturn(params: { orderId: string; orderType: OrderType; customerName: string; items: ReturnItem[] }): ReturnRequest {
    const state = wmsDb.getSnapshot();
    const now = new Date().toISOString();
    const ret: ReturnRequest = {
      id: nextId('ret'),
      returnNumber: nextSequence('RET', state.returns.length + 1),
      orderId: params.orderId,
      orderType: params.orderType,
      customerName: params.customerName,
      items: params.items,
      status: 'requested',
      createdAt: now,
      updatedAt: now,
    };
    wmsDb.mutate((draft) => {
      draft.returns.push(ret);
    });
    logWmsActivity('return', ret.id, 'create', `Return ${ret.returnNumber} requested for ${params.customerName}`);
    return ret;
  },

  advance(returnId: string, status: ReturnRequest['status'], warehouseId: string, returnsLocationId: string) {
    const state = wmsDb.getSnapshot();
    const ret = state.returns.find((r) => r.id === returnId);
    if (!ret) throw new Error('Return not found');

    if (status === 'restocked') {
      for (const item of ret.items) {
        inventoryService.recordMovement({
          type: 'return',
          productId: item.productId,
          toLocationId: returnsLocationId,
          quantity: item.quantity,
          referenceLabel: `Return ${ret.returnNumber} restocked`,
        });
      }
    } else if (status === 'damaged') {
      for (const item of ret.items) {
        inventoryService.recordMovement({
          type: 'damage',
          productId: item.productId,
          toLocationId: returnsLocationId,
          quantity: item.quantity,
          referenceLabel: `Return ${ret.returnNumber} received damaged`,
        });
      }
    }

    wmsDb.mutate((draft) => {
      const target = draft.returns.find((r) => r.id === returnId);
      if (target) {
        target.status = status;
        target.updatedAt = new Date().toISOString();
      }
    });
    logWmsActivity('return', returnId, 'status', `Return moved to ${status}`);
  },
};
