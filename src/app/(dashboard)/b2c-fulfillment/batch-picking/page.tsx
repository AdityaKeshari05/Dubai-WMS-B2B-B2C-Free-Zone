'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Batch Picking",
  "description": "Pick multiple similar orders in batches",
  "featureCode": "7.6",
  "columns": [
    {
      "key": "batch",
      "label": "Batch"
    },
    {
      "key": "orders",
      "label": "Orders"
    },
    {
      "key": "skuCount",
      "label": "SKU Count"
    },
    {
      "key": "picker",
      "label": "Picker"
    },
    {
      "key": "trolley",
      "label": "Trolley"
    }
  ],
  "rows": [
    {
      "id": "BATCH-101",
      "batch": "Batch A",
      "orders": 18,
      "skuCount": 12,
      "picker": "Sara",
      "trolley": "T-08",
      "status": "Picking"
    },
    {
      "id": "BATCH-102",
      "batch": "Batch B",
      "orders": 22,
      "skuCount": 16,
      "picker": "Ahmed",
      "trolley": "T-11",
      "status": "Completed"
    }
  ],
  "statuses": [
    "Planned",
    "Picking",
    "Completed"
  ],
  "primaryAction": "Create Batch",
  "modalTitle": "Create Batch",
  "fields": [
    {
      "key": "batch",
      "label": "Batch",
      "placeholder": "e.g. Batch A",
      "type": "text"
    },
    {
      "key": "orders",
      "label": "Orders",
      "placeholder": "Enter orders",
      "type": "number"
    },
    {
      "key": "skuCount",
      "label": "SKU Count",
      "placeholder": "Enter sku count",
      "type": "number"
    },
    {
      "key": "picker",
      "label": "Picker",
      "placeholder": "Enter picker",
      "type": "select",
      "options": [
        "Sara",
        "Ahmed",
        "Mohammed",
        "John"
      ]
    },
    {
      "key": "trolley",
      "label": "Trolley",
      "placeholder": "Enter trolley",
      "type": "select",
      "options": [
        "T-08",
        "T-11",
        "T-12",
        "T-15"
      ]
    }
  ],
  "progressStatuses": [
    "Planned",
    "Picking",
    "Completed"
  ],
  "searchPlaceholder": "Search batch picking..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
