'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "RTO Management",
  "description": "Manage return-to-origin shipments",
  "featureCode": "7.12",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "tracking",
      "label": "Tracking"
    },
    {
      "key": "reason",
      "label": "Reason"
    },
    {
      "key": "received",
      "label": "Received Back"
    },
    {
      "key": "action",
      "label": "Action"
    }
  ],
  "rows": [
    {
      "id": "RTO-0074",
      "order": "B2C-92021",
      "tracking": "AWB-882911",
      "reason": "Failed delivery",
      "received": "No",
      "action": "Awaiting return",
      "status": "In Transit"
    },
    {
      "id": "RTO-0073",
      "order": "B2C-91977",
      "tracking": "AWB-882811",
      "reason": "Customer refused",
      "received": "Yes",
      "action": "Restock",
      "status": "Completed"
    }
  ],
  "statuses": [
    "In Transit",
    "Received",
    "Completed"
  ],
  "primaryAction": "Create RTO",
  "modalTitle": "Create RTO",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. B2C-92021",
      "type": "text"
    },
    {
      "key": "tracking",
      "label": "Tracking",
      "placeholder": "e.g. AWB-882911",
      "type": "text"
    },
    {
      "key": "reason",
      "label": "Reason",
      "placeholder": "Enter reason",
      "type": "select",
      "options": [
        "Failed delivery",
        "Customer refused",
        "Invalid address"
      ]
    },
    {
      "key": "received",
      "label": "Received Back",
      "placeholder": "Enter received back",
      "type": "select",
      "options": [
        "Yes",
        "No"
      ]
    },
    {
      "key": "action",
      "label": "Action",
      "placeholder": "Enter action",
      "type": "select",
      "options": [
        "Awaiting return",
        "Restock",
        "Dispose"
      ]
    }
  ],
  "progressStatuses": [
    "In Transit",
    "Received",
    "Completed"
  ],
  "searchPlaceholder": "Search rto management..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
