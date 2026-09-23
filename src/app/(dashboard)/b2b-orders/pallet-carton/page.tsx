'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Pallet & Carton Handling",
  "description": "Manage B2B pallets and cartons",
  "featureCode": "6.9",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "pallet",
      "label": "Pallet ID"
    },
    {
      "key": "cartons",
      "label": "Cartons"
    },
    {
      "key": "weight",
      "label": "Weight"
    },
    {
      "key": "dimensions",
      "label": "Dimensions"
    }
  ],
  "rows": [
    {
      "id": "PAL-001",
      "order": "SO-B2B-1821",
      "pallet": "PAL-77821",
      "cartons": 22,
      "weight": "418 kg",
      "dimensions": "120×100×145 cm",
      "status": "Verified"
    },
    {
      "id": "PAL-002",
      "order": "SO-B2B-1824",
      "pallet": "PAL-77822",
      "cartons": 34,
      "weight": "604 kg",
      "dimensions": "120×100×160 cm",
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Verified",
    "Loaded"
  ],
  "primaryAction": "Add Pallet",
  "modalTitle": "Add Pallet",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "Enter order",
      "type": "select",
      "options": [
        "ORD-B2B-101",
        "ORD-B2B-102",
        "ORD-B2B-103",
        "ORD-B2B-104"
      ]
    },
    {
      "key": "pallet",
      "label": "Pallet ID",
      "placeholder": "e.g. PAL-12345",
      "type": "text"
    },
    {
      "key": "cartons",
      "label": "Cartons",
      "placeholder": "Enter cartons",
      "type": "number"
    },
    {
      "key": "weight",
      "label": "Weight",
      "placeholder": "Enter weight",
      "type": "number"
    },
    {
      "key": "dimensions",
      "label": "Dimensions",
      "placeholder": "e.g. 120x80x15 cm",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Verified",
    "Loaded"
  ],
  "searchPlaceholder": "Search pallet & carton handling..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
