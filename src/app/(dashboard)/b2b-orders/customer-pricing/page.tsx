'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Customer Pricing",
  "description": "Maintain customer-specific commercial pricing",
  "featureCode": "6.3",
  "columns": [
    {
      "key": "customer",
      "label": "Customer"
    },
    {
      "key": "sku",
      "label": "SKU"
    },
    {
      "key": "price",
      "label": "Price"
    },
    {
      "key": "uom",
      "label": "UOM"
    },
    {
      "key": "validity",
      "label": "Validity"
    }
  ],
  "rows": [
    {
      "id": "PRICE-001",
      "customer": "Retail Group LLC",
      "sku": "SKU-10021",
      "price": "AED 82.00",
      "uom": "Case",
      "validity": "31 Dec 2026",
      "status": "Active"
    },
    {
      "id": "PRICE-002",
      "customer": "Dubai Stores PJSC",
      "sku": "SKU-10022",
      "price": "AED 57.50",
      "uom": "Carton",
      "validity": "31 Dec 2026",
      "status": "Active"
    }
  ],
  "statuses": [
    "Active",
    "Expired"
  ],
  "primaryAction": "Add Customer Price",
  "modalTitle": "Add Customer Price",
  "fields": [
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
      "key": "price",
      "label": "Price",
      "placeholder": "Enter price",
      "type": "number"
    },
    {
      "key": "uom",
      "label": "UOM",
      "placeholder": "Enter uom",
      "type": "text"
    },
    {
      "key": "validity",
      "label": "Validity",
      "type": "date"
    }
  ],
  "progressStatuses": [
    "Active",
    "Expired"
  ],
  "searchPlaceholder": "Search customer pricing..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
