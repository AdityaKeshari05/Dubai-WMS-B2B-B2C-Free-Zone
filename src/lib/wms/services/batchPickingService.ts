import type { PickingTask } from '@/types';
import { pickingService } from './pickingService';

export interface BatchPickGroup {
  productId: string;
  totalExpectedQty: number;
  totalPickedQty: number;
  taskItems: { taskId: string; itemId: string; orderNumber: string; expectedQty: number; pickedQty: number }[];
}

export const batchPickingService = {
  // Creates one picking task per order (so per-order inventory/order state
  // stays correct) but returns them together so the UI can present a single
  // "pick N of product X, distribute across orders" screen.
  createBatchForOrders(orderIds: string[], warehouseId: string, zone?: string): PickingTask[] {
    const tasks: PickingTask[] = [];
    for (const orderId of orderIds) {
      const task = pickingService.createTaskFromOrder(orderId, 'b2c', { warehouseId, zone, type: 'batch' });
      tasks.push(task);
    }
    return tasks;
  },

  groupByProduct(tasks: PickingTask[]): BatchPickGroup[] {
    const groups = new Map<string, BatchPickGroup>();
    for (const task of tasks) {
      for (const item of task.items) {
        if (!groups.has(item.productId)) {
          groups.set(item.productId, { productId: item.productId, totalExpectedQty: 0, totalPickedQty: 0, taskItems: [] });
        }
        const group = groups.get(item.productId)!;
        group.totalExpectedQty += item.expectedQty;
        group.totalPickedQty += item.pickedQty;
        group.taskItems.push({ taskId: task.id, itemId: item.id, orderNumber: task.orderNumber, expectedQty: item.expectedQty, pickedQty: item.pickedQty });
      }
    }
    return Array.from(groups.values());
  },

  distributePick(group: BatchPickGroup, totalPicked: number) {
    if (!Number.isInteger(totalPicked) || totalPicked !== group.totalExpectedQty - group.totalPickedQty) {
      throw new Error(`Confirm the remaining batch quantity (${group.totalExpectedQty - group.totalPickedQty}) to keep every order line reconciled.`);
    }
    for (const ti of group.taskItems) {
      if (ti.pickedQty > 0) throw new Error('This product group has already been confirmed.');
      pickingService.confirmPickItem(ti.taskId, ti.itemId, ti.expectedQty);
    }
    for (const taskId of new Set(group.taskItems.map((item) => item.taskId))) pickingService.completeTask(taskId);
  },
};
