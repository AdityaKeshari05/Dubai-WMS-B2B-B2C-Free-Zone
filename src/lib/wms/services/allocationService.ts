import { wmsDb } from '../db';
import { nextId } from '../id';
import { logWmsActivity } from '../activityLog';
import { inventoryService } from './inventoryService';
import type { AllocationStrategy, B2BOrder, B2COrder } from '@/types';

export type OrderType = 'b2b' | 'b2c';

// Shared by both B2B and B2C so the reservation logic never diverges between
// the two flows. `physicalQtyByProductId` is supplied by the caller (fetched
// from the real `/inventory/products` endpoint) since this module has no
// access to the API client's auth/tenant context on its own.
export const allocationService = {
  allocateOrder(
    orderId: string,
    orderType: OrderType,
    physicalQtyByProductId: Record<string, number>,
    strategy: AllocationStrategy = 'FEFO'
  ) {
    const state = wmsDb.getSnapshot();
    const order =
      orderType === 'b2b'
        ? state.b2bOrders.find((o) => o.id === orderId)
        : state.b2cOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const results = order.items.map((item) => {
      const remaining = item.quantity - item.allocatedQty;
      if (remaining <= 0) {
        return { itemId: item.id, productId: item.productId, allocatedQty: item.allocatedQty, backorderQty: 0, batchIds: [] as string[] };
      }
      const physicalQty = physicalQtyByProductId[item.productId] ?? 0;
      const result = inventoryService.reserve({
        productId: item.productId,
        warehouseId: order.warehouseId,
        quantity: remaining,
        physicalQty,
        strategy,
      });
      return {
        itemId: item.id,
        productId: item.productId,
        allocatedQty: item.allocatedQty + result.reservedQty,
        backorderQty: result.backorderQty,
        batchIds: result.batchIds,
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
          batchAllocations: r.batchIds.map((batchId) => ({ batchId, locationId: '', qty: item.allocatedQty })),
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
  },
};
