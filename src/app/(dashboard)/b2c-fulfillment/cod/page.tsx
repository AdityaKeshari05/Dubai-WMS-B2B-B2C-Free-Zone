'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "COD Support",
  "description": "Track cash-on-delivery orders and collection status",
  "featureCode": "7.11",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "customer",
      "label": "Customer"
    },
    {
      "key": "amount",
      "label": "COD Amount"
    },
    {
      "key": "carrier",
      "label": "Carrier"
    },
    {
      "key": "collection",
      "label": "Collection"
    }
  ],
  "rows": [
    {
      "id": "COD-001",
      "order": "B2C-92019",
      "customer": "Omar Khalid",
      "amount": "AED 184",
      "carrier": "DHL",
      "collection": "Pending settlement",
      "status": "Pending"
    },
    {
      "id": "COD-002",
      "order": "B2C-91988",
      "customer": "Mariam Ali",
      "amount": "AED 96",
      "carrier": "Aramex",
      "collection": "Collected",
      "status": "Completed"
    }
  ],
  "statuses": [
    "Pending",
    "Collected",
    "Completed"
  ],
  "primaryAction": "Add COD Record",
  "modalTitle": "Add COD Record",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. B2C-92019",
      "type": "text"
    },
    {
      "key": "customer",
      "label": "Customer",
      "placeholder": "Enter customer",
      "type": "text"
    },
    {
      "key": "amount",
      "label": "COD Amount",
      "placeholder": "e.g. AED 184",
      "type": "text"
    },
    {
      "key": "carrier",
      "label": "Carrier",
      "placeholder": "Enter carrier",
      "type": "select",
      "options": [
        "DHL",
        "Aramex",
        "FedEx",
        "UPS"
      ]
    },
    {
      "key": "collection",
      "label": "Collection",
      "placeholder": "Enter collection",
      "type": "select",
      "options": [
        "Pending settlement",
        "Collected",
        "Failed"
      ]
    }
  ],
  "progressStatuses": [
    "Pending",
    "Collected",
    "Completed"
  ],
  "searchPlaceholder": "Search cod support..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
