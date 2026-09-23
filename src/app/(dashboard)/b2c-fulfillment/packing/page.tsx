'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Packing Workflow",
  "description": "Verify picked items and pack B2C orders",
  "featureCode": "7.8",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "expected",
      "label": "Expected"
    },
    {
      "key": "verified",
      "label": "Verified"
    },
    {
      "key": "box",
      "label": "Box"
    },
    {
      "key": "station",
      "label": "Station"
    }
  ],
  "rows": [
    {
      "id": "PACK-7712",
      "order": "B2C-92018",
      "expected": 3,
      "verified": 1,
      "box": "Small Box",
      "station": "P-02",
      "status": "Verifying"
    },
    {
      "id": "PACK-7713",
      "order": "B2C-92020",
      "expected": 2,
      "verified": 2,
      "station": "P-03",
      "status": "Completed"
    },
    {
      "id": "PACK-7714",
      "order": "B2C-93000",
      "expected": 5,
      "verified": 5,
      "box": "Large Box",
      "station": "P-01",
      "status": "Completed"
    },
    {
      "id": "PACK-7715",
      "order": "B2C-93005",
      "expected": 10,
      "verified": 0,
      "box": "Custom Box",
      "station": "P-04",
      "status": "Waiting"
    }
  ],
  "statuses": [
    "Waiting",
    "Verifying",
    "Completed"
  ],
  "primaryAction": "Create Packing Task",
  "modalTitle": "Create Packing Task",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "Enter order",
      "type": "text"
    },
    {
      "key": "expected",
      "label": "Expected",
      "placeholder": "Enter expected",
      "type": "number"
    },
    {
      "key": "verified",
      "label": "Verified",
      "placeholder": "Enter verified",
      "type": "number"
    },
    {
      "key": "box",
      "label": "Box",
      "placeholder": "Enter box",
      "type": "select",
      "options": [
        "Small Box",
        "Medium Box",
        "Large Box",
        "Custom Box"
      ]
    },
    {
      "key": "station",
      "label": "Station",
      "placeholder": "Enter station",
      "type": "select",
      "options": [
        "P-01",
        "P-02",
        "P-03",
        "P-04"
      ]
    }
  ],
  "progressStatuses": [
    "Waiting",
    "Verifying",
    "Completed"
  ],
  "searchPlaceholder": "Search packing workflow..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
