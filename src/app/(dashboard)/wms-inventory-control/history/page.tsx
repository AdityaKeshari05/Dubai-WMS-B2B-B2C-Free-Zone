'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Inventory History",
  "description": "View complete movement history for each SKU",
  "featureCode": "5.9",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "movement",
      "label": "Movement"
    },
    {
      "key": "reference",
      "label": "Reference"
    },
    {
      "key": "qty",
      "label": "Qty"
    },
    {
      "key": "user",
      "label": "User"
    },
    {
      "key": "time",
      "label": "Date / Time"
    }
  ],
  "rows": [
    {
      "id": "HIS-901",
      "sku": "SKU-10021",
      "movement": "Receipt",
      "reference": "GRN-260921-18",
      "qty": "+120",
      "user": "Sara",
      "time": "23 Sep 09:12",
      "status": "Completed"
    },
    {
      "id": "HIS-902",
      "sku": "SKU-10021",
      "movement": "Transfer",
      "reference": "ST-00481",
      "qty": "-30",
      "user": "Ahmed",
      "time": "23 Sep 10:05",
      "status": "Completed"
    }
  ],
  "statuses": [
    "Completed"
  ],
  "primaryAction": "none",
  "modalTitle": "",
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
      "key": "movement",
      "label": "Movement",
      "placeholder": "Enter movement",
      "type": "select",
      "options": [
        "Receipt",
        "Transfer",
        "Adjustment",
        "Sale",
        "Return"
      ]
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
    },
    {
      "key": "qty",
      "label": "Qty",
      "placeholder": "Enter qty",
      "type": "number"
    },
    {
      "key": "user",
      "label": "User",
      "placeholder": "Enter user",
      "type": "text"
    },
    {
      "key": "time",
      "label": "Date / Time",
      "placeholder": "Enter date / time",
      "type": "date"
    }
  ],
  "progressStatuses": [
    "Completed"
  ],
  "searchPlaceholder": "Search inventory history..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
