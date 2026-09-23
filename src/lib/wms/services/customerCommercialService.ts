import { wmsDb } from '../db';
import { nextId } from '../id';
import { logWmsActivity } from '../activityLog';
import type { CustomerSkuMapping, CustomerPricing } from '@/types';

// TODO(api): swap bodies for /wms/customer-sku-mappings and
// /wms/customer-pricing once the backend exists.
export const customerCommercialService = {
  upsertSkuMapping(params: { customerId: string; productId: string; customerSku: string }): CustomerSkuMapping {
    const state = wmsDb.getSnapshot();
    const existing = state.customerSkuMappings.find((m) => m.customerId === params.customerId && m.productId === params.productId);
    const mapping: CustomerSkuMapping = existing
      ? { ...existing, customerSku: params.customerSku }
      : { id: nextId('csm'), ...params };

    wmsDb.mutate((draft) => {
      if (existing) {
        const target = draft.customerSkuMappings.find((m) => m.id === existing.id)!;
        target.customerSku = params.customerSku;
      } else {
        draft.customerSkuMappings.push(mapping);
      }
    });
    logWmsActivity('customer_sku_mapping', mapping.id, existing ? 'update' : 'create', `Customer SKU ${params.customerSku} mapped`);
    return mapping;
  },

  upsertPricing(params: { customerId: string; productId: string; price: number }): CustomerPricing {
    const state = wmsDb.getSnapshot();
    const existing = state.customerPricing.find((p) => p.customerId === params.customerId && p.productId === params.productId);
    const pricing: CustomerPricing = existing ? { ...existing, price: params.price } : { id: nextId('cp'), ...params };

    wmsDb.mutate((draft) => {
      if (existing) {
        const target = draft.customerPricing.find((p) => p.id === existing.id)!;
        target.price = params.price;
      } else {
        draft.customerPricing.push(pricing);
      }
    });
    logWmsActivity('customer_pricing', pricing.id, existing ? 'update' : 'create', `Negotiated price set to ${params.price}`);
    return pricing;
  },
};
