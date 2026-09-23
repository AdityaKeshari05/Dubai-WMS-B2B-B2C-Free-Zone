'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Cycle Counting",
  "description": "Perform scheduled inventory counts without stopping operations",
  "featureCode": "5.6",
  "columns": [
    {
      "key": "warehouse",
      "label": "Warehouse"
    },
    {
      "key": "scope",
      "label": "Scope"
    },
    {
      "key": "systemQty",
      "label": "System Qty"
    },
    {
      "key": "countedQty",
      "label": "Counted Qty"
    },
    {
      "key": "variance",
      "label": "Variance"
    }
  ],
  "rows": [
    {
      "id": "CC-00128",
      "warehouse": "Dubai Main",
      "scope": "Zone A / 48 SKUs",
      "systemQty": 2840,
      "countedQty": "—",
      "variance": "—",
      "status": "Scheduled"
    },
    {
      "id": "CC-00127",
      "warehouse": "Free Zone",
      "scope": "FZ-03 / 22 SKUs",
      "systemQty": 940,
      "countedQty": 936,
      "variance": -4,
      "status": "Completed"
    }
  ],
  "statuses": [
    "Scheduled",
    "Counting",
    "Completed"
  ],
  "primaryAction": "Schedule Cycle Count",
  "modalTitle": "Schedule Cycle Count",
  "fields": [
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
      "key": "scope",
      "label": "Scope",
      "placeholder": "Enter scope",
      "type": "select",
      "options": [
        "Zone A / 48 SKUs",
        "FZ-03 / 22 SKUs",
        "High Value Bin",
        "Cold Storage"
      ]
    },
    {
      "key": "systemQty",
      "label": "System Qty",
      "placeholder": "Enter system qty",
      "type": "number"
    },
    {
      "key": "countedQty",
      "label": "Counted Qty",
      "placeholder": "Enter counted qty",
      "type": "number"
    },
    {
      "key": "variance",
      "label": "Variance",
      "placeholder": "Enter variance",
      "type": "number"
    }
  ],
  "progressStatuses": [
    "Scheduled",
    "Counting",
    "Completed"
  ],
  "searchPlaceholder": "Search cycle counting..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
