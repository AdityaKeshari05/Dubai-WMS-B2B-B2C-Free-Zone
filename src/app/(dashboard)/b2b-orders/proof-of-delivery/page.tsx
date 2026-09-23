'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Proof of Delivery",
  "description": "Record delivery completion and proof",
  "featureCode": "6.11",
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
      "key": "deliveredBy",
      "label": "Delivered By"
    },
    {
      "key": "deliveredAt",
      "label": "Delivered At"
    },
    {
      "key": "proof",
      "label": "Proof Reference"
    }
  ],
  "rows": [
    {
      "id": "POD-001",
      "order": "SO-B2B-1818",
      "customer": "Metro Trading",
      "deliveredBy": "Driver 12",
      "deliveredAt": "22 Sep 14:22",
      "proof": "POD-IMG-8821",
      "status": "Delivered"
    },
    {
      "id": "POD-002",
      "order": "SO-B2B-1821",
      "customer": "Retail Group LLC",
      "deliveredBy": "Pending",
      "deliveredAt": "—",
      "proof": "—",
      "status": "Pending"
    }
  ],
  "statuses": [
    "Pending",
    "Delivered"
  ],
  "primaryAction": "Record POD",
  "modalTitle": "Record POD",
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
      "key": "deliveredBy",
      "label": "Delivered By",
      "placeholder": "Enter delivered by",
      "type": "select",
      "options": [
        "Driver 12",
        "Ahmed",
        "Mohammed",
        "John",
        "Pending"
      ]
    },
    {
      "key": "deliveredAt",
      "label": "Delivered At",
      "placeholder": "Enter delivered at",
      "type": "date"
    },
    {
      "key": "proof",
      "label": "Proof Reference",
      "placeholder": "e.g. POD-IMG-8821",
      "type": "text"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Delivered"
  ],
  "searchPlaceholder": "Search proof of delivery..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
