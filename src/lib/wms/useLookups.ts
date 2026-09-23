'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import { DEMO_PRODUCTS, DEMO_WAREHOUSES, DEMO_CUSTOMERS } from './demoData';
import type { Product, Warehouse, Customer } from '@/types';

/** Real product/warehouse/customer lookups shared by every WMS screen -
 * this app already has these endpoints, so the WMS layer never mocks them
 * by preference. When the real API is unreachable or returns nothing (e.g.
 * running this for a demo without a backend), it falls back to local demo
 * data so the WMS screens still have something realistic to show - the real
 * API is always tried first and wins whenever it succeeds. */
export function useWmsLookups() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendUnreachable, setIsBackendUnreachable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const [prodRes, whRes, custRes] = await Promise.allSettled([
          api.get('/inventory/products', { params: { limit: 200 } }),
          api.get('/inventory/warehouses'),
          api.get('/customers', { params: { limit: 200 } }),
        ]);
        if (cancelled) return;
        let anyFailed = false;

        const fetchedProducts: Product[] = prodRes.status === 'fulfilled' ? prodRes.value.data?.data?.items || [] : [];
        if (prodRes.status === 'rejected') { anyFailed = true; console.warn('[wms] Failed to load products:', getApiErrorMessage(prodRes.reason)); }
        setProducts(fetchedProducts.length > 0 ? fetchedProducts : DEMO_PRODUCTS);

        const fetchedWarehouses: Warehouse[] = whRes.status === 'fulfilled' ? whRes.value.data?.data || [] : [];
        if (whRes.status === 'rejected') { anyFailed = true; console.warn('[wms] Failed to load warehouses:', getApiErrorMessage(whRes.reason)); }
        setWarehouses(fetchedWarehouses.length > 0 ? fetchedWarehouses : DEMO_WAREHOUSES);

        const fetchedCustomers: Customer[] = custRes.status === 'fulfilled' ? custRes.value.data?.data?.items || [] : [];
        if (custRes.status === 'rejected') { anyFailed = true; console.warn('[wms] Failed to load customers:', getApiErrorMessage(custRes.reason)); }
        setCustomers(fetchedCustomers.length > 0 ? fetchedCustomers : DEMO_CUSTOMERS);

        setIsBackendUnreachable(anyFailed);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const physicalQtyByProductId: Record<string, number> = Object.fromEntries(
    products.map((p) => [p.id, p.stockLevels?.reduce((sum, sl) => sum + sl.quantity, 0) ?? 0])
  );

  return { products, warehouses, customers, physicalQtyByProductId, isLoading, isBackendUnreachable };
}
