'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "FEFO / FIFO",
  "description": "Allocate stock according to configured inventory rotation rules",
  "featureCode": "5.11",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "rule",
      "label": "Rotation Rule"
    },
    {
      "key": "batch",
      "label": "Next Batch"
    },
    {
      "key": "expiry",
      "label": "Expiry / Receipt"
    },
    {
      "key": "qty",
      "label": "Allocatable Qty"
    }
  ],
  "rows": [
    {
      "id": "ROT-001",
      "sku": "SKU-10021",
      "rule": "FEFO",
      "batch": "B-240921",
      "expiry": "21 Mar 2027",
      "qty": 180,
      "status": "Active"
    },
    {
      "id": "ROT-002",
      "sku": "SKU-10030",
      "rule": "FIFO",
      "batch": "B-240701",
      "expiry": "01 Jul 2026 receipt",
      "qty": 94,
      "status": "Active"
    }
  ],
  "statuses": [
    "Active",
    "Paused"
  ],
  "primaryAction": "Configure Rotation",
  "modalTitle": "Configure Rotation",
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
      "key": "rule",
      "label": "Rotation Rule",
      "placeholder": "Enter rotation rule",
      "type": "select",
      "options": [
        "FIFO",
        "FEFO",
        "LIFO"
      ]
    },
    {
      "key": "batch",
      "label": "Next Batch",
      "placeholder": "Enter next batch",
      "type": "select",
      "options": [
        "B-240921",
        "B-240908",
        "B-241010",
        "B-241105"
      ]
    },
    {
      "key": "expiry",
      "label": "Expiry / Receipt",
      "placeholder": "Enter expiry / receipt",
      "type": "text"
    },
    {
      "key": "qty",
      "label": "Allocatable Qty",
      "placeholder": "Enter allocatable qty",
      "type": "number"
    }
  ],
  "progressStatuses": [
    "Active",
    "Paused"
  ],
  "searchPlaceholder": "Search fefo / fifo..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
