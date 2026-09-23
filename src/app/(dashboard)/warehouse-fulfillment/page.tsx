'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Picking Task Creation",
  "description": "Create warehouse picking tasks",
  "featureCode": "8.1",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "zone",
      "label": "Zone"
    },
    {
      "key": "picker",
      "label": "Picker"
    },
    {
      "key": "required",
      "label": "Required Qty"
    },
    {
      "key": "priority",
      "label": "Priority"
    }
  ],
  "rows": [
    {
      "id": "PICK-00871",
      "order": "SO-B2B-1821",
      "zone": "Bulk A",
      "picker": "Team A",
      "required": 240,
      "priority": "Normal",
      "status": "Picking"
    },
    {
      "id": "PICK-00874",
      "order": "SO-B2B-1824",
      "zone": "Bulk B",
      "picker": "Unassigned",
      "required": 390,
      "priority": "High",
      "status": "Assigned"
    }
  ],
  "statuses": [
    "Assigned",
    "Picking",
    "Completed"
  ],
  "primaryAction": "Create Picking Task",
  "modalTitle": "Create Picking Task",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. SO-B2B-1821",
      "type": "text"
    },
    {
      "key": "zone",
      "label": "Zone",
      "placeholder": "Enter zone",
      "type": "select",
      "options": [
        "Bulk A",
        "Bulk B",
        "Bulk C",
        "Fast Pick"
      ]
    },
    {
      "key": "picker",
      "label": "Picker",
      "placeholder": "Enter picker",
      "type": "select",
      "options": [
        "Team A",
        "Team B",
        "Team C",
        "Unassigned"
      ]
    },
    {
      "key": "required",
      "label": "Required Qty",
      "placeholder": "Enter required qty",
      "type": "number"
    },
    {
      "key": "priority",
      "label": "Priority",
      "placeholder": "Enter priority",
      "type": "select",
      "options": [
        "Normal",
        "High",
        "Urgent"
      ]
    }
  ],
  "progressStatuses": [
    "Assigned",
    "Picking",
    "Completed"
  ],
  "searchPlaceholder": "Search picking task creation..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
