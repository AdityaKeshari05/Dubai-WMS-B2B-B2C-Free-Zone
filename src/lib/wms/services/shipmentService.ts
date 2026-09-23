import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import type { Shipment, B2BOrder, B2COrder } from '@/types';
import type { OrderType } from './allocationService';

// TODO(api): swap bodies for /wms/shipments once the backend exists.
export const shipmentService = {
  createShipment(orderId: string, orderType: OrderType, params: { packageIds: string[]; carrier: string }): Shipment {
    const state = wmsDb.getSnapshot();
    const trackingNumber =
      state.packages.find((p) => params.packageIds.includes(p.id))?.shippingLabel?.trackingNumber ??
      `AE${Math.floor(100000000 + Math.random() * 899999999)}`;

    const now = new Date().toISOString();
    const shipment: Shipment = {
      id: nextId('shp'),
      shipmentNumber: nextSequence('SHP', state.shipments.length + 1),
      orderId,
      orderType,
      packageIds: params.packageIds,
      carrier: params.carrier,
      trackingNumber,
      status: 'label_created',
      createdAt: now,
    };

    wmsDb.mutate((draft) => {
      draft.shipments.push(shipment);
      for (const pkg of draft.packages) {
        if (params.packageIds.includes(pkg.id)) pkg.status = 'ready_to_ship';
      }
      if (orderType === 'b2c') {
        const order = draft.b2cOrders.find((o) => o.id === orderId);
        if (order) {
          order.trackingNumber = trackingNumber;
          order.carrier = params.carrier;
        }
      }
    });

    logWmsActivity('shipment', shipment.id, 'create', `Shipment ${shipment.shipmentNumber} created (${params.packageIds.length} package(s))`);
    return shipment;
  },

  dispatch(shipmentId: string) {
    const now = new Date().toISOString();
    wmsDb.mutate((draft) => {
      const shipment = draft.shipments.find((s) => s.id === shipmentId);
      if (!shipment) return;
      shipment.status = 'picked_up';
      shipment.dispatchedAt = now;

      const list = shipment.orderType === 'b2b' ? draft.b2bOrders : draft.b2cOrders;
      const order = list.find((o) => o.id === shipment.orderId) as B2BOrder | B2COrder | undefined;
      if (order) {
        if (shipment.orderType === 'b2b') (order as B2BOrder).status = 'dispatched';
        else (order as B2COrder).fulfillmentStatus = 'shipped';
        order.updatedAt = now;
      }
    });
    logWmsActivity('shipment', shipmentId, 'dispatch', 'Shipment dispatched');
  },

  advanceTracking(shipmentId: string, status: Shipment['status']) {
    wmsDb.mutate((draft) => {
      const shipment = draft.shipments.find((s) => s.id === shipmentId);
      if (!shipment) return;
      shipment.status = status;
      if (status === 'delivered') shipment.deliveredAt = new Date().toISOString();

      const list = shipment.orderType === 'b2b' ? draft.b2bOrders : draft.b2cOrders;
      const order = list.find((o) => o.id === shipment.orderId) as B2BOrder | B2COrder | undefined;
      if (order) {
        if (status === 'delivered') {
          if (shipment.orderType === 'b2b') (order as B2BOrder).status = 'delivered';
          else (order as B2COrder).fulfillmentStatus = 'delivered';
        } else if (status === 'rto' && shipment.orderType === 'b2c') {
          (order as B2COrder).fulfillmentStatus = 'rto';
        }
        order.updatedAt = new Date().toISOString();
      }
    });
    logWmsActivity('shipment', shipmentId, 'tracking', `Tracking updated to ${status.replace('_', ' ')}`);
  },

  markRTO(shipmentId: string, reason: string) {
    wmsDb.mutate((draft) => {
      const shipment = draft.shipments.find((s) => s.id === shipmentId);
      if (!shipment) return;
      shipment.status = 'rto';
      const order = draft.b2cOrders.find((o) => o.id === shipment.orderId);
      if (order) {
        order.fulfillmentStatus = 'rto';
        order.rtoReason = reason;
        order.updatedAt = new Date().toISOString();
      }
    });
    logWmsActivity('shipment', shipmentId, 'rto', `Marked RTO: ${reason}`);
  },

  recordPOD(orderId: string, orderType: OrderType, pod: { deliveredDate: string; receivedBy: string; notes?: string }) {
    wmsDb.mutate((draft) => {
      if (orderType === 'b2b') {
        const order = draft.b2bOrders.find((o) => o.id === orderId);
        if (order) {
          order.pod = pod;
          order.status = 'delivered';
          order.updatedAt = new Date().toISOString();
        }
      } else {
        const order = draft.b2cOrders.find((o) => o.id === orderId);
        if (order) {
          order.fulfillmentStatus = 'delivered';
          order.updatedAt = new Date().toISOString();
        }
      }
      const shipment = draft.shipments.find((s) => s.orderId === orderId && s.orderType === orderType && s.status !== 'delivered');
      if (shipment) {
        shipment.status = 'delivered';
        shipment.deliveredAt = new Date().toISOString();
      }
    });
    logWmsActivity(orderType === 'b2b' ? 'b2b_order' : 'b2c_order', orderId, 'pod', `Proof of delivery recorded, received by ${pod.receivedBy}`);
  },

  updateCodCollection(orderId: string, status: 'collected' | 'failed') {
    wmsDb.mutate((draft) => {
      const order = draft.b2cOrders.find((o) => o.id === orderId);
      if (order) {
        order.codStatus = status;
        order.updatedAt = new Date().toISOString();
      }
    });
    logWmsActivity('b2c_order', orderId, 'cod', `COD collection marked ${status}`);
  },
};
