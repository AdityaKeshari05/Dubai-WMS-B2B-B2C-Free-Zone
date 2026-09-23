'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Single-Order Picking",
  "description": "Handle urgent or special orders individually",
  "featureCode": "7.7",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "priority",
      "label": "Priority"
    },
    {
      "key": "picker",
      "label": "Picker"
    },
    {
      "key": "items",
      "label": "Items"
    },
    {
      "key": "reason",
      "label": "Reason"
    }
  ],
  "rows": [
    {
      "id": "SINGLE-094",
      "order": "B2C-92044",
      "priority": "Urgent",
      "picker": "Ahmed",
      "items": 1,
      "reason": "VIP customer",
      "status": "Picking"
    },
    {
      "id": "SINGLE-095",
      "order": "B2C-92045",
      "priority": "High",
      "picker": "Sara",
      "items": 2,
      "reason": "Carrier cutoff",
      "status": "Completed"
    },
    {
      "id": "SINGLE-096",
      "order": "B2C-92099",
      "priority": "Normal",
      "picker": "John",
      "items": 1,
      "reason": "Replacement",
      "status": "Queued"
    }
  ],
  "statuses": [
    "Queued",
    "Picking",
    "Completed"
  ],
  "primaryAction": "Create Single Pick",
  "modalTitle": "Create Single Pick",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. B2C-92044",
      "type": "text"
    },
    {
      "key": "priority",
      "label": "Priority",
      "placeholder": "Enter priority",
      "type": "select",
      "options": [
        "Urgent",
        "High",
        "Normal"
      ]
    },
    {
      "key": "picker",
      "label": "Picker",
      "placeholder": "Enter picker",
      "type": "select",
      "options": [
        "Ahmed",
        "Sara",
        "Mohammed",
        "John"
      ]
    },
    {
      "key": "items",
      "label": "Items",
      "placeholder": "Enter items",
      "type": "number"
    },
    {
      "key": "reason",
      "label": "Reason",
      "placeholder": "Enter reason",
      "type": "select",
      "options": [
        "VIP customer",
        "Carrier cutoff",
        "Replacement",
        "Other"
      ]
    }
  ],
  "progressStatuses": [
    "Queued",
    "Picking",
    "Completed"
  ],
  "searchPlaceholder": "Search single-order picking..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
