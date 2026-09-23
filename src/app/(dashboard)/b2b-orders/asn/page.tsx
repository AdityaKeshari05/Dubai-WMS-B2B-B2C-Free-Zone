'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "ASN for Customers",
  "description": "Prepare advance shipment notices for customers",
  "featureCode": "6.7",
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
      "key": "shipment",
      "label": "Shipment"
    },
    {
      "key": "packages",
      "label": "Packages"
    },
    {
      "key": "scheduled",
      "label": "Scheduled"
    }
  ],
  "rows": [
    {
      "id": "ASN-001",
      "order": "SO-B2B-1821",
      "customer": "Retail Group LLC",
      "shipment": "SHP-00881",
      "packages": 46,
      "scheduled": "23 Sep 11:30",
      "status": "Generated"
    },
    {
      "id": "ASN-002",
      "order": "SO-B2B-1824",
      "customer": "Dubai Stores PJSC",
      "shipment": "SHP-00882",
      "packages": 68,
      "scheduled": "23 Sep 13:30",
      "status": "Pending"
    },
    {
      "id": "ASN-003",
      "order": "SO-B2B-1901",
      "customer": "Spinneys",
      "shipment": "SHP-00999",
      "packages": 12,
      "scheduled": "24 Sep 09:00",
      "status": "Generated"
    },
    {
      "id": "ASN-004",
      "order": "SO-B2B-1922",
      "customer": "Lulu Hypermarket",
      "shipment": "SHP-01050",
      "packages": 1,
      "scheduled": "24 Sep 14:00",
      "status": "Sent"
    }
  ],
  "statuses": [
    "Pending",
    "Generated",
    "Sent"
  ],
  "primaryAction": "Generate ASN",
  "modalTitle": "Generate ASN",
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
      "key": "shipment",
      "label": "Shipment",
      "placeholder": "Enter shipment",
      "type": "text"
    },
    {
      "key": "packages",
      "label": "Packages",
      "placeholder": "Enter packages",
      "type": "number"
    },
    {
      "key": "scheduled",
      "label": "Scheduled",
      "placeholder": "Enter scheduled",
      "type": "date"
    }
  ],
  "progressStatuses": [
    "Pending",
    "Generated",
    "Sent"
  ],
  "searchPlaceholder": "Search asn for customers..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
