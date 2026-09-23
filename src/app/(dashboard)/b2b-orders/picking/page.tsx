'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "B2B Picking",
  "description": "Execute bulk B2B picking tasks",
  "featureCode": "6.8",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "picker",
      "label": "Picker / Team"
    },
    {
      "key": "pallets",
      "label": "Pallets"
    },
    {
      "key": "cartons",
      "label": "Cartons"
    },
    {
      "key": "progress",
      "label": "Progress"
    }
  ],
  "rows": [
    {
      "id": "BPICK-771",
      "order": "SO-B2B-1821",
      "picker": "Team A",
      "pallets": 6,
      "cartons": 44,
      "progress": "72%",
      "status": "Picking"
    },
    {
      "id": "BPICK-772",
      "order": "SO-B2B-1824",
      "picker": "Team B",
      "pallets": 9,
      "cartons": 68,
      "progress": "100%",
      "status": "Completed"
    },
    {
      "id": "BPICK-773",
      "order": "SO-B2B-1900",
      "picker": "Team C",
      "pallets": 1,
      "cartons": 5,
      "progress": "0%",
      "status": "Queued"
    },
    {
      "id": "BPICK-774",
      "order": "SO-B2B-1955",
      "picker": "Team D",
      "pallets": 20,
      "cartons": 150,
      "progress": "99%",
      "status": "Picking"
    }
  ],
  "statuses": [
    "Queued",
    "Picking",
    "Completed"
  ],
  "primaryAction": "Create Picking Task",
  "modalTitle": "Create Picking Task",
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
      "key": "picker",
      "label": "Picker / Team",
      "placeholder": "Enter picker / team",
      "type": "select",
      "options": [
        "Team A",
        "Team B",
        "Team C",
        "Team D"
      ]
    },
    {
      "key": "pallets",
      "label": "Pallets",
      "placeholder": "Enter pallets",
      "type": "number"
    },
    {
      "key": "cartons",
      "label": "Cartons",
      "placeholder": "Enter cartons",
      "type": "number"
    },
    {
      "key": "progress",
      "label": "Progress",
      "placeholder": "e.g. 75%",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Queued",
    "Picking",
    "Completed"
  ],
  "searchPlaceholder": "Search b2b picking..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
