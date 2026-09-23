'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Pick Confirmation",
  "description": "Confirm picked quantity and location",
  "featureCode": "8.5",
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
      "key": "required",
      "label": "Required"
    },
    {
      "key": "picked",
      "label": "Picked"
    },
    {
      "key": "location",
      "label": "Location"
    }
  ],
  "rows": [
    {
      "id": "CONF-001",
      "task": "PICK-00871",
      "sku": "SKU-10021",
      "required": 30,
      "picked": 30,
      "location": "A-01-02",
      "status": "Verified"
    },
    {
      "id": "CONF-002",
      "task": "PICK-00873",
      "sku": "SKU-10022",
      "required": 12,
      "picked": 10,
      "status": "Exception"
    },
    {
      "id": "CONF-003",
      "task": "PICK-00899",
      "sku": "SKU-9901",
      "required": 100,
      "picked": 100,
      "location": "C-05-10",
      "status": "Verified"
    },
    {
      "id": "CONF-004",
      "task": "PICK-00900",
      "sku": "SKU-4402",
      "required": 5,
      "picked": 0,
      "location": "D-01-01",
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Verified",
    "Exception"
  ],
  "primaryAction": "Confirm Pick",
  "modalTitle": "Confirm Pick",
  "fields": [
    {
      "key": "task",
      "label": "Task",
      "placeholder": "e.g. PICK-00871",
      "type": "text"
    },
    {
      "key": "sku",
      "label": "SKU",
      "placeholder": "e.g. SKU-10021",
      "type": "text"
    },
    {
      "key": "required",
      "label": "Required",
      "placeholder": "Enter required",
      "type": "number"
    },
    {
      "key": "picked",
      "label": "Picked",
      "placeholder": "Enter picked",
      "type": "number"
    },
    {
      "key": "location",
      "label": "Location",
      "placeholder": "e.g. A-01-02",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Verified",
    "Exception"
  ],
  "searchPlaceholder": "Search pick confirmation..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
