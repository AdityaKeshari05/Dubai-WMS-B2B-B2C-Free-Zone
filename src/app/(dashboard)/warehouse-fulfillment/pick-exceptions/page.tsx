'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Pick Exceptions",
  "description": "Handle shortage, damage and location exceptions",
  "featureCode": "8.6",
  "columns": [
    {
      "key": "task",
      "label": "Task"
    },
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "exception",
      "label": "Exception"
    },
    {
      "key": "required",
      "label": "Required"
    },
    {
      "key": "found",
      "label": "Found"
    }
  ],
  "rows": [
    {
      "id": "PEX-001",
      "task": "PICK-00873",
      "sku": "SKU-10022",
      "exception": "Shortage",
      "required": 12,
      "found": 10,
      "status": "Exception"
    },
    {
      "id": "PEX-002",
      "task": "PICK-00879",
      "sku": "SKU-10024",
      "exception": "Damaged stock",
      "required": 8,
      "status": "Pending"
    },
    {
      "id": "PEX-003",
      "task": "PICK-00910",
      "sku": "SKU-9901",
      "exception": "Location empty",
      "required": 10,
      "found": 0,
      "status": "Resolved"
    },
    {
      "id": "PEX-004",
      "task": "PICK-00911",
      "sku": "SKU-4402",
      "exception": "Other (Item is glowing)",
      "required": 1,
      "found": 1,
      "status": "Exception"
    }
  ],
  "statuses": [
    "Pending",
    "Exception",
    "Resolved"
  ],
  "primaryAction": "Log Exception",
  "modalTitle": "Log Exception",
  "fields": [
    {
      "key": "task",
      "label": "Task",
      "placeholder": "e.g. PICK-00873",
      "type": "text"
    },
    {
      "key": "sku",
      "label": "SKU",
      "placeholder": "e.g. SKU-10022",
      "type": "text"
    },
    {
      "key": "exception",
      "label": "Exception",
      "placeholder": "Enter exception",
      "type": "select",
      "options": [
        "Shortage",
        "Damaged stock",
        "Location empty",
        "Other"
      ]
    },
    {
      "key": "required",
      "label": "Required",
      "placeholder": "Enter required",
      "type": "number"
    },
    {
      "key": "found",
      "label": "Found",
      "placeholder": "Enter found",
      "type": "number"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Exception",
    "Resolved"
  ],
  "searchPlaceholder": "Search pick exceptions..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
