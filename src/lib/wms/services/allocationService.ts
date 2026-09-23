import { wmsDb } from '../db';
import { nextId } from '../id';
import { logWmsActivity } from '../activityLog';
import { inventoryService } from '../inventoryService';
import { pickingService } from './pickingService';
import type { AllocationStrategy, B2BOrder, B2COrder } from '@/types';

export type OrderType = 'b2b' | 'b2c';

// Shared by both B2B and B2C so the reservation logic never diverges between
// the two flows. Reserves against the same local inventory ledger
// (src/lib/wms/inventoryService.ts) the M05 Inventory Control screens use,
// so allocating an order and adjusting/transferring stock always agree on
// the same numbers.
export const allocationService = {
  allocateOrder(orderId: string, orderType: OrderType, strategy: AllocationStrategy = 'FEFO') {
    const state = wmsDb.getSnapshot();
    const order =
      orderType === 'b2b'
        ? state.b2bOrders.find((o) => o.id === orderId)
        : state.b2cOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const results = order.items.map((item) => {
      const remaining = item.quantity - item.allocatedQty;
      if (remaining <= 0) {
        return { itemId: item.id, productId: item.productId, allocatedQty: item.allocatedQty, backorderQty: 0, batchAllocations: [] as { batchId?: string; locationId: string; qty: number }[] };
      }
      const result = inventoryService.reserveStock({
        productId: item.productId,
        warehouseId: order.warehouseId,
        quantity: remaining,
        strategy,
      });
      return {
        itemId: item.id,
        productId: item.productId,
        allocatedQty: item.allocatedQty + result.allocatedQty,
        backorderQty: result.backorderQty,
        batchAllocations: result.batchAllocations,
      };
    });

    wmsDb.mutate((draft) => {
      const list = orderType === 'b2b' ? draft.b2bOrders : draft.b2cOrders;
      const target = list.find((o) => o.id === orderId)! as B2BOrder | B2COrder;
      let allFulfilled = true;
      let anyAllocated = false;

      for (const r of results) {
        const item = target.items.find((i) => i.id === r.itemId)!;
        item.allocatedQty = r.allocatedQty;
        item.backorderQty = r.backorderQty;
        if (item.allocatedQty > 0) anyAllocated = true;
        if (item.backorderQty > 0) allFulfilled = false;

        draft.allocations.push({
          id: nextId('alloc'),
          orderId,
          orderType,
          productId: r.productId,
          requestedQty: item.quantity,
          allocatedQty: item.allocatedQty,
          backorderQty: item.backorderQty,
          strategy,
          batchAllocations: r.batchAllocations,
          createdAt: new Date().toISOString(),
        });
      }

      target.updatedAt = new Date().toISOString();
      if (orderType === 'b2b') {
        (target as B2BOrder).status = allFulfilled ? 'allocated' : anyAllocated ? 'partially_fulfilled' : 'backordered';
      } else {
        (target as B2COrder).fulfillmentStatus = 'allocated';
      }
    });

    logWmsActivity(orderType === 'b2b' ? 'b2b_order' : 'b2c_order', orderId, 'allocate', `Inventory allocated using ${strategy} strategy`);

    // Picking tasks are generated automatically once allocation reserves
    // real stock, instead of requiring a separate manual button.
    if (results.some((r) => r.allocatedQty > 0)) {
      try {
        const priority = orderType === 'b2b' ? (order as B2BOrder).priority : 'normal';
        pickingService.createTaskFromOrder(orderId, orderType, { warehouseId: order.warehouseId, priority });
      } catch {
        // Nothing newly pickable (e.g. re-allocating an order with no
        // change) - the manual "Create Picking Task" action stays available.
      }
    }
  },
};
