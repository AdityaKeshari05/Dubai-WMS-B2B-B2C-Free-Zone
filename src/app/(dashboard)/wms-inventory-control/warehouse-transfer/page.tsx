'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Warehouse Transfer",
  "description": "Transfer inventory between warehouses",
  "featureCode": "5.4",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "from",
      "label": "From Warehouse"
    },
    {
      "key": "to",
      "label": "To Warehouse"
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
      "id": "WT-00121",
      "sku": "SKU-10023",
      "from": "Free Zone",
      "to": "Dubai Main",
      "qty": 18,
      "reference": "WH-MOVE-71",
      "status": "In Transit"
    },
    {
      "id": "WT-00120",
      "sku": "SKU-10021",
      "from": "Dubai Main",
      "to": "Overflow",
      "qty": 40,
      "reference": "WH-MOVE-70",
      "status": "Completed"
    }
  ],
  "statuses": [
    "Draft",
    "In Transit",
    "Completed"
  ],
  "primaryAction": "New Warehouse Transfer",
  "modalTitle": "New Warehouse Transfer",
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
      "label": "From Warehouse",
      "placeholder": "Enter from warehouse",
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
      "label": "To Warehouse",
      "placeholder": "Enter to warehouse",
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
  "searchPlaceholder": "Search warehouse transfer..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
