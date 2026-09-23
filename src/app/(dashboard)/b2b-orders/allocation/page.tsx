'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Order Allocation",
  "description": "Allocate warehouse stock to B2B orders",
  "featureCode": "6.4",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "required",
      "label": "Required"
    },
    {
      "key": "allocated",
      "label": "Allocated"
    },
    {
      "key": "warehouse",
      "label": "Warehouse"
    }
  ],
  "rows": [
    {
      "id": "ALLOC-001",
      "order": "SO-B2B-1821",
      "sku": "SKU-10021",
      "required": 240,
      "allocated": 240,
      "warehouse": "Dubai Main",
      "status": "Allocated"
    },
    {
      "id": "ALLOC-002",
      "order": "SO-B2B-1828",
      "sku": "SKU-10023",
      "required": 112,
      "allocated": 80,
      "warehouse": "Free Zone",
      "status": "Partial"
    },
    {
      "id": "ALLOC-003",
      "order": "SO-B2B-1904",
      "sku": "SKU-9901",
      "required": 500,
      "allocated": 0,
      "warehouse": "Dubai Main",
      "status": "Pending"
    },
    {
      "id": "ALLOC-004",
      "order": "SO-B2B-1910",
      "sku": "SKU-4402",
      "required": 120,
      "allocated": 120,
      "warehouse": "Jebel Ali",
      "status": "Allocated"
    },
    {
      "id": "ALLOC-005",
      "order": "SO-B2B-1922",
      "sku": "SKU-10024",
      "required": 50,
      "allocated": 25,
      "warehouse": "Free Zone",
      "status": "Partial"
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
      "type": "select",
      "options": [
        "ORD-B2B-101",
        "ORD-B2B-102",
        "ORD-B2B-103",
        "ORD-B2B-104"
      ]
    },
    {
      "key": "sku",
      "label": "SKU",
      "placeholder": "Enter sku",
      "type": "select",
      "options": [
        "SKU-10021",
        "SKU-10022",
        "SKU-10023",
        "SKU-10024",
        "SKU-9901",
        "SKU-4402"
      ]
    },
    {
      "key": "required",
      "label": "Required",
      "placeholder": "Enter required",
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
