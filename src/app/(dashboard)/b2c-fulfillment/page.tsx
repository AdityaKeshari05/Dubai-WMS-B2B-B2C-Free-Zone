'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "B2C Order Management",
  "description": "Manage consumer e-commerce orders",
  "featureCode": "7.1",
  "columns": [
    {
      "key": "channel",
      "label": "Channel"
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
      "key": "payment",
      "label": "Payment"
    },
    {
      "key": "tracking",
      "label": "Tracking"
    }
  ],
  "rows": [
    {
      "id": "B2C-92018",
      "channel": "Shopify",
      "customer": "Aisha Rahman",
      "items": 3,
      "payment": "Prepaid",
      "tracking": "—",
      "status": "Picking"
    },
    {
      "id": "B2C-92019",
      "channel": "Amazon",
      "customer": "Omar Khalid",
      "items": 1,
      "payment": "COD",
      "tracking": "AWB-882910",
      "status": "Shipped"
    }
  ],
  "statuses": [
    "Imported",
    "Allocated",
    "Picking",
    "Packing",
    "Shipped"
  ],
  "primaryAction": "New B2C Order",
  "modalTitle": "New B2C Order",
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
      "key": "payment",
      "label": "Payment",
      "placeholder": "Enter payment",
      "type": "select",
      "options": [
        "Prepaid",
        "COD",
        "Postpaid"
      ]
    },
    {
      "key": "tracking",
      "label": "Tracking",
      "placeholder": "e.g. AWB-12345",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Imported",
    "Allocated",
    "Picking",
    "Packing",
    "Shipped"
  ],
  "searchPlaceholder": "Search b2c order management..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
