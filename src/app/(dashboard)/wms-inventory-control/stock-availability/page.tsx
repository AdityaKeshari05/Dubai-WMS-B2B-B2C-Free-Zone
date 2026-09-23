'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Available / Reserved Stock",
  "description": "Separate physical, available, reserved and allocated stock",
  "featureCode": "5.2",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "physical",
      "label": "Physical"
    },
    {
      "key": "reserved",
      "label": "Reserved"
    },
    {
      "key": "allocated",
      "label": "Allocated"
    },
    {
      "key": "available",
      "label": "Available"
    },
    {
      "key": "warehouse",
      "label": "Warehouse"
    }
  ],
  "rows": [
    {
      "id": "AVL-001",
      "sku": "SKU-10021",
      "physical": 180,
      "reserved": 24,
      "allocated": 18,
      "available": 138,
      "warehouse": "Dubai Main",
      "status": "Available"
    },
    {
      "id": "AVL-002",
      "sku": "SKU-10022",
      "physical": 42,
      "reserved": 12,
      "allocated": 8,
      "available": 22,
      "warehouse": "Dubai Main",
      "status": "Low Stock"
    },
    {
      "id": "AVL-003",
      "sku": "SKU-9901",
      "physical": 5000,
      "reserved": 4999,
      "allocated": 0,
      "available": 1,
      "warehouse": "Free Zone",
      "status": "Available"
    },
    {
      "id": "AVL-004",
      "sku": "SKU-4402",
      "physical": 0,
      "reserved": 0,
      "allocated": 0,
      "available": 0,
      "warehouse": "Sharjah",
      "status": "Low Stock"
    }
  ],
  "statuses": [
    "Available",
    "Low Stock"
  ],
  "primaryAction": "Add Stock Position",
  "modalTitle": "Add Stock Position",
  "fields": [
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
      "key": "physical",
      "label": "Physical",
      "placeholder": "Enter physical",
      "type": "number"
    },
    {
      "key": "reserved",
      "label": "Reserved",
      "placeholder": "Enter reserved",
      "type": "number"
    },
    {
      "key": "allocated",
      "label": "Allocated",
      "placeholder": "Enter allocated",
      "type": "number"
    },
    {
      "key": "available",
      "label": "Available",
      "placeholder": "Enter available",
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
    "Available",
    "Low Stock"
  ],
  "searchPlaceholder": "Search available / reserved stock..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
