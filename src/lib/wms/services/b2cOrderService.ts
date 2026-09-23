import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import type { B2COrder, B2COrderItem, B2CChannel, B2CPaymentMethod, Product, Customer } from '@/types';

export interface CreateB2COrderInput {
  channel: B2CChannel;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  warehouseId: string;
  paymentMethod: B2CPaymentMethod;
  orderDate: string;
  currency: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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
      channel: input.channel,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      warehouseId: input.warehouseId,
      items,
      amount,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      codAmount: input.paymentMethod === 'cod' ? amount : undefined,
      codStatus: input.paymentMethod === 'cod' ? 'pending' : undefined,
      fulfillmentStatus: 'new',
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

  // Simulates a marketplace order pull. Uses real product/customer records
  // fetched by the caller (via the existing api client) rather than fake
  // ones, so imported orders still point at data that exists.
  importSample(count: number, warehouseId: string, currency: string, products: Product[], customers: Customer[]) {
    if (products.length === 0 || customers.length === 0) {
      return { imported: 0, skipped: count, failed: 0 };
    }
    const state = wmsDb.getSnapshot();
    const channels: B2CChannel[] = ['amazon', 'noon', 'website', 'marketplace'];
    const imported: B2COrder[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      const customer = randomFrom(customers);
      const product = randomFrom(products);
      const qty = 1 + Math.floor(Math.random() * 3);
      const isCod = Math.random() < 0.3;
      const unitPrice = product.salePrice;
      const amount = qty * unitPrice;
      const item: B2COrderItem = {
        id: nextId('b2ci'),
        productId: product.id,
        quantity: qty,
        unitPrice,
        allocatedQty: 0,
        backorderQty: 0,
        pickedQty: 0,
        packedQty: 0,
      };
      imported.push({
        id: nextId('b2c'),
        orderNumber: nextSequence('ECM', state.b2cOrders.length + imported.length + 1),
        channel: randomFrom(channels),
        customerName: customer.name,
        customerPhone: customer.phone ?? '',
        customerAddress: [customer.address, customer.city].filter(Boolean).join(', '),
        warehouseId,
        items: [item],
        amount,
        currency,
        paymentMethod: isCod ? 'cod' : 'prepaid',
        codAmount: isCod ? amount : undefined,
        codStatus: isCod ? 'pending' : undefined,
        fulfillmentStatus: 'new',
        orderDate: now.slice(0, 10),
        createdAt: now,
        updatedAt: now,
      });
    }

    wmsDb.mutate((draft) => {
      draft.b2cOrders.push(...imported);
      draft.meta.lastSync = now;
    });
    logWmsActivity('b2c_order', 'bulk', 'import', `Imported ${imported.length} order(s) from marketplace channels`);
    return { imported: imported.length, skipped: 0, failed: 0 };
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
