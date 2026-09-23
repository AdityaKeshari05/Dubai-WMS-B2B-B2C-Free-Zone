'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "E-Commerce Order Import",
  "description": "Import orders from e-commerce channels",
  "featureCode": "7.2",
  "columns": [
    {
      "key": "channel",
      "label": "Channel"
    },
    {
      "key": "externalOrder",
      "label": "External Order"
    },
    {
      "key": "customer",
      "label": "Customer"
    },
    {
      "key": "items",
      "label": "Items"
    },
    {
      "key": "importedAt",
      "label": "Imported At"
    }
  ],
  "rows": [
    {
      "id": "IMP-001",
      "channel": "Shopify",
      "externalOrder": "SH-88120",
      "customer": "Aisha Rahman",
      "items": 3,
      "importedAt": "23 Sep 09:20",
      "status": "Imported"
    },
    {
      "id": "IMP-002",
      "channel": "Noon",
      "externalOrder": "NN-44109",
      "customer": "Fatima Ali",
      "items": 2,
      "importedAt": "23 Sep 09:31",
      "status": "Imported"
    },
    {
      "id": "IMP-003",
      "channel": "Magento",
      "externalOrder": "MG-9022",
      "customer": "Sara Khalifa",
      "items": 12,
      "importedAt": "24 Sep 11:00",
      "status": "Validated"
    },
    {
      "id": "IMP-004",
      "channel": "Amazon",
      "externalOrder": "AMZ-912233",
      "customer": "Mohammed Al Maktoum",
      "items": 1,
      "importedAt": "24 Sep 11:15",
      "status": "Allocated"
    }
  ],
  "statuses": [
    "Imported",
    "Validated",
    "Allocated"
  ],
  "primaryAction": "Import Order",
  "modalTitle": "Import Order",
  "fields": [
    {
      "key": "channel",
      "label": "Channel",
      "placeholder": "Enter channel",
      "type": "select",
      "options": [
        "Shopify",
        "Amazon",
        "Noon",
        "WooCommerce",
        "Magento"
      ]
    },
    {
      "key": "externalOrder",
      "label": "External Order",
      "placeholder": "e.g. SH-88120",
      "type": "text"
    },
    {
      "key": "customer",
      "label": "Customer",
      "placeholder": "Enter customer",
      "type": "text"
    },
    {
      "key": "items",
      "label": "Items",
      "placeholder": "Enter items",
      "type": "number"
    },
    {
      "key": "importedAt",
      "label": "Imported At",
      "placeholder": "Enter imported at",
      "type": "date"
    }
  ],
  "progressStatuses": [
    "Imported",
    "Validated",
    "Allocated"
  ],
  "searchPlaceholder": "Search e-commerce order import..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
