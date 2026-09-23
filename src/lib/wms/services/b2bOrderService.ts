import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import type { B2BOrder, B2BOrderItem } from '@/types';

export interface CreateB2BOrderInput {
  customerId: string;
  customerPO: string;
  orderDate: string;
  expectedDelivery: string;
  priority: B2BOrder['priority'];
  deliveryAddress: string;
  warehouseId: string;
  currency: string;
  items: { productId: string; customerSku?: string; quantity: number; unitPrice: number; discount: number }[];
}

// TODO(api): swap the bodies below for POST/GET/PATCH calls once
// /wms/b2b-orders exists on the backend. Call sites (components) will not
// need to change - only what happens inside each function here.
export const b2bOrderService = {
  // TODO(api): GET /wms/b2b-orders
  list(): Promise<B2BOrder[]> {
    return Promise.resolve(wmsDb.getSnapshot().b2bOrders);
  },

  // TODO(api): GET /wms/b2b-orders/:id
  get(orderId: string): Promise<B2BOrder | undefined> {
    return Promise.resolve(wmsDb.getSnapshot().b2bOrders.find((o) => o.id === orderId));
  },

  // TODO(api): POST /wms/b2b-orders
  create(input: CreateB2BOrderInput): B2BOrder {
    const state = wmsDb.getSnapshot();
    const now = new Date().toISOString();
    const items: B2BOrderItem[] = input.items.map((i) => ({
      id: nextId('b2bi'),
      productId: i.productId,
      customerSku: i.customerSku,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount,
      allocatedQty: 0,
      backorderQty: 0,
      pickedQty: 0,
      packedQty: 0,
      dispatchedQty: 0,
    }));

    const order: B2BOrder = {
      id: nextId('b2b'),
      orderNumber: nextSequence('SO', state.b2bOrders.length + 1),
      customerId: input.customerId,
      customerPO: input.customerPO,
      orderDate: input.orderDate,
      expectedDelivery: input.expectedDelivery,
      priority: input.priority,
      deliveryAddress: input.deliveryAddress,
      warehouseId: input.warehouseId,
      status: 'draft',
      items,
      currency: input.currency,
      createdAt: now,
      updatedAt: now,
    };

    wmsDb.mutate((draft) => {
      draft.b2bOrders.push(order);
    });
    logWmsActivity('b2b_order', order.id, 'create', `Order ${order.orderNumber} created`);
    return order;
  },

  // TODO(api): PATCH /wms/b2b-orders/:id/confirm
  confirm(orderId: string) {
    wmsDb.mutate((draft) => {
      const order = draft.b2bOrders.find((o) => o.id === orderId);
      if (order) {
        order.status = 'confirmed';
        order.updatedAt = new Date().toISOString();
      }
    });
    logWmsActivity('b2b_order', orderId, 'confirm', 'Order confirmed');
  },

  // TODO(api): PATCH /wms/b2b-orders/:id/cancel
  cancel(orderId: string) {
    wmsDb.mutate((draft) => {
      const order = draft.b2bOrders.find((o) => o.id === orderId);
      if (order) {
        order.status = 'cancelled';
        order.updatedAt = new Date().toISOString();
      }
    });
    logWmsActivity('b2b_order', orderId, 'cancel', 'Order cancelled');
  },

  // TODO(api): PATCH /wms/b2b-orders/:id/schedule-delivery
  scheduleDelivery(orderId: string, date: string) {
    wmsDb.mutate((draft) => {
      const order = draft.b2bOrders.find((o) => o.id === orderId);
      if (order) {
        order.deliveryScheduledAt = date;
        order.updatedAt = new Date().toISOString();
      }
    });
    logWmsActivity('b2b_order', orderId, 'schedule', `Delivery scheduled for ${date}`);
  },
};
