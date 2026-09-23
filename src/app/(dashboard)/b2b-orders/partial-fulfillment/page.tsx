'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Partial Fulfillment",
  "description": "Manage partial order fulfillment",
  "featureCode": "6.5",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "ordered",
      "label": "Ordered"
    },
    {
      "key": "fulfilled",
      "label": "Fulfilled"
    },
    {
      "key": "remaining",
      "label": "Remaining"
    },
    {
      "key": "nextDate",
      "label": "Next Delivery"
    }
  ],
  "rows": [
    {
      "id": "PART-001",
      "order": "SO-B2B-1828",
      "ordered": 112,
      "fulfilled": 80,
      "remaining": 32,
      "nextDate": "26 Sep 2026",
      "status": "Partial"
    }
  ],
  "statuses": [
    "Partial",
    "Completed"
  ],
  "primaryAction": "Create Partial Fulfillment",
  "modalTitle": "Create Partial Fulfillment",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "Enter order",
      "type": "select",
      "options": [
        "ORD-B2B-101",
        "ORD-B2B-102",
        "ORD-B2B-103",
        "ORD-B2B-104"
      ]
    },
    {
      "key": "ordered",
      "label": "Ordered",
      "placeholder": "Enter ordered",
      "type": "number"
    },
    {
      "key": "fulfilled",
      "label": "Fulfilled",
      "placeholder": "Enter fulfilled",
      "type": "number"
    },
    {
      "key": "remaining",
      "label": "Remaining",
      "placeholder": "Enter remaining",
      "type": "number"
    },
    {
      "key": "nextDate",
      "label": "Next Delivery",
      "placeholder": "Enter next delivery",
      "type": "date"
    }
  ],
  "progressStatuses": [
    "Partial",
    "Completed"
  ],
  "searchPlaceholder": "Search partial fulfillment..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
