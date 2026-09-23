import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import type { PackageUnit, BoxType, B2BOrder, B2COrder } from '@/types';
import type { OrderType } from './allocationService';

function generateTracking() {
  return `AE${Math.floor(100000000 + Math.random() * 899999999)}`;
}

// TODO(api): swap bodies for /wms/packages once the backend exists.
export const packingService = {
  createPackage(
    orderId: string,
    orderType: OrderType,
    params: { boxType: BoxType; weightKg: number; dimensions: { l: number; w: number; h: number } }
  ): PackageUnit {
    const state = wmsDb.getSnapshot();
    const order =
      orderType === 'b2b'
        ? state.b2bOrders.find((o) => o.id === orderId)
        : state.b2cOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const items = order.items
      .filter((i) => i.pickedQty > i.packedQty)
      .map((i) => ({ productId: i.productId, qty: i.pickedQty - i.packedQty }));
    if (items.length === 0) throw new Error('No picked items are pending packing for this order.');

    const now = new Date().toISOString();
    const pkg: PackageUnit = {
      id: nextId('pkg'),
      packageNumber: nextSequence('PKG', state.packages.length + 1),
      orderId,
      orderType,
      boxType: params.boxType,
      weightKg: params.weightKg,
      dimensions: params.dimensions,
      items,
      status: 'pending',
      verification: { skuVerified: false, quantityVerified: false, packageSelected: true, labelGenerated: false },
      createdAt: now,
      updatedAt: now,
    };

    wmsDb.mutate((draft) => {
      draft.packages.push(pkg);
      const list = orderType === 'b2b' ? draft.b2bOrders : draft.b2cOrders;
      const target = list.find((o) => o.id === orderId)! as B2BOrder | B2COrder;
      if (orderType === 'b2b') (target as B2BOrder).status = 'picking';
      else (target as B2COrder).fulfillmentStatus = 'packing';
      target.updatedAt = now;
    });

    logWmsActivity('package', pkg.id, 'create', `Package ${pkg.packageNumber} created for order`);
    return pkg;
  },

  setVerification(packageId: string, field: keyof PackageUnit['verification'], value: boolean) {
    wmsDb.mutate((draft) => {
      const pkg = draft.packages.find((p) => p.id === packageId);
      if (!pkg) return;
      pkg.verification[field] = value;
      pkg.status = 'verifying';
      pkg.updatedAt = new Date().toISOString();
    });
  },

  generateLabel(packageId: string, carrier: string) {
    wmsDb.mutate((draft) => {
      const pkg = draft.packages.find((p) => p.id === packageId);
      if (!pkg) return;
      pkg.shippingLabel = { trackingNumber: generateTracking(), carrier, generatedAt: new Date().toISOString() };
      pkg.verification.labelGenerated = true;
      pkg.updatedAt = new Date().toISOString();
    });
    logWmsActivity('package', packageId, 'label', `Shipping label generated via ${carrier}`);
  },

  markPacked(packageId: string) {
    const state = wmsDb.getSnapshot();
    const pkg = state.packages.find((p) => p.id === packageId);
    if (!pkg) throw new Error('Package not found');
    const v = pkg.verification;
    if (!v.skuVerified || !v.quantityVerified || !v.packageSelected) {
      throw new Error('Complete SKU, quantity and package verification before marking packed.');
    }

    const now = new Date().toISOString();
    wmsDb.mutate((draft) => {
      const p = draft.packages.find((x) => x.id === packageId)!;
      p.status = 'packed';
      p.updatedAt = now;

      const list = p.orderType === 'b2b' ? draft.b2bOrders : draft.b2cOrders;
      const order = list.find((o) => o.id === p.orderId)! as B2BOrder | B2COrder;
      for (const line of p.items) {
        const orderItem = order.items.find((oi) => oi.productId === line.productId);
        if (orderItem) orderItem.packedQty += line.qty;
      }
      const allPacked = order.items.every((i) => i.packedQty >= i.pickedQty && i.pickedQty > 0);
      if (allPacked) {
        if (p.orderType === 'b2b') (order as B2BOrder).status = 'packed';
        else (order as B2COrder).fulfillmentStatus = 'packed';
      }
      order.updatedAt = now;
    });

    logWmsActivity('package', packageId, 'packed', `Package ${pkg.packageNumber} marked packed`);
  },
};
