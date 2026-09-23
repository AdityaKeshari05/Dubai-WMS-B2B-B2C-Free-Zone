'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Customer Returns",
  "description": "Process customer return requests",
  "featureCode": "7.13",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "reason",
      "label": "Reason"
    },
    {
      "key": "condition",
      "label": "Condition"
    },
    {
      "key": "action",
      "label": "Action"
    },
    {
      "key": "refund",
      "label": "Refund"
    }
  ],
  "rows": [
    {
      "id": "RET-0091",
      "order": "B2C-91882",
      "reason": "Customer return",
      "condition": "Sellable",
      "action": "Restock",
      "refund": "AED 120",
      "status": "Pending"
    },
    {
      "id": "RET-0090",
      "order": "B2C-91773",
      "reason": "Damaged in transit",
      "condition": "Damaged",
      "action": "Replacement",
      "refund": "—",
      "status": "Completed"
    },
    {
      "id": "RET-0092",
      "order": "B2C-91999",
      "reason": "Not as magical as pictured",
      "condition": "Sellable",
      "action": "Refund",
      "refund": "AED 50",
      "status": "Pending"
    },
    {
      "id": "RET-0093",
      "order": "B2C-92001",
      "reason": "Wrong item (received a potato instead)",
      "condition": "Unsellable",
      "action": "Replacement",
      "refund": "—",
      "status": "Inspected"
    }
  ],
  "statuses": [
    "Pending",
    "Inspected",
    "Completed"
  ],
  "primaryAction": "Create Return",
  "modalTitle": "Create Return",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. B2C-91882",
      "type": "text"
    },
    {
      "key": "reason",
      "label": "Reason",
      "placeholder": "Enter reason",
      "type": "select",
      "options": [
        "Customer return",
        "Damaged in transit",
        "Wrong item",
        "Other"
      ]
    },
    {
      "key": "condition",
      "label": "Condition",
      "placeholder": "Enter condition",
      "type": "select",
      "options": [
        "Sellable",
        "Damaged",
        "Unsellable"
      ]
    },
    {
      "key": "action",
      "label": "Action",
      "placeholder": "Enter action",
      "type": "select",
      "options": [
        "Restock",
        "Replacement",
        "Refund",
        "Dispose"
      ]
    },
    {
      "key": "refund",
      "label": "Refund",
      "placeholder": "e.g. AED 120",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Inspected",
    "Completed"
  ],
  "searchPlaceholder": "Search customer returns..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
