'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Wave Planning",
  "description": "Plan order waves by carrier, customer, zone or priority",
  "featureCode": "8.2",
  "columns": [
    {
      "key": "criteria",
      "label": "Criteria"
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
      "key": "carrier",
      "label": "Carrier"
    },
    {
      "key": "cutoff",
      "label": "Cutoff"
    }
  ],
  "rows": [
    {
      "id": "WW-211",
      "criteria": "Carrier cutoff",
      "orders": 54,
      "zone": "All Zones",
      "carrier": "DHL",
      "cutoff": "11:30",
      "status": "Picking"
    },
    {
      "id": "WW-212",
      "criteria": "Priority",
      "orders": 28,
      "zone": "Zone B",
      "cutoff": "12:00",
      "status": "Released"
    },
    {
      "id": "WW-213",
      "criteria": "Customer",
      "orders": 1,
      "zone": "Zone A",
      "carrier": "FedEx",
      "cutoff": "18:00",
      "status": "Planned"
    },
    {
      "id": "WW-214",
      "criteria": "Zone",
      "orders": 99,
      "zone": "Zone C",
      "carrier": "Mixed",
      "cutoff": "15:00",
      "status": "Completed"
    }
  ],
  "statuses": [
    "Planned",
    "Released",
    "Picking",
    "Completed"
  ],
  "primaryAction": "Plan Wave",
  "modalTitle": "Plan Wave",
  "fields": [
    {
      "key": "criteria",
      "label": "Criteria",
      "placeholder": "Enter criteria",
      "type": "select",
      "options": [
        "Carrier cutoff",
        "Priority",
        "Zone",
        "Customer"
      ]
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
        "All Zones",
        "Zone A",
        "Zone B",
        "Zone C"
      ]
    },
    {
      "key": "carrier",
      "label": "Carrier",
      "placeholder": "Enter carrier",
      "type": "select",
      "options": [
        "DHL",
        "Aramex",
        "FedEx",
        "UPS",
        "Mixed"
      ]
    },
    {
      "key": "cutoff",
      "label": "Cutoff",
      "placeholder": "e.g. 11:30",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Planned",
    "Released",
    "Picking",
    "Completed"
  ],
  "searchPlaceholder": "Search wave planning..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
