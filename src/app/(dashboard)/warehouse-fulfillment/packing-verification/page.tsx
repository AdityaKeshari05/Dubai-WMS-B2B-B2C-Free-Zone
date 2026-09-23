'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Packing Verification",
  "description": "Verify packed SKU and quantities",
  "featureCode": "8.8",
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
      "key": "scanRef",
      "label": "Scan Ref"
    },
    {
      "key": "operator",
      "label": "Operator"
    }
  ],
  "rows": [
    {
      "id": "PV-001",
      "order": "B2C-92018",
      "expected": 3,
      "verified": 2,
      "scanRef": "SCAN-7721",
      "operator": "Sara",
      "status": "Packing"
    },
    {
      "id": "PV-002",
      "order": "SO-B2B-1821",
      "expected": 18,
      "verified": 18,
      "scanRef": "SCAN-7722",
      "operator": "Rashid",
      "status": "Verified"
    }
  ],
  "statuses": [
    "Waiting",
    "Packing",
    "Verified"
  ],
  "primaryAction": "Verify Package",
  "modalTitle": "Verify Package",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. B2C-92018",
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
      "key": "scanRef",
      "label": "Scan Ref",
      "placeholder": "e.g. SCAN-7721",
      "type": "text"
    },
    {
      "key": "operator",
      "label": "Operator",
      "placeholder": "Enter operator",
      "type": "select",
      "options": [
        "Sara",
        "Rashid",
        "Ahmed",
        "Mohammed"
      ]
    }
  ],
  "progressStatuses": [
    "Waiting",
    "Packing",
    "Verified"
  ],
  "searchPlaceholder": "Search packing verification..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
