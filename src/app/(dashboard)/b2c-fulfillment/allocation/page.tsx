'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Order Allocation",
  "description": "Allocate stock to B2C orders",
  "featureCode": "7.4",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "items",
      "label": "Items"
    },
    {
      "key": "allocated",
      "label": "Allocated"
    },
    {
      "key": "warehouse",
      "label": "Warehouse"
    },
    {
      "key": "rule",
      "label": "Rule"
    }
  ],
  "rows": [
    {
      "id": "BALLOC-001",
      "order": "B2C-92018",
      "items": 3,
      "allocated": 3,
      "warehouse": "Dubai Main",
      "rule": "FEFO",
      "status": "Allocated"
    },
    {
      "id": "BALLOC-002",
      "order": "B2C-92022",
      "items": 4,
      "status": "Partial"
    },
    {
      "id": "BALLOC-003",
      "order": "B2C-92040",
      "items": 1,
      "allocated": 0,
      "warehouse": "Free Zone",
      "rule": "LIFO",
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Partial",
    "Allocated"
  ],
  "primaryAction": "Allocate Order",
  "modalTitle": "Allocate Order",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "Enter order",
      "type": "text"
    },
    {
      "key": "items",
      "label": "Items",
      "placeholder": "Enter items",
      "type": "number"
    },
    {
      "key": "allocated",
      "label": "Allocated",
      "placeholder": "Enter allocated",
      "type": "number"
    },
    {
      "key": "warehouse",
      "label": "Warehouse",
      "placeholder": "Enter warehouse",
      "type": "select",
      "options": [
        "Dubai Main",
        "Free Zone",
        "Jebel Ali",
        "Sharjah",
        "Abu Dhabi Hub"
      ]
    },
    {
      "key": "rule",
      "label": "Rule",
      "placeholder": "Enter rule",
      "type": "select",
      "options": [
        "FIFO",
        "FEFO",
        "LIFO"
      ]
    }
  ],
  "progressStatuses": [
    "Pending",
    "Partial",
    "Allocated"
  ],
  "searchPlaceholder": "Search order allocation..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
