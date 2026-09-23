'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Batch Picking",
  "description": "Pick multiple orders together",
  "featureCode": "8.4",
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
      "key": "picker",
      "label": "Picker"
    },
    {
      "key": "container",
      "label": "Container"
    },
    {
      "key": "progress",
      "label": "Progress"
    }
  ],
  "rows": [
    {
      "id": "WBATCH-31",
      "batch": "Warehouse Batch 31",
      "orders": 26,
      "picker": "Sara",
      "container": "Trolley T-08",
      "progress": "54%",
      "status": "Picking"
    },
    {
      "id": "WBATCH-30",
      "batch": "Warehouse Batch 30",
      "orders": 20,
      "picker": "Ahmed",
      "container": "Trolley T-04",
      "progress": "100%",
      "status": "Completed"
    }
  ],
  "statuses": [
    "Planned",
    "Picking",
    "Completed"
  ],
  "primaryAction": "Create Picking Batch",
  "modalTitle": "Create Picking Batch",
  "fields": [
    {
      "key": "batch",
      "label": "Batch",
      "placeholder": "e.g. Warehouse Batch 31",
      "type": "text"
    },
    {
      "key": "orders",
      "label": "Orders",
      "placeholder": "Enter orders",
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
      "key": "container",
      "label": "Container",
      "placeholder": "Enter container",
      "type": "select",
      "options": [
        "Trolley T-08",
        "Trolley T-04",
        "Bin-01",
        "Bin-02"
      ]
    },
    {
      "key": "progress",
      "label": "Progress",
      "placeholder": "e.g. 54%",
      "type": "text"
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
