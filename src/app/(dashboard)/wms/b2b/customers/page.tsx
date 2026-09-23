'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { formatCurrency } from '@/lib/utils';

export default function B2BCustomersPage() {
  const { customers: allCustomers, products } = useWmsLookups();
  const customers = useMemo(() => allCustomers.filter((c) => c.type === 'b2b'), [allCustomers]);
  
  const orders = useWmsDbSelector((s) => s.b2bOrders);
  const skuMappings = useWmsDbSelector((s) => s.customerSkuMappings);
  const pricing = useWmsDbSelector((s) => s.customerPricing);
  
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);

  return (
    <div>
      <PageHeader title="B2B Customers" description="Business accounts, SKU mappings and negotiated pricing" />

      <div className="mb-6">
        <DataTable
          data={customers}
          columns={[
            { key: 'name', header: 'Customer', render: (c) => <div><div className="font-medium text-gray-900">{c.name}</div><div className="text-xs text-gray-400">{c.contactEmail}</div></div> },
            { key: 'city', header: 'City', render: (c) => c.city },
            { key: 'terms', header: 'Payment Terms', render: (c) => c.paymentTerms },
            { key: 'credit', header: 'Credit Limit', render: (c) => c.creditLimit ? formatCurrency(c.creditLimit) : '-' },
            { key: 'orders', header: 'Orders', render: (c) => orders.filter((o) => o.customerId === c.id).length },
          ]}
          emptyMessage="No B2B customers found"
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900">Customer SKU Mappings & Pricing</h2>
      <DataTable
        data={skuMappings}
        columns={[
          { key: 'customer', header: 'Customer', render: (m) => customerMap.get(m.customerId)?.name },
          { key: 'product', header: 'Product', render: (m) => productMap.get(m.productId)?.name },
          { key: 'sku', header: 'Customer SKU', render: (m) => <span className="font-mono text-xs">{m.customerSku}</span> },
          { key: 'price', header: 'Negotiated Price', render: (m) => {
            const price = pricing.find((p) => p.customerId === m.customerId && p.productId === m.productId);
            return price ? formatCurrency(price.price) : 'Standard';
          }},
        ]}
        emptyMessage="No SKU mappings found"
      />
    </div>
  );
}
