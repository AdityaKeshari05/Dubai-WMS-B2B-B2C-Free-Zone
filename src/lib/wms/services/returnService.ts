import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import { inventoryService } from '../inventoryService';
import type { ReturnItem, ReturnRequest } from '@/types';
import type { OrderType } from './allocationService';

// TODO(api): swap bodies for /wms/returns once the backend exists.
export const returnService = {
  createReturn(params: { orderId: string; orderType: OrderType; customerName: string; items: ReturnItem[] }): ReturnRequest {
    const state = wmsDb.getSnapshot();
    if (params.orderType === 'b2c') {
      const order = state.b2cOrders.find((o) => o.id === params.orderId);
      if (!order || order.fulfillmentStatus !== 'delivered') throw new Error('Customer returns can only be requested for delivered orders.');
      for (const line of params.items) {
        const orderItem = order.items.find((item) => item.productId === line.productId);
        if (!orderItem || line.quantity <= 0 || line.quantity > orderItem.quantity) throw new Error('Return quantity must be positive and cannot exceed the ordered quantity.');
      }
    }
    const order = params.orderType === 'b2c' ? state.b2cOrders.find((o) => o.id === params.orderId) : undefined;
    const linkedItems = params.items.map((line) => ({
      ...line,
      orderItemId: line.orderItemId ?? order?.items.find((item) => item.productId === line.productId)?.id,
    }));
    const now = new Date().toISOString();
    const ret: ReturnRequest = {
      id: nextId('ret'),
      returnNumber: nextSequence('RET', state.returns.length + 1),
      orderId: params.orderId,
      orderType: params.orderType,
      customerName: params.customerName,
      items: linkedItems,
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
        inventoryService.restock({
          productId: item.productId,
          warehouseId,
          locationId: returnsLocationId,
          quantity: item.quantity,
          referenceLabel: `Return ${ret.returnNumber} restocked`,
        });
      }
    } else if (status === 'damaged') {
      for (const item of ret.items) {
        inventoryService.restock({
          productId: item.productId,
          warehouseId,
          locationId: returnsLocationId,
          quantity: item.quantity,
          referenceLabel: `Return ${ret.returnNumber} received damaged`,
        });
        inventoryService.markDamaged({
          productId: item.productId,
          warehouseId,
          locationId: returnsLocationId,
          quantity: item.quantity,
          reason: `Return ${ret.returnNumber} inspected as damaged`,
        });
      }
    }

    wmsDb.mutate((draft) => {
      const target = draft.returns.find((r) => r.id === returnId);
      if (target) {
        target.status = status;
        target.updatedAt = new Date().toISOString();
        if ((status === 'restocked' || status === 'damaged') && target.orderType === 'b2c') {
          const order = draft.b2cOrders.find((o) => o.id === target.orderId);
          if (order) { order.fulfillmentStatus = 'returned'; order.updatedAt = target.updatedAt; }
        }
      }
    });
    logWmsActivity('return', returnId, 'status', `Return moved to ${status}`);
  },
};
