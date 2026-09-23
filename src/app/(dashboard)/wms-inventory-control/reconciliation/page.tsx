'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Stock Reconciliation",
  "description": "Compare system stock against physical stock",
  "featureCode": "5.8",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "systemQty",
      "label": "System Qty"
    },
    {
      "key": "physicalQty",
      "label": "Physical Qty"
    },
    {
      "key": "variance",
      "label": "Variance"
    },
    {
      "key": "reason",
      "label": "Reason"
    }
  ],
  "rows": [
    {
      "id": "REC-0081",
      "sku": "SKU-10021",
      "systemQty": 180,
      "physicalQty": 178,
      "variance": -2,
      "reason": "Pending review",
      "status": "Pending"
    },
    {
      "id": "REC-0080",
      "sku": "SKU-10023",
      "systemQty": 68,
      "physicalQty": 68,
      "reason": "Matched",
      "status": "Reconciled"
    },
    {
      "id": "REC-0082",
      "sku": "SKU-9901",
      "systemQty": 400,
      "physicalQty": 395,
      "variance": -5,
      "reason": "Shrinkage (or snacks for employees)",
      "status": "Pending"
    },
    {
      "id": "REC-0083",
      "sku": "SKU-4402",
      "systemQty": 10,
      "physicalQty": 100,
      "variance": 90,
      "reason": "Magic cloning machine",
      "status": "Reconciled"
    }
  ],
  "statuses": [
    "Pending",
    "Reconciled"
  ],
  "primaryAction": "New Reconciliation",
  "modalTitle": "New Reconciliation",
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
      "key": "systemQty",
      "label": "System Qty",
      "placeholder": "Enter system qty",
      "type": "number"
    },
    {
      "key": "physicalQty",
      "label": "Physical Qty",
      "placeholder": "Enter physical qty",
      "type": "number"
    },
    {
      "key": "variance",
      "label": "Variance",
      "placeholder": "Enter variance",
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
    }
  ],
  "progressStatuses": [
    "Pending",
    "Reconciled"
  ],
  "searchPlaceholder": "Search stock reconciliation..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
