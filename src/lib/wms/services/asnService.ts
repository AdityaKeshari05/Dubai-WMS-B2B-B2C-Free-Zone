import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import type { ASN } from '@/types';

// TODO(api): swap bodies for /wms/asns once the backend exists.
export const asnService = {
  createForOrder(orderId: string, params: { expectedDispatch: string; expectedDelivery: string }): ASN {
    const state = wmsDb.getSnapshot();
    const order = state.b2bOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const asn: ASN = {
      id: nextId('asn'),
      asnNumber: nextSequence('ASN', state.asns.length + 1),
      orderId,
      customerId: order.customerId,
      items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      expectedDispatch: params.expectedDispatch,
      expectedDelivery: params.expectedDelivery,
      status: 'issued',
      createdAt: new Date().toISOString(),
    };

    wmsDb.mutate((draft) => {
      draft.asns.push(asn);
    });
    logWmsActivity('asn', asn.id, 'create', `ASN ${asn.asnNumber} issued for order ${order.orderNumber}`);
    return asn;
  },
};
