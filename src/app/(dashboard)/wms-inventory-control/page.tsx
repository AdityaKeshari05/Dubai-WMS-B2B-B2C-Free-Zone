'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Real-Time Inventory",
  "description": "View current stock across warehouses and bins",
  "featureCode": "5.1",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "product",
      "label": "Product"
    },
    {
      "key": "warehouse",
      "label": "Warehouse"
    },
    {
      "key": "bin",
      "label": "Bin"
    },
    {
      "key": "physical",
      "label": "Physical"
    },
    {
      "key": "available",
      "label": "Available"
    }
  ],
  "rows": [
    {
      "id": "INV-001",
      "sku": "SKU-10021",
      "product": "Premium Dates 1kg",
      "warehouse": "Dubai Main",
      "bin": "A-01-02",
      "physical": 180,
      "available": 156,
      "status": "Available"
    },
    {
      "id": "INV-002",
      "sku": "SKU-10022",
      "product": "Arabic Coffee 500g",
      "warehouse": "Dubai Main",
      "bin": "B-02-04",
      "physical": 42,
      "available": 30,
      "status": "Low Stock"
    },
    {
      "id": "INV-003",
      "sku": "SKU-10023",
      "product": "Gift Box XL",
      "warehouse": "Free Zone",
      "bin": "FZ-03-01",
      "physical": 68,
      "available": 64,
      "status": "Available"
    }
  ],
  "statuses": [
    "Available",
    "Low Stock",
    "Quarantine"
  ],
  "primaryAction": "Add Inventory Snapshot",
  "modalTitle": "Add Inventory Snapshot",
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
      "key": "product",
      "label": "Product",
      "placeholder": "Enter product",
      "type": "select",
      "options": [
        "Premium Dates 1kg",
        "Arabic Coffee 500g",
        "Gift Box XL",
        "Oud Perfume 50ml",
        "Saffron 10g"
      ]
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
      "key": "bin",
      "label": "Bin",
      "placeholder": "Enter bin",
      "type": "select",
      "options": [
        "A-01-01",
        "A-01-02",
        "B-02-04",
        "FZ-03-01",
        "C-01-05",
        "D-Receiving",
        "D-Dispatch"
      ]
    },
    {
      "key": "physical",
      "label": "Physical",
      "placeholder": "Enter physical",
      "type": "number"
    },
    {
      "key": "available",
      "label": "Available",
      "placeholder": "Enter available",
      "type": "number"
    }
  ],
  "progressStatuses": [
    "Available",
    "Low Stock",
    "Quarantine"
  ],
  "searchPlaceholder": "Search real-time inventory..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
