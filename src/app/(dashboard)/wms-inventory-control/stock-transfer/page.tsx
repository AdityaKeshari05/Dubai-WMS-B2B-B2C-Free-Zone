'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Stock Transfer",
  "description": "Transfer stock between locations",
  "featureCode": "5.3",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "from",
      "label": "From Location"
    },
    {
      "key": "to",
      "label": "To Location"
    },
    {
      "key": "qty",
      "label": "Qty"
    },
    {
      "key": "reference",
      "label": "Reference"
    }
  ],
  "rows": [
    {
      "id": "ST-00481",
      "sku": "SKU-10021",
      "from": "A-01-02",
      "to": "PICK-01",
      "qty": 30,
      "reference": "MOVE-981",
      "status": "Completed"
    },
    {
      "id": "ST-00482",
      "sku": "SKU-10022",
      "from": "B-02-04",
      "to": "PICK-02",
      "qty": 12,
      "reference": "MOVE-982",
      "status": "In Transit"
    }
  ],
  "statuses": [
    "Draft",
    "In Transit",
    "Completed"
  ],
  "primaryAction": "New Stock Transfer",
  "modalTitle": "New Stock Transfer",
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
      "key": "from",
      "label": "From Location",
      "placeholder": "Enter from location",
      "type": "select",
      "options": [
        "Dubai Main",
        "Free Zone",
        "Jebel Ali",
        "Sharjah",
        "Abu Dhabi Hub"
      ]
    },
    {
      "key": "to",
      "label": "To Location",
      "placeholder": "Enter to location",
      "type": "select",
      "options": [
        "Dubai Main",
        "Free Zone",
        "Jebel Ali",
        "Sharjah",
        "Abu Dhabi Hub"
      ]
    },
    {
      "key": "qty",
      "label": "Qty",
      "placeholder": "Enter qty",
      "type": "number"
    },
    {
      "key": "reference",
      "label": "Reference",
      "placeholder": "Enter reference",
      "type": "select",
      "options": [
        "REF-001",
        "REF-002",
        "REF-003",
        "REF-004"
      ]
    }
  ],
  "progressStatuses": [
    "Draft",
    "In Transit",
    "Completed"
  ],
  "searchPlaceholder": "Search stock transfer..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
