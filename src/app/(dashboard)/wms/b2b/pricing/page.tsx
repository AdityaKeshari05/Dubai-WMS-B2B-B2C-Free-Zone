'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddCustomerSkuModal } from '@/components/wms/b2b/AddCustomerSkuModal';

export default function PricingPage() {
  const { customers: allCustomers, products } = useWmsLookups();
  const customers = useMemo(() => allCustomers.filter((c) => c.type === 'b2b'), [allCustomers]);
  
  const pricing = useWmsDbSelector((s) => s.customerPricing);
  const skuMappings = useWmsDbSelector((s) => s.customerSkuMappings);
  
  const [addOpen, setAddOpen] = useState(false);

  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);

  return (
    <div>
      <PageHeader 
        title="6.3 Customer Pricing" 
        description="Negotiated customer pricing and commercial rules"
        action={{ label: 'Add Pricing', onClick: () => setAddOpen(true), icon: Plus }}
      />

      <DataTable
        data={pricing}
        columns={[
          { key: 'customer', header: 'Customer', render: (m) => customerMap.get(m.customerId)?.name },
          { key: 'product', header: 'Internal Product', render: (m) => productMap.get(m.productId)?.name },
          { key: 'sku', header: 'Customer SKU Mapping', render: (m) => {
            const mapping = skuMappings.find(s => s.customerId === m.customerId && s.productId === m.productId);
            return mapping ? <span className="font-mono text-xs text-gray-500">{mapping.customerSku}</span> : '-';
          }},
          { key: 'price', header: 'Negotiated Price', render: (m) => <span className="font-semibold text-green-700">{formatCurrency(m.price)}</span> },
        ]}
        emptyMessage="No customer-specific pricing found"
      />

      <AddCustomerSkuModal open={addOpen} onOpenChange={setAddOpen} customers={customers} products={products} />
    </div>
  );
}
