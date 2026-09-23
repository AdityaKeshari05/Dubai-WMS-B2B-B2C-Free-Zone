'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Zone Picking",
  "description": "Organize picking by warehouse zones",
  "featureCode": "8.3",
  "columns": [
    {
      "key": "zone",
      "label": "Zone"
    },
    {
      "key": "orders",
      "label": "Orders"
    },
    {
      "key": "picker",
      "label": "Picker / Team"
    },
    {
      "key": "tasks",
      "label": "Tasks"
    },
    {
      "key": "progress",
      "label": "Progress"
    }
  ],
  "rows": [
    {
      "id": "ZONE-01",
      "zone": "Zone A",
      "orders": 22,
      "picker": "Team A",
      "tasks": 31,
      "progress": "68%",
      "status": "Picking"
    },
    {
      "id": "ZONE-02",
      "zone": "Zone B",
      "orders": 18,
      "picker": "Team B",
      "tasks": 24,
      "progress": "100%",
      "status": "Completed"
    }
  ],
  "statuses": [
    "Assigned",
    "Picking",
    "Completed"
  ],
  "primaryAction": "Create Zone Assignment",
  "modalTitle": "Create Zone Assignment",
  "fields": [
    {
      "key": "zone",
      "label": "Zone",
      "placeholder": "Enter zone",
      "type": "select",
      "options": [
        "Zone A",
        "Zone B",
        "Zone C",
        "Zone D"
      ]
    },
    {
      "key": "orders",
      "label": "Orders",
      "placeholder": "Enter orders",
      "type": "number"
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
        "Unassigned"
      ]
    },
    {
      "key": "tasks",
      "label": "Tasks",
      "placeholder": "Enter tasks",
      "type": "number"
    },
    {
      "key": "progress",
      "label": "Progress",
      "placeholder": "e.g. 68%",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Assigned",
    "Picking",
    "Completed"
  ],
  "searchPlaceholder": "Search zone picking..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
