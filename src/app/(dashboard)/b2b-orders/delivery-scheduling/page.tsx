'use client';

import FeaturePage, { FeaturePageConfig } from '@/components/wms/modules/FeaturePage';

const config: FeaturePageConfig = {
  "title": "Delivery Scheduling",
  "description": "Schedule B2B customer delivery windows",
  "featureCode": "6.10",
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
      "key": "date",
      "label": "Delivery Date"
    },
    {
      "key": "window",
      "label": "Time Window"
    },
    {
      "key": "vehicle",
      "label": "Vehicle"
    }
  ],
  "rows": [
    {
      "id": "DEL-001",
      "order": "SO-B2B-1821",
      "customer": "Retail Group LLC",
      "date": "23 Sep 2026",
      "window": "10:00–12:00",
      "vehicle": "DXB-TRK-18",
      "status": "Scheduled"
    },
    {
      "id": "DEL-002",
      "order": "SO-B2B-1824",
      "customer": "Dubai Stores PJSC",
      "date": "23 Sep 2026",
      "window": "12:00–14:00",
      "vehicle": "DXB-TRK-22",
      "status": "Scheduled"
    },
    {
      "id": "DEL-003",
      "order": "SO-B2B-1840",
      "customer": "Spinneys",
      "date": "24 Sep 2026",
      "window": "08:00–10:00",
      "vehicle": "Van-01 (DXB)",
      "status": "Scheduled"
    },
    {
      "id": "DEL-004",
      "order": "SO-B2B-1845",
      "customer": "Lulu Hypermarket",
      "date": "24 Sep 2026",
      "window": "14:00–16:00",
      "vehicle": "Reefer-01",
      "status": "Dispatched"
    },
    {
      "id": "DEL-005",
      "order": "SO-B2B-1850",
      "customer": "Carrefour",
      "date": "25 Sep 2026",
      "window": "10:00–12:00",
      "vehicle": "Truck-04 (SHJ)",
      "status": "Delivered"
    }
  ],
  "statuses": [
    "Scheduled",
    "Dispatched",
    "Delivered"
  ],
  "primaryAction": "Schedule Delivery",
  "modalTitle": "Schedule Delivery",
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
      "key": "date",
      "label": "Delivery Date",
      "placeholder": "Enter delivery date",
      "type": "date"
    },
    {
      "key": "window",
      "label": "Time Window",
      "placeholder": "e.g. 10:00-12:00",
      "type": "text"
    },
    {
      "key": "vehicle",
      "label": "Vehicle",
      "placeholder": "Enter vehicle",
      "type": "select",
      "options": [
        "Van-01 (DXB)",
        "Truck-04 (SHJ)",
        "Van-02 (AUH)",
        "Reefer-01"
      ]
    }
  ],
  "progressStatuses": [
    "Scheduled",
    "Dispatched",
    "Delivered"
  ],
  "searchPlaceholder": "Search delivery scheduling..."
};

export default function Page() {
  return <FeaturePage config={config} />;
}
