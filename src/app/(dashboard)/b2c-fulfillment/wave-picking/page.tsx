'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Wave Picking",
  "description": "Group multiple B2C orders into picking waves",
  "featureCode": "7.5",
  "columns": [
    {
      "key": "wave",
      "label": "Wave"
    },
    {
      "key": "orders",
      "label": "Orders"
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
      "key": "priority",
      "label": "Priority"
    }
  ],
  "rows": [
    {
      "id": "WAVE-091",
      "wave": "Morning 1",
      "orders": 42,
      "zone": "All",
      "picker": "Team A",
      "priority": "Carrier cutoff",
      "status": "Picking"
    },
    {
      "id": "WAVE-092",
      "wave": "Priority 2",
      "orders": 36,
      "zone": "Zone B",
      "picker": "Team B",
      "priority": "Priority",
      "status": "Released"
    },
    {
      "id": "WAVE-093",
      "wave": "Afternoon 1",
      "orders": 120,
      "zone": "Zone C",
      "picker": "Team C",
      "priority": "Standard",
      "status": "Planned"
    }
  ],
  "statuses": [
    "Planned",
    "Released",
    "Picking",
    "Completed"
  ],
  "primaryAction": "Create Wave",
  "modalTitle": "Create Wave",
  "fields": [
    {
      "key": "wave",
      "label": "Wave",
      "placeholder": "Enter wave",
      "type": "text"
    },
    {
      "key": "orders",
      "label": "Orders",
      "placeholder": "Enter orders",
      "type": "number"
    },
    {
      "key": "zone",
      "label": "Zone",
      "placeholder": "Enter zone",
      "type": "select",
      "options": [
        "All",
        "Zone A",
        "Zone B",
        "Zone C"
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
        "Team D"
      ]
    },
    {
      "key": "priority",
      "label": "Priority",
      "placeholder": "Enter priority",
      "type": "select",
      "options": [
        "Carrier cutoff",
        "Priority",
        "Standard"
      ]
    }
  ],
  "progressStatuses": [
    "Planned",
    "Released",
    "Picking",
    "Completed"
  ],
  "searchPlaceholder": "Search wave picking..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
