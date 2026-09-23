'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Damaged Stock",
  "description": "Maintain separate stock status for damaged inventory",
  "featureCode": "5.12",
  "columns": [
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "qty",
      "label": "Damaged Qty"
    },
    {
      "key": "source",
      "label": "Source Bin"
    },
    {
      "key": "location",
      "label": "Damage / Quarantine Bin"
    },
    {
      "key": "reason",
      "label": "Reason"
    },
    {
      "key": "disposition",
      "label": "Disposition"
    }
  ],
  "rows": [
    {
      "id": "DMG-0031",
      "sku": "SKU-10024",
      "qty": 14,
      "source": "A-04-02",
      "location": "Q-01-02",
      "reason": "Broken packaging",
      "disposition": "Awaiting disposal",
      "status": "Quarantine"
    },
    {
      "id": "DMG-0030",
      "sku": "SKU-10018",
      "qty": 4,
      "source": "FZ-02-01",
      "location": "Q-FZ-01",
      "reason": "Water damage",
      "disposition": "Supplier return",
      "status": "Damaged"
    }
  ],
  "statuses": [
    "Quarantine",
    "Damaged",
    "Released",
    "Disposed"
  ],
  "primaryAction": "Record Damaged Stock",
  "modalTitle": "Record Damaged Stock",
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
      "label": "Damaged Qty",
      "placeholder": "Enter damaged qty",
      "type": "number"
    },
    {
      "key": "source",
      "label": "Source Bin",
      "placeholder": "Enter source bin",
      "type": "text"
    },
    {
      "key": "location",
      "label": "Damage / Quarantine Bin",
      "placeholder": "Enter damage / quarantine bin",
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
      "key": "disposition",
      "label": "Disposition",
      "placeholder": "Enter disposition",
      "type": "select",
      "options": [
        "Discard",
        "Return to Vendor",
        "Repackage",
        "Sell at Discount"
      ]
    }
  ],
  "progressStatuses": [
    "Quarantine",
    "Damaged",
    "Released",
    "Disposed"
  ],
  "searchPlaceholder": "Search damaged stock..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
