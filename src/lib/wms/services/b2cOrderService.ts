import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import type { B2COrder, B2COrderItem, B2CChannel, B2CPaymentMethod } from '@/types';

export interface CreateB2COrderInput {
  sourceOrderNumber?: string;
  channel: B2CChannel;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  warehouseId: string;
  paymentMethod: B2CPaymentMethod;
  paymentStatus?: B2COrder['paymentStatus'];
  priority?: B2COrder['priority'];
  orderDate: string;
  currency: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}

// TODO(api): swap bodies for /wms/b2c-orders once the backend exists.
export const b2cOrderService = {
  list(): Promise<B2COrder[]> {
    return Promise.resolve(wmsDb.getSnapshot().b2cOrders);
  },

  get(orderId: string): Promise<B2COrder | undefined> {
    return Promise.resolve(wmsDb.getSnapshot().b2cOrders.find((o) => o.id === orderId));
  },

  create(input: CreateB2COrderInput): B2COrder {
    const state = wmsDb.getSnapshot();
    const now = new Date().toISOString();
    const items: B2COrderItem[] = input.items.map((i) => ({
      id: nextId('b2ci'),
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      allocatedQty: 0,
      backorderQty: 0,
      pickedQty: 0,
      packedQty: 0,
    }));
    const amount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    const order: B2COrder = {
      id: nextId('b2c'),
      orderNumber: nextSequence('ECM', state.b2cOrders.length + 1),
      sourceOrderNumber: input.sourceOrderNumber,
      channel: input.channel,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      warehouseId: input.warehouseId,
      items,
      amount,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus ?? (input.paymentMethod === 'cod' ? 'pending' : 'paid'),
      codAmount: input.paymentMethod === 'cod' ? amount : undefined,
      codStatus: input.paymentMethod === 'cod' ? 'pending' : undefined,
      fulfillmentStatus: 'new',
      priority: input.priority ?? 'normal',
      orderDate: input.orderDate,
      createdAt: now,
      updatedAt: now,
    };

    wmsDb.mutate((draft) => {
      draft.b2cOrders.push(order);
    });
    logWmsActivity('b2c_order', order.id, 'create', `Order ${order.orderNumber} created via ${input.channel}`);
    return order;
  },

  sync() {
    const now = new Date().toISOString();
    wmsDb.mutate((draft) => {
      draft.meta.lastSync = now;
    });
    logWmsActivity('b2c_order', 'bulk', 'sync', 'Order sync completed');
    return { lastSync: now };
  },
};
