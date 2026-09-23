'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Shipping Label / Tracking Generation",
  "description": "Generate shipping labels and tracking numbers",
  "featureCode": "7.9",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "carrier",
      "label": "Carrier"
    },
    {
      "key": "service",
      "label": "Service"
    },
    {
      "key": "tracking",
      "label": "Tracking"
    },
    {
      "key": "label",
      "label": "Label"
    }
  ],
  "rows": [
    {
      "id": "LBL-001",
      "order": "B2C-92019",
      "carrier": "DHL",
      "service": "Express",
      "tracking": "AWB-882910",
      "label": "LBL-882910",
      "status": "Generated"
    },
    {
      "id": "LBL-002",
      "order": "B2C-92020",
      "carrier": "Aramex",
      "service": "Domestic",
      "tracking": "—",
      "label": "—",
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Generated",
    "Printed"
  ],
  "primaryAction": "Generate Label",
  "modalTitle": "Generate Label",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "Enter order",
      "type": "text"
    },
    {
      "key": "carrier",
      "label": "Carrier",
      "placeholder": "Enter carrier",
      "type": "select",
      "options": [
        "DHL",
        "Aramex",
        "FedEx",
        "UPS",
        "Local Courier"
      ]
    },
    {
      "key": "service",
      "label": "Service",
      "placeholder": "Enter service",
      "type": "select",
      "options": [
        "Express",
        "Standard",
        "Domestic",
        "Same-Day"
      ]
    },
    {
      "key": "tracking",
      "label": "Tracking",
      "placeholder": "e.g. AWB-12345",
      "type": "text"
    },
    {
      "key": "label",
      "label": "Label",
      "placeholder": "e.g. LBL-12345",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Generated",
    "Printed"
  ],
  "searchPlaceholder": "Search shipping label / tracking generation..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
