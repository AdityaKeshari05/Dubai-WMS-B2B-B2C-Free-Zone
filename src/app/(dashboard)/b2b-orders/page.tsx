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
      "delivery": "23 Sep 12:00–14:00",
      "status": "Allocated"
    },
    {
      "id": "SO-B2B-1825",
      "customer": "Spinneys",
      "customerPo": "PO-99221",
      "orderValue": "AED 12,000",
      "delivery": "24 Sep 08:00–10:00",
      "status": "New"
    },
    {
      "id": "SO-B2B-1826",
      "customer": "Carrefour",
      "customerPo": "PO-10023",
      "orderValue": "AED 45,500",
      "delivery": "25 Sep 14:00–16:00",
      "status": "Delivered"
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
