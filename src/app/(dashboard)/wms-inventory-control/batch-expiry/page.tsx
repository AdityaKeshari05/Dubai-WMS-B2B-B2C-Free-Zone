'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Batch / Expiry Tracking",
  "description": "Track inventory according to batch and expiry",
  "featureCode": "5.10",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "batch",
      "label": "Batch"
    },
    {
      "key": "received",
      "label": "Received"
    },
    {
      "key": "expiry",
      "label": "Expiry"
    },
    {
      "key": "qty",
      "label": "Qty"
    },
    {
      "key": "warehouse",
      "label": "Warehouse"
    }
  ],
  "rows": [
    {
      "id": "BAT-001",
      "sku": "SKU-10021",
      "batch": "B-240921",
      "received": "21 Sep 2026",
      "expiry": "21 Mar 2027",
      "qty": 180,
      "warehouse": "Dubai Main",
      "status": "Active"
    },
    {
      "id": "BAT-002",
      "sku": "SKU-10022",
      "batch": "B-240908",
      "received": "08 Sep 2026",
      "expiry": "08 Feb 2027",
      "qty": 42,
      "warehouse": "Dubai Main",
      "status": "Active"
    },
    {
      "id": "BAT-003",
      "sku": "SKU-9901",
      "batch": "B-240001-MILK",
      "received": "01 Jan 2026",
      "expiry": "15 Jan 2026",
      "qty": 500,
      "warehouse": "Sharjah",
      "status": "Expired"
    },
    {
      "id": "BAT-004",
      "sku": "SKU-4402",
      "batch": "B-SUSPICIOUS",
      "received": "10 Aug 2026",
      "expiry": "10 Aug 2099",
      "qty": 1,
      "warehouse": "Jebel Ali",
      "status": "Quarantine"
    }
  ],
  "statuses": [
    "Active",
    "Expired",
    "Quarantine"
  ],
  "primaryAction": "Add Batch",
  "modalTitle": "Add Batch",
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
      "key": "batch",
      "label": "Batch",
      "placeholder": "Enter batch",
      "type": "select",
      "options": [
        "B-240921",
        "B-240908",
        "B-241010",
        "B-241105"
      ]
    },
    {
      "key": "received",
      "label": "Received",
      "placeholder": "Enter received",
      "type": "date"
    },
    {
      "key": "expiry",
      "label": "Expiry",
      "placeholder": "Enter expiry",
      "type": "date"
    },
    {
      "key": "qty",
      "label": "Qty",
      "placeholder": "Enter qty",
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
    "Active",
    "Expired",
    "Quarantine"
  ],
  "searchPlaceholder": "Search batch / expiry tracking..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
