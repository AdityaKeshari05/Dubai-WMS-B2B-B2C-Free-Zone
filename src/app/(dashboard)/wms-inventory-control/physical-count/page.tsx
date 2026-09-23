'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Physical Stock Count",
  "description": "Conduct full inventory counts",
  "featureCode": "5.7",
  "columns": [
    {
      "key": "warehouse",
      "label": "Warehouse"
    },
    {
      "key": "countDate",
      "label": "Count Date"
    },
    {
      "key": "systemQty",
      "label": "System Qty"
    },
    {
      "key": "countedQty",
      "label": "Counted Qty"
    },
    {
      "key": "variance",
      "label": "Variance"
    }
  ],
  "rows": [
    {
      "id": "PC-00042",
      "warehouse": "Dubai Main",
      "countDate": "30 Sep 2026",
      "systemQty": 18420,
      "countedQty": "—",
      "variance": "—",
      "status": "Counting"
    },
    {
      "id": "PC-00041",
      "warehouse": "Free Zone",
      "countDate": "31 Aug 2026",
      "systemQty": 9210,
      "variance": -9,
      "status": "Completed"
    },
    {
      "id": "PC-00043",
      "warehouse": "Sharjah",
      "countDate": "01 Oct 2026",
      "systemQty": 5200,
      "countedQty": "—",
      "variance": "—",
      "status": "Scheduled"
    },
    {
      "id": "PC-00044",
      "warehouse": "Jebel Ali",
      "countDate": "15 Sep 2026",
      "systemQty": 11050,
      "countedQty": 11050,
      "variance": 0,
      "status": "Completed"
    }
  ],
  "statuses": [
    "Scheduled",
    "Counting",
    "Completed"
  ],
  "primaryAction": "Schedule Physical Count",
  "modalTitle": "Schedule Physical Count",
  "fields": [
    {
      "key": "warehouse",
      "label": "Warehouse",
      "placeholder": "Enter warehouse",
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
      "key": "countDate",
      "label": "Count Date",
      "placeholder": "Enter count date",
      "type": "date"
    },
    {
      "key": "systemQty",
      "label": "System Qty",
      "placeholder": "Enter system qty",
      "type": "number"
    },
    {
      "key": "countedQty",
      "label": "Counted Qty",
      "placeholder": "Enter counted qty",
      "type": "number"
    },
    {
      "key": "variance",
      "label": "Variance",
      "placeholder": "Enter variance",
      "type": "number"
    }
  ],
  "progressStatuses": [
    "Scheduled",
    "Counting",
    "Completed"
  ],
  "searchPlaceholder": "Search physical stock count..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
