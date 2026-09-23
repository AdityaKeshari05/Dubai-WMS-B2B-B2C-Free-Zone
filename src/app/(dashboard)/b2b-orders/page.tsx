'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Sales Order Management",
  "description": "Create and manage B2B sales orders",
  "featureCode": "6.1",
  "columns": [
    {
      "key": "customer",
      "label": "Customer"
    },
    {
      "key": "customerPo",
      "label": "Customer PO"
    },
    {
      "key": "orderValue",
      "label": "Order Value"
    },
    {
      "key": "delivery",
      "label": "Delivery Window"
    }
  ],
  "rows": [
    {
      "id": "SO-B2B-1821",
      "customer": "Retail Group LLC",
      "customerPo": "PO-44911",
      "orderValue": "AED 18,420",
      "delivery": "23 Sep 10:00–12:00",
      "status": "Picking"
    },
    {
      "id": "SO-B2B-1824",
      "customer": "Dubai Stores PJSC",
      "customerPo": "PO-73310",
      "orderValue": "AED 31,880",
      "delivery": "23 Sep 12:00–14:00",
      "status": "Allocated"
    }
  ],
  "statuses": [
    "New",
    "Allocated",
    "Picking",
    "Ready",
    "Delivered"
  ],
  "primaryAction": "New B2B Order",
  "modalTitle": "New B2B Order",
  "fields": [
    {
      "key": "customer",
      "label": "Customer",
      "placeholder": "Enter customer",
      "type": "select",
      "options": [
        "Carrefour",
        "Spinneys",
        "Lulu Hypermarket",
        "Waitrose",
        "Choithrams"
      ]
    },
    {
      "key": "customerPo",
      "label": "Customer PO",
      "placeholder": "Enter customer po",
      "type": "text"
    },
    {
      "key": "orderValue",
      "label": "Order Value",
      "placeholder": "e.g. AED 19,349",
      "type": "text"
    },
    {
      "key": "delivery",
      "label": "Delivery Window",
      "placeholder": "Enter delivery window",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "New",
    "Allocated",
    "Picking",
    "Ready",
    "Delivered"
  ],
  "searchPlaceholder": "Search sales order management..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
