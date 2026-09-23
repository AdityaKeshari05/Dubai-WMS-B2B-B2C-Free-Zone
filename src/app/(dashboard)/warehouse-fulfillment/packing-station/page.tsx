'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Packing Station",
  "description": "Manage packing station workload",
  "featureCode": "8.7",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "station",
      "label": "Station"
    },
    {
      "key": "skuCount",
      "label": "SKU Count"
    },
    {
      "key": "verified",
      "label": "Verified"
    },
    {
      "key": "operator",
      "label": "Operator"
    }
  ],
  "rows": [
    {
      "id": "PKS-0091",
      "order": "SO-B2B-1821",
      "station": "Station 1",
      "skuCount": 18,
      "verified": 18,
      "operator": "Rashid",
      "status": "Completed"
    },
    {
      "id": "PKS-0092",
      "order": "B2C-92018",
      "station": "Station 2",
      "skuCount": 3,
      "verified": 2,
      "operator": "Sara",
      "status": "Packing"
    }
  ],
  "statuses": [
    "Waiting",
    "Packing",
    "Completed"
  ],
  "primaryAction": "Create Packing Task",
  "modalTitle": "Create Packing Task",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "e.g. SO-B2B-1821",
      "type": "text"
    },
    {
      "key": "station",
      "label": "Station",
      "placeholder": "Enter station",
      "type": "select",
      "options": [
        "Station 1",
        "Station 2",
        "Station 3",
        "Station 4"
      ]
    },
    {
      "key": "skuCount",
      "label": "SKU Count",
      "placeholder": "Enter sku count",
      "type": "number"
    },
    {
      "key": "verified",
      "label": "Verified",
      "placeholder": "Enter verified",
      "type": "number"
    },
    {
      "key": "operator",
      "label": "Operator",
      "placeholder": "Enter operator",
      "type": "select",
      "options": [
        "Rashid",
        "Sara",
        "Ahmed",
        "Mohammed"
      ]
    }
  ],
  "progressStatuses": [
    "Waiting",
    "Packing",
    "Completed"
  ],
  "searchPlaceholder": "Search packing station..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
