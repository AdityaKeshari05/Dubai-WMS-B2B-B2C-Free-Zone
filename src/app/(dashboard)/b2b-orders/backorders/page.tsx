'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Backorders",
  "description": "Track quantities awaiting inventory",
  "featureCode": "6.6",
  "columns": [
    {
      "key": "order",
      "label": "Order"
    },
    {
      "key": "customer",
      "label": "Customer"
    },
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "backorderQty",
      "label": "Backorder Qty"
    },
    {
      "key": "eta",
      "label": "Expected Stock"
    }
  ],
  "rows": [
    {
      "id": "BO-001",
      "order": "SO-B2B-1828",
      "customer": "Metro Trading",
      "sku": "SKU-10023",
      "backorderQty": 32,
      "eta": "26 Sep 2026",
      "status": "Pending"
    },
    {
      "id": "BO-002",
      "order": "SO-B2B-1831",
      "customer": "Gulf Wholesale",
      "sku": "SKU-10024",
      "backorderQty": 184,
      "eta": "29 Sep 2026",
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Allocated",
    "Completed"
  ],
  "primaryAction": "Create Backorder",
  "modalTitle": "Create Backorder",
  "fields": [
    {
      "key": "order",
      "label": "Order",
      "placeholder": "Enter order",
      "type": "select",
      "options": [
        "ORD-B2B-101",
        "ORD-B2B-102",
        "ORD-B2B-103",
        "ORD-B2B-104"
      ]
    },
    {
      "key": "customer",
      "label": "Customer",
      "placeholder": "Enter customer",
      "type": "select",
      "options": [
        "Carrefour",
        "Spinneys",
        "Lulu Hypermarket",
        "Waitrose",
        "Choithrams"
      ]
    },
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
      "key": "backorderQty",
      "label": "Backorder Qty",
      "placeholder": "Enter backorder qty",
      "type": "number"
    },
    {
      "key": "eta",
      "label": "Expected Stock",
      "placeholder": "Enter expected stock",
      "type": "date"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Allocated",
    "Completed"
  ],
  "searchPlaceholder": "Search backorders..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
