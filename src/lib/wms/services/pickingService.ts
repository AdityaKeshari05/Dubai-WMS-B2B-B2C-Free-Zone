import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import { inventoryService } from '../inventoryService';
import type { PickingItem, PickingTask, B2BOrder, B2COrder, PickExceptionType } from '@/types';
import type { OrderType } from './allocationService';

// TODO(api): swap bodies for /wms/picking-tasks once the backend exists.
export const pickingService = {
  createTaskFromOrder(
    orderId: string,
    orderType: OrderType,
    opts: {
      warehouseId: string;
      zone?: string;
      priority?: PickingTask['priority'];
      picker?: string;
      dueTime?: string;
      waveId?: string;
      type?: PickingTask['type'];
    }
  ): PickingTask {
    const state = wmsDb.getSnapshot();
    const order =
      orderType === 'b2b'
        ? state.b2bOrders.find((o) => o.id === orderId)
        : state.b2cOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const allocations = state.allocations.filter((a) => a.orderId === orderId && a.orderType === orderType);
    if (allocations.length === 0) throw new Error('Allocate the order before creating a picking task.');

    const existingProductIds = new Set(
      state.pickingTasks
        .filter((t) => t.orderId === orderId && t.orderType === orderType)
        .flatMap((t) => t.items.map((i) => i.productId))
    );

    // One PickingItem per bin/batch an allocation actually drew from, so the
    // picker is sent to the real location instead of a generic default bin.
    const items: PickingItem[] = [];
    for (const alloc of allocations) {
      if (existingProductIds.has(alloc.productId) || alloc.allocatedQty <= 0) continue;
      for (const ba of alloc.batchAllocations) {
        if (ba.qty <= 0) continue;
        items.push({
          id: nextId('pki'),
          productId: alloc.productId,
          locationId: ba.locationId,
          batchId: ba.batchId,
          expectedQty: ba.qty,
          pickedQty: 0,
          status: 'pending',
        });
      }
    }
    if (items.length === 0) throw new Error('No newly allocated stock available to pick for this order.');

    const now = new Date().toISOString();
    const task: PickingTask = {
      id: nextId('pt'),
      taskNumber: nextSequence('PT', state.pickingTasks.length + 1),
      orderId,
      orderType,
      orderNumber: order.orderNumber,
      type: opts.type ?? 'single',
      warehouseId: opts.warehouseId,
      zone: opts.zone,
      picker: opts.picker,
      priority: opts.priority ?? 'normal',
      status: opts.picker ? 'assigned' : 'pending',
      dueTime: opts.dueTime,
      waveId: opts.waveId,
      items,
      createdAt: now,
      updatedAt: now,
    };

    wmsDb.mutate((draft) => {
      draft.pickingTasks.push(task);
      const list = orderType === 'b2b' ? draft.b2bOrders : draft.b2cOrders;
      const target = list.find((o) => o.id === orderId)! as B2BOrder | B2COrder;
      if (orderType === 'b2b') (target as B2BOrder).status = 'picking';
      else (target as B2COrder).fulfillmentStatus = 'picking';
      target.updatedAt = now;
    });

    logWmsActivity('picking_task', task.id, 'create', `Picking task ${task.taskNumber} created for order ${order.orderNumber}`);
    return task;
  },

  assignPicker(taskId: string, picker: string) {
    wmsDb.mutate((draft) => {
      const task = draft.pickingTasks.find((t) => t.id === taskId);
      if (!task) return;
      task.picker = picker;
      if (task.status === 'pending') task.status = 'assigned';
      task.updatedAt = new Date().toISOString();
    });
    logWmsActivity('picking_task', taskId, 'assign', `Assigned to ${picker}`);
  },

  startTask(taskId: string) {
    wmsDb.mutate((draft) => {
      const task = draft.pickingTasks.find((t) => t.id === taskId);
      if (task) {
        task.status = 'in_progress';
        task.updatedAt = new Date().toISOString();
      }
    });
  },

  confirmPickItem(
    taskId: string,
    itemId: string,
    pickedQty: number,
    exception?: { type: PickExceptionType; notes: string }
  ) {
    const state = wmsDb.getSnapshot();
    const task = state.pickingTasks.find((t) => t.id === taskId);
    const item = task?.items.find((i) => i.id === itemId);
    if (!task || !item) throw new Error('Pick item not found');
    if (item.status === 'picked' || item.status === 'short' || item.status === 'damaged' || item.status === 'wrong_location') {
      throw new Error('This pick line has already been confirmed.');
    }
    if (!Number.isInteger(pickedQty) || pickedQty <= 0 || pickedQty > item.expectedQty) {
      throw new Error(`Pick quantity must be between 1 and ${item.expectedQty}.`);
    }

    inventoryService.consumeForPick({
      productId: item.productId,
      locationId: item.locationId,
      batchId: item.batchId,
      pickedQty,
      expectedQty: item.expectedQty,
      referenceId: task.id,
      referenceLabel: `Picking task ${task.taskNumber}`,
    });

    wmsDb.mutate((draft) => {
      const t = draft.pickingTasks.find((x) => x.id === taskId)!;
      const it = t.items.find((x) => x.id === itemId)!;
      it.pickedQty = pickedQty;
      if (exception) {
        it.status = exception.type === 'shortage' ? 'short' : exception.type === 'damaged' ? 'damaged' : 'wrong_location';
        it.exception = { ...exception, createdAt: new Date().toISOString() };
      } else {
        it.status = pickedQty < it.expectedQty ? 'short' : 'picked';
      }
      t.status = t.items.every((i) => i.status === 'picked')
        ? 'picked'
        : t.items.some((i) => ['short', 'damaged', 'wrong_location'].includes(i.status))
          ? 'exception'
          : 'in_progress';
      t.updatedAt = new Date().toISOString();

      const list = t.orderType === 'b2b' ? draft.b2bOrders : draft.b2cOrders;
      const order = list.find((o) => o.id === t.orderId);
      if (order) {
        const orderItem = order.items.find((oi) => oi.productId === item.productId);
        if (orderItem) orderItem.pickedQty += pickedQty;
        if (t.orderType === 'b2c' && order.items.every((oi) => oi.pickedQty >= oi.allocatedQty && oi.allocatedQty > 0)) {
          (order as B2COrder).fulfillmentStatus = 'packing';
        }
        order.updatedAt = new Date().toISOString();
      }
    });

    if (exception) logWmsActivity('picking_task', taskId, 'exception', `${exception.type.replace('_', ' ')}: ${exception.notes}`);
    else logWmsActivity('picking_task', taskId, 'pick', `Picked ${pickedQty} unit(s)`);
  },

  completeTask(taskId: string) {
    wmsDb.mutate((draft) => {
      const task = draft.pickingTasks.find((t) => t.id === taskId);
      if (task) {
        task.status = 'completed';
        task.updatedAt = new Date().toISOString();
      }
    });
    logWmsActivity('picking_task', taskId, 'complete', 'Picking task marked completed');
  },
};
