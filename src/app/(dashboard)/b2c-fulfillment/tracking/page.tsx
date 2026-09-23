'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Tracking Number Management",
  "description": "Manage shipment tracking references",
  "featureCode": "7.10",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "carrier",
      "label": "Carrier"
    },
    {
      "key": "tracking",
      "label": "Tracking"
    },
    {
      "key": "lastEvent",
      "label": "Last Event"
    },
    {
      "key": "updated",
      "label": "Updated"
    }
  ],
  "rows": [
    {
      "id": "TRK-001",
      "order": "B2C-92019",
      "carrier": "DHL",
      "tracking": "AWB-882910",
      "lastEvent": "In transit",
      "updated": "8 mins ago",
      "status": "Active"
    },
    {
      "id": "TRK-002",
      "order": "B2C-92020",
      "carrier": "Aramex",
      "tracking": "AWB-882920",
      "lastEvent": "Label created",
      "updated": "15 mins ago",
      "status": "Active"
    }
  ],
  "statuses": [
    "Active",
    "Delivered",
    "Exception"
  ],
  "primaryAction": "Add Tracking",
  "modalTitle": "Add Tracking",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. B2C-92019",
      "type": "text"
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
        "UPS"
      ]
    },
    {
      "key": "tracking",
      "label": "Tracking",
      "placeholder": "e.g. AWB-12345",
      "type": "text"
    },
    {
      "key": "lastEvent",
      "label": "Last Event",
      "placeholder": "e.g. In transit",
      "type": "text"
    },
    {
      "key": "updated",
      "label": "Updated",
      "placeholder": "e.g. 5 mins ago",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Active",
    "Delivered",
    "Exception"
  ],
  "searchPlaceholder": "Search tracking number management..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
