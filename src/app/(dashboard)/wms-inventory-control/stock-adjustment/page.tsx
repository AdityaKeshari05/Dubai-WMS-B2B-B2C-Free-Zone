'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Stock Adjustment",
  "description": "Increase or decrease stock with authorization",
  "featureCode": "5.5",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "qty",
      "label": "Adjustment Qty"
    },
    {
      "key": "reason",
      "label": "Reason"
    },
    {
      "key": "requestedBy",
      "label": "Requested By"
    },
    {
      "key": "approval",
      "label": "Approval"
    }
  ],
  "rows": [
    {
      "id": "ADJ-0048",
      "sku": "SKU-10022",
      "qty": -4,
      "reason": "Damaged during handling",
      "requestedBy": "Ahmed",
      "approval": "Supervisor",
      "status": "Pending Approval"
    },
    {
      "id": "ADJ-0047",
      "sku": "SKU-10021",
      "qty": 8,
      "reason": "Count correction",
      "requestedBy": "Sara",
      "approval": "Manager",
      "status": "Approved"
    },
    {
      "id": "ADJ-0049",
      "sku": "SKU-9901",
      "qty": -15,
      "reason": "Expired",
      "requestedBy": "Mohammed",
      "approval": "Supervisor",
      "status": "Pending Approval"
    },
    {
      "id": "ADJ-0050",
      "sku": "SKU-4402",
      "qty": 20,
      "reason": "Inventory Adjustment",
      "requestedBy": "Fatima",
      "approval": "Manager",
      "status": "Approved"
    },
    {
      "id": "ADJ-0051",
      "sku": "SKU-10024",
      "qty": -2,
      "reason": "Customer Return",
      "requestedBy": "Ali",
      "approval": "Supervisor",
      "status": "Rejected"
    }
  ],
  "statuses": [
    "Pending Approval",
    "Approved",
    "Rejected"
  ],
  "primaryAction": "Request Adjustment",
  "modalTitle": "Request Adjustment",
  "fields": [
    {
      "key": "sku",
      "label": "SKU",
      "placeholder": "Enter sku",
      "type": "select",
      "options": [
        "SKU-10021",
        "SKU-10022",
        "SKU-10023",
        "SKU-10024",
        "SKU-9901",
        "SKU-4402"
      ]
    },
    {
      "key": "qty",
      "label": "Adjustment Qty",
      "placeholder": "Enter adjustment qty",
      "type": "number"
    },
    {
      "key": "reason",
      "label": "Reason",
      "placeholder": "Enter reason",
      "type": "select",
      "options": [
        "Damaged in Transit",
        "Expired",
        "Quality Check Failed",
        "Customer Return",
        "Inventory Adjustment"
      ]
    },
    {
      "key": "requestedBy",
      "label": "Requested By",
      "placeholder": "Enter requested by",
      "type": "text"
    },
    {
      "key": "approval",
      "label": "Approval",
      "placeholder": "Enter approval",
      "type": "select",
      "options": [
        "Pending Approval",
        "Approved",
        "Rejected"
      ]
    }
  ],
  "progressStatuses": [
    "Pending Approval",
    "Approved",
    "Rejected"
  ],
  "searchPlaceholder": "Search stock adjustment..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
